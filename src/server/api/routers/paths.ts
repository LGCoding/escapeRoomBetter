import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const pathRouter = createTRPCRouter({
  getPathsAdmin: publicProcedure.query(
    async ({
      ctx,
    }): Promise<
      | { wasError: true; data: string }
      | {
          wasError: false;
          data: {
            id?: string;
            name: string;
            color: string;
            isStart: boolean;
          }[];
        }
    > => {
      if (ctx.session?.role === "ADMIN") {
        const path = await ctx.db.path.findMany({
          select: {
            id: true,
            color: true,
            name: true,
            isStart: true,
          },
        });
        return {
          wasError: false,
          data: path,
        };
      }
      return { wasError: true, data: "Error permissions Denied" };
    },
  ),
  createPath: publicProcedure
    .input(
      z.object({
        name: z.string(),
        color: z.string(),
        isStart: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session?.role === "ADMIN") {
          const path = await ctx.db.path.create({
            data: {
              color: input.color,
              isStart: input.isStart,
              name: input.name,
            },
          });
          if (input.isStart) {
            const users = await ctx.db.user.findMany({
              select: {
                id: true,
              },
            });
            for (const user of users) {
              await ctx.db.user.update({
                where: {
                  id: user.id,
                },
                data: {
                  unlockedPaths: {
                    connect: {
                      id: path.id,
                    },
                  },
                },
              });
            }
          }
          return { wasError: false, data: "created Path" };
        } else {
          return { wasError: true, data: "Invalid Permission" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
  deletePath: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session?.role === "ADMIN") {
          const path = await ctx.db.path.findFirst({
            where: {
              id: input.id,
            },
            select: {
              id: true,
            },
          });
          if (path) {
            const resultPath = await ctx.db.path.delete({
              where: {
                id: input.id,
              },
            });
            if (!resultPath) {
              return { wasError: true, data: "Failed to delete Path" };
            }
            return { wasError: false, data: "Deleted Path" };
          } else {
            return { wasError: true, data: "That path does not exist" };
          }
        } else {
          return { wasError: true, data: "Invalid Permission" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
  modifyPath: publicProcedure
    .input(
      z.object({
        name: z.string(),
        color: z.string(),
        isStart: z.boolean(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session?.role === "ADMIN") {
          const path = await ctx.db.path.findFirst({
            where: {
              id: input.id,
            },
            select: {
              id: true,
              isStart: true,
            },
          });
          if (path) {
            await ctx.db.path.update({
              where: {
                id: input.id,
              },
              data: {
                color: input.color,
                isStart: input.isStart,
                name: input.name,
              },
            });
            if (input.isStart && !path.isStart) {
              const users = await ctx.db.user.findMany({
                select: {
                  id: true,
                },
              });
              for (const user of users) {
                await ctx.db.user.update({
                  where: {
                    id: user.id,
                  },
                  data: {
                    unlockedPaths: {
                      connect: {
                        id: path.id,
                      },
                    },
                  },
                });
              }
            }
            return { wasError: false, data: "modified path" };
          } else {
            return { wasError: true, data: "Could not find path" };
          }
        } else {
          return { wasError: true, data: "Invalid Permission" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
});
