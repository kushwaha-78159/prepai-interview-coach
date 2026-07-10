import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as dbHelpers from "../db-helpers";
import { generateInterviewQuestions, evaluateAnswer, generateFollowUpQuestion } from "../llm-service";

export const interviewRouter = router({
  /**
   * Get all interview sessions for the current user
   */
  listSessions: protectedProcedure.query(async ({ ctx }) => {
    return dbHelpers.getUserInterviewSessions(ctx.user.id);
  }),

  /**
   * Get a specific interview session with all Q&A
   */
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const session = await dbHelpers.getInterviewSessionById(input.sessionId);
      if (!session || session.userId !== ctx.user.id) {
        throw new Error("Session not found or access denied");
      }

      const qa = await dbHelpers.getSessionQA(input.sessionId);
      return { session, qa };
    }),

  /**
   * Start a new interview session
   */
  startSession: protectedProcedure
    .input(
      z.object({
        resumeId: z.number().optional(),
        jobRole: z.string(),
        jobDescription: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await dbHelpers.createInterviewSession({
          userId: ctx.user.id,
          resumeId: input.resumeId,
          jobRole: input.jobRole,
          jobDescription: input.jobDescription,
        });

        const sessionId = (result as any).insertId || 1;
        return { sessionId, success: true };
      } catch (error) {
        console.error("[Interview Router] Start session error:", error);
        throw new Error("Failed to start interview session");
      }
    }),

  /**
   * Get the next interview question
   */
  getNextQuestion: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const session = await dbHelpers.getInterviewSessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) {
          throw new Error("Session not found or access denied");
        }

        if (session.status !== "in_progress") {
          throw new Error("Interview session is not in progress");
        }

        const nextQuestionNumber = session.questionsAnswered + 1;
        if (nextQuestionNumber > session.totalQuestions) {
          throw new Error("All questions have been asked");
        }

        // Get resume content if available
        let resumeContent = "";
        if (session.resumeId) {
          const resume = await dbHelpers.getResumeById(session.resumeId);
          resumeContent = resume?.parsedContent || "";
        }

        // Get previous questions to avoid repetition
        const previousQA = await dbHelpers.getSessionQA(input.sessionId);
        const previousQuestions = previousQA.map((qa) => qa.question);

        // Generate question using LLM
        const question = await generateInterviewQuestions(
          resumeContent || `Candidate for ${session.jobRole} position`,
          session.jobRole,
          session.jobDescription || undefined,
          previousQuestions
        );

        // Save question to database
        const qaResult = await dbHelpers.createInterviewQA({
          sessionId: input.sessionId,
          questionNumber: nextQuestionNumber,
          question,
        });

        const qaId = (qaResult as any).insertId || 1;

        return {
          qaId,
          questionNumber: nextQuestionNumber,
          question,
        };
      } catch (error) {
        console.error("[Interview Router] Get question error:", error);
        throw error;
      }
    }),

  /**
   * Submit an answer to a question
   */
  submitAnswer: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        qaId: z.number(),
        answer: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const session = await dbHelpers.getInterviewSessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) {
          throw new Error("Session not found or access denied");
        }

        const qa = await dbHelpers.getSessionQA(input.sessionId);
        const currentQA = qa.find((q) => q.id === input.qaId);
        if (!currentQA) {
          throw new Error("Q&A record not found");
        }

        // Evaluate answer using LLM
        const evaluation = await evaluateAnswer(currentQA.question, input.answer, session.jobRole);

        // Update Q&A with answer and feedback
        await dbHelpers.updateInterviewQA(input.qaId, {
          userAnswer: input.answer,
          feedback: evaluation.feedback,
          score: evaluation.score.toString(),
          improvementTips: evaluation.improvementTips,
        });

        // Update session
        const newQuestionsAnswered = session.questionsAnswered + 1;
        await dbHelpers.updateInterviewSession(input.sessionId, {
          questionsAnswered: newQuestionsAnswered,
        });

        return {
          score: evaluation.score,
          feedback: evaluation.feedback,
          improvementTips: evaluation.improvementTips,
        };
      } catch (error) {
        console.error("[Interview Router] Submit answer error:", error);
        throw error;
      }
    }),

  /**
   * Complete an interview session
   */
  completeSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const session = await dbHelpers.getInterviewSessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) {
          throw new Error("Session not found or access denied");
        }

        // Get all Q&A for this session
        const qa = await dbHelpers.getSessionQA(input.sessionId);

        // Calculate overall score
        const scores = qa
          .map((q) => (q.score ? parseFloat(q.score.toString()) : 0))
          .filter((s) => s > 0);
        const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

        // Calculate duration
        const durationSeconds = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);

        // Complete session
        await dbHelpers.completeInterviewSession(input.sessionId, overallScore, durationSeconds);

        return {
          success: true,
          overallScore,
          durationSeconds,
          totalQuestions: qa.length,
        };
      } catch (error) {
        console.error("[Interview Router] Complete session error:", error);
        throw error;
      }
    }),
});
