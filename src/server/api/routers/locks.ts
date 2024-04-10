import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const lockRouter = createTRPCRouter({
  getLocksAdmin: publicProcedure.query(
    async ({
      ctx,
    }): Promise<
      | { wasError: true; data: string }
      | {
          wasError: false;
          data: {
            title: string;
            id: string;
            combination: string;
            cardAddIds: string[];
            cardRemoveIds: string[];
            unlockPathsId?: string;
            pathId?: string;
          }[];
        }
    > => {
      if (ctx.session?.role === "ADMIN") {
        const locks = await ctx.db.lock.findMany({
          select: {
            CardAdd: { select: { id: true } },
            CardRemove: { select: { id: true } },
            combination: true,
            id: true,
            title: true,
            pathId: true,
            unlockPathsId: true,
          },
        });
        return {
          wasError: false,
          data: locks.map((el) => {
            return {
              ...el,
              unlockPathsId: el.unlockPathsId ?? undefined,
              pathId: el.pathId ?? undefined,
              cardAddIds: el.CardAdd.map((elem) => {
                return elem.id;
              }),
              cardRemoveIds: el.CardRemove.map((elem) => {
                return elem.id;
              }),
            };
          }),
        };
      }
      return { wasError: true, data: "Error permissions Denied" };
    },
  ),
  createLock: publicProcedure
    .input(
      z.object({
        title: z.string(),
        combination: z.string(),
        cardAddIds: z.array(z.string()),
        cardRemoveIds: z.array(z.string()),
        unlockPathsId: z.union([z.string(), z.undefined()]),
        pathId: z.union([z.string(), z.undefined()]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session?.role === "ADMIN") {
          await ctx.db.lock.create({
            data: {
              title: input.title,
              combination: input.combination,
              Path: input.pathId
                ? {
                    connect: {
                      id: input.pathId,
                    },
                  }
                : undefined,
              UnlockPath: input.unlockPathsId
                ? {
                    connect: {
                      id: input.unlockPathsId,
                    },
                  }
                : undefined,
              CardAdd: {
                connect: input.cardAddIds.map((el) => {
                  return {
                    id: el,
                  };
                }),
              },
              CardRemove: {
                connect: input.cardRemoveIds.map((el) => {
                  return {
                    id: el,
                  };
                }),
              },
            },
          });
          return { wasError: false, data: "created Lock" };
        } else {
          return { wasError: true, data: "Invalid Permission" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
  deleteLock: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session?.role === "ADMIN") {
          const lock = await ctx.db.lock.findFirst({
            where: {
              id: input.id,
            },
            select: {
              id: true,
            },
          });
          if (lock) {
            const resultLock = await ctx.db.lock.delete({
              where: {
                id: input.id,
              },
            });
            if (!resultLock) {
              return { wasError: true, data: "Failed to delete Lock" };
            }
            return { wasError: false, data: "Deleted Lock" };
          } else {
            return { wasError: true, data: "That lock does not exist" };
          }
        } else {
          return { wasError: true, data: "Invalid Permission" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
  modifyLock: publicProcedure
    .input(
      z.object({
        title: z.string(),
        combination: z.string(),
        cardAddIds: z.array(z.string()),
        cardRemoveIds: z.array(z.string()),
        id: z.string(),
        unlockPathsId: z.union([z.string(), z.undefined()]),
        pathId: z.union([z.string(), z.undefined()]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session?.role === "ADMIN") {
          const lock = await ctx.db.lock.findFirst({
            where: {
              id: input.id,
            },
            select: {
              id: true,
            },
          });
          if (lock) {
            await ctx.db.lock.update({
              where: {
                id: input.id,
              },
              data: {
                title: input.title,
                combination: input.combination,
                Path: input.pathId
                  ? {
                      connect: {
                        id: input.pathId,
                      },
                    }
                  : {
                      disconnect: true,
                    },
                UnlockPath: input.unlockPathsId
                  ? {
                      connect: {
                        id: input.unlockPathsId,
                      },
                    }
                  : {
                      disconnect: true,
                    },
                CardAdd: {
                  set: [],
                  connect: input.cardAddIds.map((el) => {
                    return {
                      id: el,
                    };
                  }),
                },
                CardRemove: {
                  set: [],
                  connect: input.cardRemoveIds.map((el) => {
                    return {
                      id: el,
                    };
                  }),
                },
              },
            });
            return { wasError: false, data: "modified lock" };
          } else {
            return { wasError: true, data: "Could not find lock" };
          }
        } else {
          return { wasError: true, data: "Invalid Permission" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
  getLockNumber: publicProcedure.query(
    async ({
      ctx,
    }): Promise<
      | { wasError: true; data: string }
      | {
          wasError: false;
          data: Record<string, { count: number; name: string }>;
        }
    > => {
      if (ctx.session?.role === "ADMIN") {
        const locks = await ctx.db.lock.groupBy({
          by: ["pathId"],
          _count: true,
        });
        const paths = await ctx.db.path.findMany({
          where: {
            id: {
              in: locks.map((el) => el.pathId ?? ""),
            },
          },
        });
        const lockCounts: Record<string, { count: number; name: string }> = {};
        for (const i of locks) {
          lockCounts[i.pathId ?? "none$"] = {
            count: i._count,
            name: paths.find((el) => el.id === i.pathId)?.name ?? "No path",
          };
        }
        return {
          wasError: false,
          data: lockCounts,
        };
      }
      return { wasError: true, data: "Error permissions Denied" };
    },
  ),
  unlockLock: publicProcedure
    .input(
      z.object({
        id: z.string(),
        combination: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session) {
          const lock = await ctx.db.lock.findFirst({
            where: {
              id: input.id,
            },
            select: {
              combination: true,
              unlockPathsId: true,
            },
          });
          if (lock?.combination === input.combination) {
            if (lock.unlockPathsId) {
              await ctx.db.user.update({
                where: {
                  id: ctx.session.userId,
                },
                data: {
                  unlockedLocks: {
                    connect: {
                      id: input.id,
                    },
                  },
                  unlockedPaths: {
                    connect: {
                      id: lock.unlockPathsId,
                    },
                  },
                },
              });
            } else {
              await ctx.db.user.update({
                where: {
                  id: ctx.session.userId,
                },
                data: {
                  unlockedLocks: {
                    connect: {
                      id: input.id,
                    },
                  },
                },
              });
            }
            return { wasError: false, data: "Opened lock" };
          } else {
            return { wasError: true, data: "Incorrect combination" };
          }
        }
        return { wasError: true, data: "No session" };
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
  getLocks: publicProcedure.query(
    async ({
      ctx,
    }): Promise<
      | { wasError: true; data: string }
      | {
          wasError: false;
          data: {
            title: string;
            id: string;
            combination: string;
            path: {
              name: string;
              color: string;
              id: string;
            };
          }[];
        }
    > => {
      const user = await ctx.db.user.findFirst({
        where: {
          id: ctx.session?.userId,
        },
        select: {
          unlockedPaths: {
            select: {
              id: true,
            },
          },
          unlockedLocks: {
            select: {
              id: true,
            },
          },
        },
      });
      const locks = await ctx.db.lock.findMany({
        where: {
          pathId: {
            in: user?.unlockedPaths.map((el) => el.id),
          },
        },
        select: {
          combination: true,
          id: true,
          title: true,
          Path: {
            select: {
              color: true,
              name: true,
              id: true,
            },
          },
        },
      });
      return {
        wasError: false,
        data: locks.map((el) => {
          const unlocked = user?.unlockedLocks.findIndex(
            (ele) => el.id === ele.id,
          );
          return {
            ...el,
            path: {
              name: el.Path?.name ?? "No Path",
              color: el.Path?.color ?? "black",
              id: el.Path?.id ?? "none$",
            },
            open: unlocked !== -1,
          };
        }),
      };
    },
  ),
});
