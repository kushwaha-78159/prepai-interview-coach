import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as dbHelpers from "../db-helpers";
import { analyzeResume } from "../llm-service";
import { parseResumeFile, normalizeResumeText, extractResumeSections } from "../resume-parser";
import * as fs from "fs";
import * as path from "path";

export const resumeRouter = router({
  /**
   * Get all resumes for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return dbHelpers.getUserResumes(ctx.user.id);
  }),

  /**
   * Get a specific resume by ID
   */
  get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    const resume = await dbHelpers.getResumeById(input.id);
    if (!resume || resume.userId !== ctx.user.id) {
      throw new Error("Resume not found or access denied");
    }
    return resume;
  }),

  /**
   * Upload and parse a resume
   * In a real app, this would receive file data and upload to S3
   */
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileKey: z.string(),
        fileUrl: z.string(),
        mimeType: z.string(),
        fileSize: z.number(),
        parsedContent: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const resume = await dbHelpers.createResume({
          userId: ctx.user.id,
          fileName: input.fileName,
          fileKey: input.fileKey,
          fileUrl: input.fileUrl,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          parsedContent: input.parsedContent,
        });

        return {
          success: true,
          resumeId: (resume as any).insertId || 1,
        };
      } catch (error) {
        console.error("[Resume Router] Upload error:", error);
        throw new Error("Failed to upload resume");
      }
    }),

  /**
   * Analyze a resume using LLM
   */
  analyze: protectedProcedure
    .input(z.object({ resumeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const resume = await dbHelpers.getResumeById(input.resumeId);
        if (!resume || resume.userId !== ctx.user.id) {
          throw new Error("Resume not found or access denied");
        }

        if (!resume.parsedContent) {
          throw new Error("Resume content not available for analysis");
        }

        // Analyze using LLM
        const analysis = await analyzeResume(resume.parsedContent);

        // Save analysis to database
        await dbHelpers.updateResumeAnalysis(input.resumeId, analysis);

        return analysis;
      } catch (error) {
        console.error("[Resume Router] Analysis error:", error);
        throw error;
      }
    }),

  /**
   * Delete a resume
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const resume = await dbHelpers.getResumeById(input.id);
      if (!resume || resume.userId !== ctx.user.id) {
        throw new Error("Resume not found or access denied");
      }

      await dbHelpers.deleteResume(input.id);
      return { success: true };
    }),
});
