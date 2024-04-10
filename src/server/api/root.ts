import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { loginRouter } from "./routers/login";
import { cardRouter } from "./routers/cards";
import { lockRouter } from "./routers/locks";
import { qrRouter } from "./routers/qr";
import { userRouter } from "./routers/users";
import { pathRouter } from "./routers/paths";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  login: loginRouter,
  cards: cardRouter,
  locks: lockRouter,
  qrs: qrRouter,
  users: userRouter,
  paths: pathRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
