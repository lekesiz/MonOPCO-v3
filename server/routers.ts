import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { searchBySiret, searchBySiren } from "./pappers";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Pappers API router for company information lookup
  pappers: router({
    searchBySiret: publicProcedure
      .input(z.object({ siret: z.string() }))
      .mutation(async ({ input }) => {
        return await searchBySiret(input.siret);
      }),
    searchBySiren: publicProcedure
      .input(z.object({ siren: z.string() }))
      .mutation(async ({ input }) => {
        return await searchBySiren(input.siren);
      }),
  }),
});

export type AppRouter = typeof appRouter;
