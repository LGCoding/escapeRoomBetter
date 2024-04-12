import { type Prisma, type PrismaClient } from "@prisma/client";
import { type DefaultArgs } from "@prisma/client/runtime/library";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  createSaltHash,
  decrypt,
  encrypt,
  isPasswordCorrect,
} from "~/server/util/encrypt";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import NodeMailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { env } from "~/env";
import { createObjectFromJson, userSchema } from "~/server/util/schemaValidate";
import { linkStartPaths } from "./users";

export interface Session {
  id: string;
  userId: string;
  role: "ADMIN" | "USER";
}

async function sendEmail(
  to: string,
  subject: string,
  text: string,
  link: string | undefined,
) {
  const transportOptions: SMTPTransport.Options = {
    service: "gmail",
    auth: {
      user: env.EMAIL,
      pass: env.EMAIL_PASSWORD,
    },
    logger: true,
  };

  const transporter = NodeMailer.createTransport(transportOptions);
  await new Promise((resolve, reject) => {
    // verify connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("Server is ready to take our messages");
        resolve(success);
      }
    });
  });

  const mailOptions: Mail.Options = {
    from: "escapestseb@gmail.com", // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: `<p>${text} ${link ? `<a href="${link}">Here</a>` : ""}</p>`, // plain text body
  };
  await new Promise((resolve, reject) => {
    // send mail
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log(info);
        resolve(info);
      }
    });
  });
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export const loginRouter = createTRPCRouter({
  checkSession: publicProcedure
    .input(z.object({ session: z.string() }))
    .query(async ({ ctx }) => {
      if (ctx.session?.userId) {
        return { valid: true, isAdmin: ctx.session.role === "ADMIN" };
      } else {
        return { valid: false, isAdmin: false };
      }
    }),
  sendRegisterEmail: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          email: input.email,
        },
      });
      if (!user) {
        console.log(
          `http://localhost:3000/register?data=${encrypt(JSON.stringify(input))}`,
        );
        await sendEmail(
          input.email,
          "Register User",
          "Use this link to register your email ",
          env.NODE_ENV === "development"
            ? `http://localhost:3000/register?data=${encrypt(JSON.stringify(input))}`
            : `https://escapestsebs.com/register?data=${encrypt(JSON.stringify(input))}`,
        );
        return true;
      } else {
        return false;
      }
    }),
  registerUser: publicProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        const decryptedUser = createObjectFromJson(userSchema, decrypt(input));

        const user = await ctx.db.user.findFirst({
          where: {
            email: decryptedUser.email,
          },
        });
        if (!user) {
          const saltHash = createSaltHash(decryptedUser.password);
          const user = await ctx.db.user.create({
            data: {
              name: decryptedUser.name,
              email: decryptedUser.email,
              salt: saltHash.salt,
              password: saltHash.hash,
              role: "USER",
            },
          });
          await linkStartPaths(ctx.db, user.id);
          if (user.role === "ADMIN" || user.role === "USER") {
            const session = await createSession(ctx, user.id, user.role);
            const encoded = encrypt(JSON.stringify(session));

            return { wasError: false, data: encoded };
          }
          return { wasError: true, data: "Someone screwed up the role" };
        } else {
          return {
            wasError: true,
            data: "Either link has already been used or it's invalid",
          };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
  loginUser: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          email: input.email,
        },
        select: {
          id: true,
          sessions: true,
          password: true,
          role: true,
          salt: true,
        },
      });
      if (user && isPasswordCorrect(user.password, user.salt, input.password)) {
        if (user.sessions) {
          await ctx.db.session.delete({
            where: {
              userId: user.id,
              id: user.sessions.id,
            },
          });
        }
        if (user.role === "ADMIN" || user.role === "USER") {
          const session = await createSession(ctx, user?.id, user.role);
          const encoded = encrypt(JSON.stringify(session));
          return { wasError: false, data: encoded };
        }
        return { wasError: true, data: "Someone screwed up the role" };
      } else {
        return { wasError: true, data: "That username or password is wrong" };
      }
    }),
  resetPasswordEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          email: input.email,
        },
        select: {
          id: true,
        },
      });
      if (user) {
        try {
          const id = getRandomInt(10000);
          await ctx.db.user.update({
            where: {
              email: input.email,
            },
            data: {
              resetId: id,
              resetExpired: new Date(new Date().getTime() + 300000),
            },
          });
          await sendEmail(
            input.email,
            "Reset Password",
            "Use this link to reset your password you have ",
            env.NODE_ENV === "development"
              ? `http://localhost:3000/resetpassword?data=${encrypt(JSON.stringify({ email: input.email, resetId: id }))}`
              : `https://escapestsebs.com/resetpassword?data=${encrypt(JSON.stringify({ email: input.email, resetId: id }))}`,
          );
          return { wasError: false, data: "Failed to create new reset" };
        } catch (error) {
          return { wasError: true, data: "Failed to create new reset" };
        }
      } else {
        return { wasError: true, data: "That username does not exist" };
      }
    }),
  resetPassword: publicProcedure
    .input(
      z.object({
        password: z.string(),
        data: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const resetInfo = createObjectFromJson(
          resetSchema,
          decrypt(input.data),
        );
        const user = await ctx.db.user.findFirst({
          where: {
            email: resetInfo.email,
          },
          select: {
            email: true,
            resetExpired: true,
            resetId: true,
          },
        });

        if (
          user &&
          resetInfo.resetId === user.resetId &&
          user.resetId !== null &&
          user.resetId !== undefined
        ) {
          if (
            user.resetExpired &&
            new Date().getTime() < user.resetExpired.getTime()
          ) {
            return { wasError: true, data: "Link Expired" };
          }
          const saltHash = createSaltHash(input.password);
          await ctx.db.user.update({
            where: {
              email: resetInfo.email,
            },
            data: {
              salt: saltHash.salt,
              password: saltHash.hash,
              resetId: null,
            },
          });
          return { wasError: false, data: "That username does not exist" };
        } else {
          return { wasError: true, data: "That username does not exist" };
        }
      } catch (error) {
        return { wasError: true, data: "Link is invalid" };
      }
    }),
});

async function createSession(
  ctx: {
    db: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
  },
  id: string,
  role: "ADMIN" | "USER",
) {
  const session = await ctx.db.session.create({
    data: {
      userId: id,
      expiresAt: addDays(new Date(), 2),
      role: role,
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return { id: session.id, userId: session.userId, role: session.role };
}

export const resetSchema = z.object({
  email: z.string(),
  resetId: z.number(),
});

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
