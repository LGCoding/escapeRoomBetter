import { PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUsersAdmin: publicProcedure.query(
    async ({
      ctx,
    }): Promise<
      | { wasError: true; data: string }
      | {
          wasError: false;
          data: {
            email: string;
            id: string;
            name: string;
            role: "USER" | "ADMIN";
            unlockedLocks: Record<string, number>;
          }[];
        }
    > => {
      if (ctx.session?.role === "ADMIN") {
        const users = await ctx.db.user.findMany({
          select: {
            email: true,
            id: true,
            name: true,
            role: true,
            unlockedLocks: {
              select: { id: true, pathId: true },
            },
          },
        });

        return {
          wasError: false,
          data: users.map((el) => {
            const unlockedLocks: Record<string, number> = {};
            for (const i of el.unlockedLocks) {
              if (unlockedLocks[i.pathId ?? "none"])
                unlockedLocks[i.pathId ?? "none"]++;
              else unlockedLocks[i.pathId ?? "none"] = 1;
            }
            return {
              ...el,
              role: el.role as "USER" | "ADMIN",
              unlockedLocks,
            };
          }),
        };
      }
      return { wasError: true, data: "Error permissions Denied" };
    },
  ),
  resetUser: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session?.role === "ADMIN") {
          const user = await ctx.db.user.findFirst({
            where: {
              id: input.id,
            },
            select: {
              id: true,
            },
          });
          if (user) {
            const resultUser = await ctx.db.user.update({
              where: {
                id: input.id,
              },
              data: {
                unlockedLocks: { set: [] },
                unlockedQrcodes: { set: [] },
                unlockedPaths: { set: [] },
              },
            });
            await linkStartPaths(ctx.db, input.id);
            if (!resultUser) {
              return { wasError: true, data: "Failed to delete UserCode" };
            }
            return { wasError: false, data: "Deleted UserCode" };
          } else {
            return { wasError: true, data: "That UserCode does not exist" };
          }
        } else {
          return { wasError: true, data: "Invalid Permission" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
  deleteUser: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session?.role === "ADMIN") {
          const user = await ctx.db.user.findFirst({
            where: {
              id: input.id,
            },
            select: {
              id: true,
              sessions: {
                select: {
                  id: true,
                },
              },
            },
          });
          if (user) {
            if (user.sessions) {
              const resultSession = await ctx.db.session.delete({
                where: {
                  id: user.sessions.id,
                },
              });
              if (!resultSession) {
                return { wasError: true, data: "Failed to delete UserCode" };
              }
            }
            const resultUser = await ctx.db.user.delete({
              where: {
                id: input.id,
              },
            });
            if (!resultUser) {
              return { wasError: true, data: "Failed to delete UserCode" };
            }
            return { wasError: false, data: "Deleted UserCode" };
          } else {
            return { wasError: true, data: "That UserCode does not exist" };
          }
        } else {
          return { wasError: true, data: "Invalid Permission" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
  modifyUser: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        role: z.enum(["USER", "ADMIN"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session?.role === "ADMIN") {
          const user = await ctx.db.user.findFirst({
            where: {
              id: input.id,
            },
            select: {
              id: true,
            },
          });
          if (user) {
            await ctx.db.user.update({
              where: {
                id: input.id,
              },
              data: {
                name: input.name,
                role: input.role,
              },
            });
            return { wasError: false, data: "modified UserCode" };
          } else {
            return { wasError: true, data: "Could not find UserCode" };
          }
        } else {
          return { wasError: true, data: "Invalid Permission" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
});

export async function linkStartPaths(
  db: PrismaClient<
    {
      log: ("query" | "warn" | "error")[];
    },
    never,
    DefaultArgs
  >,
  userId: string,
) {
  const paths = await db.path.findMany({
    where: {
      isStart: true,
    },
    select: {
      id: true,
    },
  });
  const user = await db.user.update({
    where: {
      id: userId,
    },
    data: {
      unlockedPaths: {
        connect: paths.map((el) => {
          return el;
        }),
      },
    },
  });
}
