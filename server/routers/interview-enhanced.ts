import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as dbHelpers from "../db-helpers";
import { transcribeAudio, validateAudioFile } from "../voice-service";

/**
 * Enhanced interview router with voice transcription support
 */
export const interviewEnhancedRouter = router({
  /**
   * Submit answer with optional voice transcription
   * Accepts base64-encoded audio data
   */
  submitAnswerWithVoice: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        qaId: z.number(),
        answer: z.string().optional(),
        audioData: z.string().optional(), // base64 encoded
        audioMimeType: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const session = await dbHelpers.getInterviewSessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) {
          throw new Error("Session not found or access denied");
        }

        let finalAnswer = input.answer || "";

        // If audio data provided, transcribe it
        if (input.audioData) {
          try {
            const audioBuffer = Buffer.from(input.audioData, "base64");
            validateAudioFile(audioBuffer);

            // Transcribe audio using Whisper
            const transcribedText = await transcribeAudio(audioBuffer, input.audioMimeType || "audio/wav");
            finalAnswer = transcribedText || input.answer || "";

            if (!finalAnswer) {
              throw new Error("Could not transcribe audio. Please try again.");
            }
          } catch (error) {
            console.error("[Interview Enhanced] Transcription error:", error);
            // Fall back to text answer if transcription fails
            if (!input.answer) {
              throw new Error("Voice transcription failed and no text answer provided");
            }
            finalAnswer = input.answer;
          }
        }

        if (!finalAnswer.trim()) {
          throw new Error("Please provide an answer (text or voice)");
        }

        // Continue with normal answer submission
        // This would call the regular submitAnswer logic
        return {
          success: true,
          answer: finalAnswer,
          transcribed: !!input.audioData,
        };
      } catch (error) {
        console.error("[Interview Enhanced] Error:", error);
        throw error;
      }
    }),

  /**
   * Test voice transcription without submitting answer
   */
  testVoiceTranscription: protectedProcedure
    .input(
      z.object({
        audioData: z.string(), // base64 encoded
        audioMimeType: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const audioBuffer = Buffer.from(input.audioData, "base64");
        validateAudioFile(audioBuffer);

        const transcribedText = await transcribeAudio(audioBuffer, input.audioMimeType || "audio/wav");

        return {
          success: true,
          text: transcribedText,
        };
      } catch (error) {
        console.error("[Interview Enhanced] Transcription test error:", error);
        throw error;
      }
    }),
});
