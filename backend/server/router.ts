import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({});
type Context = Awaited<ReturnType<typeof createContext>>;
const trpc = initTRPC.context<Context>().create();

const router = trpc.router;
const publicProcedure = trpc.procedure;

export { router, publicProcedure, createContext };
