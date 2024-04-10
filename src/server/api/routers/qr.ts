import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type Prisma } from "@prisma/client";

export const qrRouter = createTRPCRouter({
  getQrsAdmin: publicProcedure.query(
    async ({
      ctx,
    }): Promise<
      | { wasError: true; data: string }
      | {
          wasError: false;
          data: {
            title: string;
            id: string;
            cardAddIds: string[];
            cardRemoveIds: string[];
            locks: string[];
            unlockPathId?: string;
          }[];
        }
    > => {
      if (ctx.session?.role === "ADMIN") {
        const qrs = await ctx.db.qrCodes.findMany({
          select: {
            CardAdd: { select: { id: true } },
            CardRemove: { select: { id: true } },
            locks: { select: { id: true } },
            id: true,
            title: true,
            pathsId: true,
          },
        });
        return {
          wasError: false,
          data: qrs.map((el) => {
            return {
              ...el,
              unlockPathId: el.pathsId ?? undefined,
              cardAddIds: el.CardAdd.map((elem) => {
                return elem.id;
              }),
              cardRemoveIds: el.CardRemove.map((elem) => {
                return elem.id;
              }),
              locks: el.locks.map((elem) => {
                return elem.id;
              }),
            };
          }),
        };
      }
      return { wasError: true, data: "Error permissions Denied" };
    },
  ),
  createQr: publicProcedure
    .input(
      z.object({
        title: z.string(),
        cardAddIds: z.array(z.string()),
        cardRemoveIds: z.array(z.string()),
        locks: z.array(z.string()),
        unlockPathId: z.union([z.string(), z.undefined()]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session?.role === "ADMIN") {
          const data:
            | (Prisma.Without<
                Prisma.QrCodesCreateInput,
                Prisma.QrCodesUncheckedCreateInput
              > &
                Prisma.QrCodesUncheckedCreateInput)
            | (Prisma.Without<
                Prisma.QrCodesUncheckedCreateInput,
                Prisma.QrCodesCreateInput
              > &
                Prisma.QrCodesCreateInput) = {
            title: input.title,
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
            locks: {
              connect: input.locks.map((el) => {
                return {
                  id: el,
                };
              }),
            },
          };
          if (input.unlockPathId) {
            data.UnlockPath = {
              connect: {
                id: input.unlockPathId,
              },
            };
          }
          await ctx.db.qrCodes.create({
            data: data,
          });
          return { wasError: false, data: "created QrCode" };
        } else {
          return { wasError: true, data: "Invalid Permission" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
  deleteQr: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session?.role === "ADMIN") {
          const qr = await ctx.db.qrCodes.findFirst({
            where: {
              id: input.id,
            },
            select: {
              id: true,
            },
          });
          if (qr) {
            const resultQr = await ctx.db.qrCodes.delete({
              where: {
                id: input.id,
              },
            });
            if (!resultQr) {
              return { wasError: true, data: "Failed to delete QrCode" };
            }
            return { wasError: false, data: "Deleted QrCode" };
          } else {
            return { wasError: true, data: "That QrCode does not exist" };
          }
        } else {
          return { wasError: true, data: "Invalid Permission" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
  modifyQr: publicProcedure
    .input(
      z.object({
        title: z.string(),
        cardAddIds: z.array(z.string()),
        cardRemoveIds: z.array(z.string()),
        id: z.string(),
        locks: z.array(z.string()),
        unlockPathId: z.union([z.string(), z.undefined()]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session?.role === "ADMIN") {
          const qr = await ctx.db.qrCodes.findFirst({
            where: {
              id: input.id,
            },
            select: {
              id: true,
            },
          });
          if (qr) {
            await ctx.db.qrCodes.update({
              where: {
                id: input.id,
              },
              data: {
                title: input.title,
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
                locks: {
                  set: [],
                  connect: input.locks.map((el) => {
                    return {
                      id: el,
                    };
                  }),
                },
                UnlockPath: input.unlockPathId
                  ? {
                      connect: {
                        id: input.unlockPathId,
                      },
                    }
                  : {
                      disconnect: true,
                    },
              },
            });
            return { wasError: false, data: "modified QrCode" };
          } else {
            return { wasError: true, data: "Could not find QrCode" };
          }
        } else {
          return { wasError: true, data: "Invalid Permission" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
  unlockQr: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session) {
          const qrcode = await ctx.db.qrCodes.findFirst({
            where: {
              id: input.id,
            },
            select: {
              locks: {
                select: {
                  id: true,
                  title: true,
                },
              },
              pathsId: true,
            },
          });
          const lockIds =
            qrcode?.locks.map((el) => {
              return el;
            }) ?? [];
          const user = await ctx.db.user.findFirst({
            where: {
              id: ctx.session.userId,
            },
            select: {
              unlockedQrcodes: {
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
          if (user && !user.unlockedQrcodes.find((el) => el.id === input.id)) {
            let requiredLocks =
              "This QrCode requires that you have opened lock [";
            let hasAllLock = true;
            for (const lock of lockIds) {
              if (!user.unlockedLocks.find((el) => el.id === lock.id)) {
                requiredLocks += (hasAllLock ? "" : ", ") + lock.title;
                hasAllLock = false;
              }
            }
            if (!hasAllLock)
              return { wasError: true, data: requiredLocks + "]" };
            if (qrcode?.pathsId) {
              await ctx.db.user.update({
                where: {
                  id: ctx.session.userId,
                },
                data: {
                  unlockedQrcodes: {
                    connect: {
                      id: input.id,
                    },
                  },
                  unlockedPaths: {
                    connect: {
                      id: qrcode?.pathsId,
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
                  unlockedQrcodes: {
                    connect: {
                      id: input.id,
                    },
                  },
                },
              });
            }
            return { wasError: false, data: "Scanned QrCode" };
          } else {
            return {
              wasError: false,
              data: "You have already Scanned this qrcode",
            };
          }
        }
        return { wasError: true, data: "No session" };
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
});
