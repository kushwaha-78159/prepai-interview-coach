import { eq, desc, and } from "drizzle-orm";
import { resumes, interviewSessions, interviewQA, Resume, InterviewSession, InterviewQA } from "../drizzle/schema";
import { getDb } from "./db";

// ============ RESUME QUERIES ============

export async function getUserResumes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resumes).where(eq(resumes.userId, userId)).orderBy(desc(resumes.createdAt));
}

export async function getResumeById(resumeId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(resumes).where(eq(resumes.id, resumeId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createResume(data: {
  userId: number;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  parsedContent?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(resumes).values([data]);
  return result;
}

export async function updateResumeAnalysis(resumeId: number, analysis: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(resumes).set({ analysis }).where(eq(resumes.id, resumeId));
}

export async function deleteResume(resumeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(resumes).where(eq(resumes.id, resumeId));
}

// ============ INTERVIEW SESSION QUERIES ============

export async function getUserInterviewSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(interviewSessions).where(eq(interviewSessions.userId, userId)).orderBy(desc(interviewSessions.createdAt));
}

export async function getInterviewSessionById(sessionId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(interviewSessions).where(eq(interviewSessions.id, sessionId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createInterviewSession(data: {
  userId: number;
  resumeId?: number;
  jobRole: string;
  jobDescription?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(interviewSessions).values([{
    ...data,
    status: "in_progress",
    totalQuestions: 6,
    questionsAnswered: 0,
  }]);
  return result;
}

export async function updateInterviewSession(sessionId: number, data: Partial<InterviewSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(interviewSessions).set(data).where(eq(interviewSessions.id, sessionId));
}

export async function completeInterviewSession(sessionId: number, overallScore: number, durationSeconds: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(interviewSessions).set({
    status: "completed",
    overallScore: overallScore.toString(),
    durationSeconds,
    completedAt: new Date(),
  }).where(eq(interviewSessions.id, sessionId));
}

// ============ INTERVIEW Q&A QUERIES ============

export async function getSessionQA(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(interviewQA).where(eq(interviewQA.sessionId, sessionId)).orderBy(interviewQA.questionNumber);
}

export async function createInterviewQA(data: {
  sessionId: number;
  questionNumber: number;
  question: string;
  userAnswer?: string;
  feedback?: string;
  score?: string;
  improvementTips?: any;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(interviewQA).values([data]);
}

export async function updateInterviewQA(qaId: number, data: Partial<InterviewQA>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(interviewQA).set(data).where(eq(interviewQA.id, qaId));
}

export async function getQABySessionAndQuestion(sessionId: number, questionNumber: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(interviewQA).where(
    and(eq(interviewQA.sessionId, sessionId), eq(interviewQA.questionNumber, questionNumber))
  ).limit(1);
  return result.length > 0 ? result[0] : null;
}
