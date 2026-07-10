import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as dbHelpers from "../db-helpers";
import { parseResumeFile, normalizeResumeText } from "../resume-parser";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * Handle resume file upload with S3 integration
 * This endpoint receives base64-encoded file data and metadata
 */
export const resumeUploadRouter = router({
  /**
   * Upload resume file with base64 encoding
   */
  uploadBase64: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(255),
        fileContent: z.string(), // base64 encoded
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate file type
        const validMimeTypes = ["application/pdf", "text/plain"];
        if (!validMimeTypes.includes(input.mimeType)) {
          throw new Error("Invalid file type. Only PDF and text files are supported.");
        }

        // Decode base64
        const buffer = Buffer.from(input.fileContent, "base64");

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (buffer.length > maxSize) {
          throw new Error(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
        }

        // Create temporary file for parsing
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `resume-${Date.now()}-${input.fileName}`);
        fs.writeFileSync(tempFilePath, buffer);

        try {
          // Parse resume content
          const parsedContent = await parseResumeFile(tempFilePath, input.mimeType);
          const normalizedContent = normalizeResumeText(parsedContent);

          // In production, upload to S3 here
          // For now, use a placeholder URL
          const fileKey = `resume-${ctx.user.id}-${Date.now()}-${input.fileName}`;
          const fileUrl = `/files/${fileKey}`;

          // Save to database
          const result = await dbHelpers.createResume({
            userId: ctx.user.id,
            fileName: input.fileName,
            fileKey,
            fileUrl,
            mimeType: input.mimeType,
            fileSize: buffer.length,
            parsedContent: normalizedContent,
          });

          return {
            success: true,
            resumeId: (result as any).insertId || 1,
            fileName: input.fileName,
            fileUrl,
          };
        } finally {
          // Clean up temporary file
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        }
      } catch (error) {
        console.error("[Resume Upload] Error:", error);
        throw new Error(`Failed to upload resume: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),
});
