import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const siteOptionsRouter = createTRPCRouter({
  getSiteOptions: publicProcedure.query(
    async ({
      ctx,
    }): Promise<
      | { wasError: true; data: string }
      | {
          wasError: false;
          data: {
            card: string;
            card2: string;
            homeText: string;
            icon: string;
            title: string;
          };
        }
    > => {
      const siteOptions = await ctx.db.siteOptions.findFirst({
        select: {
          card: true,
          card2: true,
          homeText: true,
          icon: true,
          title: true,
        },
      });
      if (siteOptions) {
        return {
          wasError: false,
          data: {
            homeText: siteOptions.homeText ?? "askj;dgfknjasdgklnasdglkn",
            title: siteOptions.title ?? "Cipher Society",
            card: siteOptions.card?.toString("base64") ?? "",
            card2: siteOptions.card2?.toString("base64") ?? "",
            icon: siteOptions.icon?.toString("base64") ?? "",
          },
        };
      }
      return {
        wasError: true,
        data: "Could not find site settings",
      };
    },
  ),
  modifySiteOptions: publicProcedure
    .input(
      z.object({
        card: z.union([z.string(), z.undefined()]),
        card2: z.union([z.string(), z.undefined()]),
        homeText: z.union([z.string(), z.undefined()]),
        icon: z.union([z.string(), z.undefined()]),
        title: z.union([z.string(), z.undefined()]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const siteOptions = await ctx.db.siteOptions.findFirst({
          select: {
            id: true,
          },
        });
        if (siteOptions) {
          await ctx.db.siteOptions.update({
            where: {
              id: siteOptions.id,
            },
            data: {
              card: input.card ? Buffer.from(input.card, "base64") : undefined,
              card2: input.card2
                ? Buffer.from(input.card2, "base64")
                : undefined,
              homeText: input.homeText,
              icon: input.icon ? Buffer.from(input.icon, "base64") : undefined,
              title: input.title,
            },
          });
          return { wasError: false, data: "Modified site options" };
        } else {
          return { wasError: true, data: "Could not find site options" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
});
