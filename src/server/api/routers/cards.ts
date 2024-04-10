import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const cardRouter = createTRPCRouter({
  getCardsAdmin: publicProcedure.query(
    async ({
      ctx,
    }): Promise<
      | { wasError: true; data: string }
      | {
          wasError: false;
          data: {
            pathId?: string;
            image?: {
              id: string;
              x: number;
              y: number;
              width: number;
              imageType: string;
              height?: number | null;
              image: string;
            } | null;
            id: string;
            title: string;
            texts: {
              id: string;
              x: number;
              y: number;
              fontSize: number;
              color: string;
              text: string;
              createdAt: Date;
              updatedAt: Date;
              cardId: string | null;
            }[];
            isStart: boolean;
          }[];
        }
    > => {
      if (ctx.session?.role === "ADMIN") {
        const cards = await ctx.db.card.findMany({
          select: {
            id: true,
            image: true,
            isStart: true,
            texts: true,
            title: true,
            pathsId: true,
          },
        });
        return {
          wasError: false,
          data: cards.map((card) => {
            if (!card.image) {
              return {
                ...card,
                image: undefined,
              };
            } else {
              return {
                ...card,
                image: {
                  ...card.image,
                  image: card.image.image.toString("base64"),
                },
              };
            }
          }),
        };
      }
      return { wasError: true, data: "Error permissions Denied" };
    },
  ),
  createCard: publicProcedure
    .input(
      z.object({
        title: z.string(),
        isStart: z.boolean(),
        pathId: z.union([z.string(), z.undefined()]),
        texts: z.array(
          z.object({
            x: z.number(),
            y: z.number(),
            fontSize: z.number(),
            color: z.string(),
            text: z.string(),
          }),
        ),
        image: z.union([
          z.object({
            x: z.number(),
            y: z.number(),
            width: z.number(),
            imageType: z.string(),
            height: z.union([z.number(), z.undefined()]),
            image: z.string(),
          }),
          z.undefined(),
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session?.role === "ADMIN") {
          console.log("xsdgvxdgsdgsd");
          if (input.image) {
            await ctx.db.card.create({
              data: {
                title: input.title,
                texts: { createMany: { data: input.texts } },
                isStart: input.isStart,
                image: {
                  create: {
                    ...input.image,
                    image: Buffer.from(input.image.image, "base64"),
                  },
                },
                Paths: input.pathId
                  ? {
                      connect: {
                        id: input.pathId,
                      },
                    }
                  : undefined,
              },
            });
            return { wasError: false, data: "created Card" };
          } else {
            await ctx.db.card.create({
              data: {
                title: input.title,
                texts: { createMany: { data: input.texts } },
                isStart: input.isStart,
                Paths: input.pathId
                  ? {
                      connect: {
                        id: input.pathId,
                      },
                    }
                  : undefined,
              },
            });
            return { wasError: false, data: "created Card" };
          }
        } else {
          return { wasError: true, data: "Invalid Permission" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
  deleteCard: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session?.role === "ADMIN") {
          const card = await ctx.db.card.findFirst({
            where: {
              id: input.id,
            },
            select: {
              id: true,
              imageId: true,
              texts: true,
            },
          });
          if (card) {
            if (card.imageId) {
              const resultImage = await ctx.db.image.delete({
                where: {
                  id: card.imageId,
                },
              });
              if (!resultImage) {
                return { wasError: true, data: "Could not delete image" };
              }
            }
            await ctx.db.text.deleteMany({
              where: {
                id: {
                  in: card.texts.map((el) => {
                    return el.id;
                  }),
                },
              },
            });
            const resultCard = await ctx.db.card.delete({
              where: {
                id: input.id,
              },
            });
            if (!resultCard) {
              return { wasError: true, data: "Failed to delete card" };
            }
            return { wasError: false, data: "Deleted card" };
          } else {
            return { wasError: true, data: "That card does not exist" };
          }
        } else {
          return { wasError: true, data: "Invalid Permission" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
  modifyCard: publicProcedure
    .input(
      z.object({
        pathId: z.union([z.string(), z.undefined()]),
        title: z.string(),
        id: z.string(),
        isStart: z.boolean(),
        texts: z.array(
          z.object({
            x: z.number(),
            y: z.number(),
            fontSize: z.number(),
            color: z.string(),
            text: z.string(),
          }),
        ),
        image: z.union([
          z.object({
            x: z.number(),
            y: z.number(),
            width: z.number(),
            imageType: z.string(),
            height: z.union([z.number(), z.undefined()]),
            image: z.string(),
          }),
          z.undefined(),
          z.null(),
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session?.role === "ADMIN") {
          const card = await ctx.db.card.findFirst({
            where: {
              id: input.id,
            },
            select: {
              id: true,
              imageId: true,
              texts: true,
            },
          });
          if (card) {
            await ctx.db.text.deleteMany({
              where: {
                id: {
                  in: card.texts.map((el) => {
                    return el.id;
                  }),
                },
              },
            });
            if (card.imageId && (input.image === null || input.image)) {
              console.log("deleting image");
              const resultImage = await ctx.db.image.delete({
                where: {
                  id: card.imageId,
                },
              });
              if (!resultImage) {
                return { wasError: true, data: "Could not delete image" };
              }
            }
            if (input.image) {
              await ctx.db.card.update({
                where: {
                  id: input.id,
                },
                data: {
                  title: input.title,
                  texts: { createMany: { data: input.texts } },
                  isStart: input.isStart,
                  Paths: input.pathId
                    ? {
                        connect: {
                          id: input.pathId,
                        },
                      }
                    : undefined,
                  image: {
                    create: {
                      ...input.image,
                      image: Buffer.from(input.image.image, "base64"),
                    },
                  },
                },
              });
              return { wasError: false, data: "created Card" };
            } else {
              await ctx.db.card.update({
                where: {
                  id: input.id,
                },
                data: {
                  title: input.title,
                  texts: { createMany: { data: input.texts } },
                  isStart: input.isStart,
                  Paths: input.pathId
                    ? {
                        connect: {
                          id: input.pathId,
                        },
                      }
                    : undefined,
                },
              });
              return { wasError: false, data: "created Card" };
            }
          } else {
            return { wasError: true, data: "Could not find card" };
          }
        } else {
          return { wasError: true, data: "Invalid Permission" };
        }
      } catch (error) {
        return { wasError: true, data: "Invalid Attempt" };
      }
    }),
  getCards: publicProcedure.query(
    async ({
      ctx,
    }): Promise<
      | { wasError: true; data: string }
      | {
          wasError: false;
          data: {
            image?: {
              id: string;
              x: number;
              y: number;
              width: number;
              imageType: string;
              height?: number | null;
              image: string;
            } | null;
            id: string;
            title: string;
            texts: {
              id: string;
              x: number;
              y: number;
              fontSize: number;
              color: string;
              text: string;
              createdAt: Date;
              updatedAt: Date;
              cardId: string | null;
            }[];
            isStart: boolean;
            path: {
              name: string;
              color: string;
              id: string;
            };
          }[];
        }
    > => {
      if (ctx.session) {
        const users = await ctx.db.user.findFirst({
          where: {
            id: ctx.session?.userId,
          },
          select: {
            unlockedLocks: {
              select: {
                CardAdd: {
                  select: {
                    id: true,
                  },
                },
                CardRemove: {
                  select: {
                    id: true,
                  },
                },
              },
            },
            unlockedQrcodes: {
              select: {
                CardAdd: {
                  select: {
                    id: true,
                  },
                },
                CardRemove: {
                  select: {
                    id: true,
                  },
                },
              },
            },
            unlockedPaths: {
              select: {
                id: true,
              },
            },
          },
        });
        if (users) {
          const cardIds = [];
          const cardIdsRemove = [];
          const startIds = await ctx.db.card.findMany({
            select: {
              id: true,
            },
            where: {
              isStart: true,
              pathsId: {
                in: users.unlockedPaths.map((el) => el.id),
              },
            },
          });
          for (const id of startIds) {
            if (id) cardIds.push(id.id);
          }
          for (let i = 0; i < users?.unlockedLocks.length; i++) {
            const lock = users.unlockedLocks[i];
            if (!lock) continue;
            for (let j = 0; j < lock?.CardAdd.length; j++) {
              const card = lock.CardAdd[j];
              if (!card) continue;
              cardIds.push(card.id);
            }
            for (let j = 0; j < lock?.CardRemove.length; j++) {
              const card = lock.CardRemove[j];
              if (!card) continue;
              cardIdsRemove.push(card.id);
            }
          }
          for (let i = 0; i < users?.unlockedQrcodes.length; i++) {
            const lock = users.unlockedQrcodes[i];
            if (!lock) continue;
            for (let j = 0; j < lock?.CardAdd.length; j++) {
              const card = lock.CardAdd[j];
              if (!card) continue;
              cardIds.push(card.id);
            }
            for (let j = 0; j < lock?.CardRemove.length; j++) {
              const card = lock.CardRemove[j];
              if (!card) continue;
              cardIdsRemove.push(card.id);
            }
          }
          const cards = await ctx.db.card.findMany({
            select: {
              id: true,
              image: true,
              isStart: true,
              texts: true,
              title: true,
              Paths: {
                select: {
                  color: true,
                  name: true,
                  id: true,
                },
              },
            },
            where: {
              id: {
                notIn: cardIdsRemove,
                in: cardIds,
              },
            },
          });
          return {
            wasError: false,
            data: cards.map((card) => {
              if (!card.image) {
                return {
                  ...card,
                  image: undefined,
                  path: {
                    name: card.Paths?.name ?? "No Path",
                    color: card.Paths?.color ?? "black",
                    id: card.Paths?.id ?? "none$",
                  },
                };
              } else {
                return {
                  ...card,
                  image: {
                    ...card.image,
                    image: card.image.image.toString("base64"),
                  },
                  path: {
                    name: card.Paths?.name ?? "No Path",
                    color: card.Paths?.color ?? "black",
                    id: card.Paths?.id ?? "none$",
                  },
                };
              }
            }),
          };
        } else {
          return { wasError: true, data: "could not find user" };
        }
      }
      return { wasError: true, data: "no session" };
    },
  ),
});
