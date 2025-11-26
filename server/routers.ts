import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { searchBySiret, searchBySiren } from "./pappers";
import { sendWelcomeEmail, sendNewDocumentEmail, sendStatusChangeEmail, sendCustomEmail } from "./resend";
import { protectedProcedure } from "./_core/trpc";
import { createNotification, notifyNewDocument, notifyStatusChange, notifyNewDossier, notifyEmailSent } from "./notifications";

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

  // Resend Email API router for sending professional emails
  email: router({
    sendWelcome: protectedProcedure
      .input(z.object({
        to: z.string().email(),
        userName: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await sendWelcomeEmail(input.to, input.userName);
      }),
    
    sendNewDocument: protectedProcedure
      .input(z.object({
        to: z.string().email(),
        userName: z.string(),
        documentName: z.string(),
        dossierName: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await sendNewDocumentEmail(
          input.to,
          input.userName,
          input.documentName,
          input.dossierName
        );
      }),
    
    sendStatusChange: protectedProcedure
      .input(z.object({
        to: z.string().email(),
        userName: z.string(),
        dossierName: z.string(),
        oldStatus: z.string(),
        newStatus: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await sendStatusChangeEmail(
          input.to,
          input.userName,
          input.dossierName,
          input.oldStatus,
          input.newStatus
        );
      }),
    
    sendCustom: protectedProcedure
      .input(z.object({
        to: z.string().email(),
        subject: z.string(),
        htmlContent: z.string(),
        textContent: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await sendCustomEmail(
          input.to,
          input.subject,
          input.htmlContent,
          input.textContent
        );
      }),
  }),

  // Notifications router for managing user notifications
  notifications: router({
    create: protectedProcedure
      .input(z.object({
        type: z.enum(['info', 'success', 'warning', 'error']),
        title: z.string(),
        message: z.string(),
        link: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error('User not authenticated');
        }
        const success = await createNotification({
          userId: ctx.user.id.toString(),
          type: input.type,
          title: input.title,
          message: input.message,
          link: input.link,
          metadata: input.metadata,
        });
        return { success };
      }),
    
    notifyNewDocument: protectedProcedure
      .input(z.object({
        documentName: z.string(),
        dossierName: z.string(),
        dossierId: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error('User not authenticated');
        }
        await notifyNewDocument({
          userId: ctx.user.id.toString(),
          userEmail: ctx.user.email || '',
          userName: `${ctx.user.name || 'Utilisateur'}`,
          documentName: input.documentName,
          dossierName: input.dossierName,
          dossierId: input.dossierId,
        });
        return { success: true };
      }),
    
    notifyStatusChange: protectedProcedure
      .input(z.object({
        dossierName: z.string(),
        dossierId: z.string(),
        oldStatus: z.string(),
        newStatus: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error('User not authenticated');
        }
        await notifyStatusChange({
          userId: ctx.user.id.toString(),
          userEmail: ctx.user.email || '',
          userName: `${ctx.user.name || 'Utilisateur'}`,
          dossierName: input.dossierName,
          dossierId: input.dossierId,
          oldStatus: input.oldStatus,
          newStatus: input.newStatus,
        });
        return { success: true };
      }),
    
    notifyNewDossier: protectedProcedure
      .input(z.object({
        dossierName: z.string(),
        dossierId: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error('User not authenticated');
        }
        await notifyNewDossier({
          userId: ctx.user.id.toString(),
          dossierName: input.dossierName,
          dossierId: input.dossierId,
        });
        return { success: true };
      }),
    
    notifyEmailSent: protectedProcedure
      .input(z.object({
        recipient: z.string(),
        subject: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error('User not authenticated');
        }
        await notifyEmailSent({
          userId: ctx.user.id.toString(),
          recipient: input.recipient,
          subject: input.subject,
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
