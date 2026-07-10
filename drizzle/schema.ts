import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, longtext } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Resumes table: stores user-uploaded resumes with S3 references
 */
export const resumes = mysqlTable("resumes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(), // S3 file key
  fileUrl: text("fileUrl").notNull(), // S3 presigned URL or reference
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: int("fileSize").notNull(),
  parsedContent: longtext("parsedContent"), // Extracted text from PDF/document
  analysis: json("analysis"), // Cached analysis results from LLM
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = typeof resumes.$inferInsert;

/**
 * Interview sessions table: tracks all mock interview sessions
 */
export const interviewSessions = mysqlTable("interviewSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  resumeId: int("resumeId"), // Optional: linked resume
  jobRole: varchar("jobRole", { length: 255 }).notNull(), // e.g., "Frontend Developer"
  jobDescription: text("jobDescription"), // Optional: specific job description
  status: mysqlEnum("status", ["in_progress", "completed", "abandoned"]).default("in_progress").notNull(),
  totalQuestions: int("totalQuestions").default(6).notNull(),
  questionsAnswered: int("questionsAnswered").default(0).notNull(),
  overallScore: decimal("overallScore", { precision: 3, scale: 1 }), // 0-10 score
  durationSeconds: int("durationSeconds"), // Total interview duration
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InterviewSession = typeof interviewSessions.$inferSelect;
export type InsertInterviewSession = typeof interviewSessions.$inferInsert;

/**
 * Interview questions and answers: stores Q&A pairs for each interview session
 */
export const interviewQA = mysqlTable("interviewQA", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  questionNumber: int("questionNumber").notNull(), // 1, 2, 3...
  question: text("question").notNull(),
  userAnswer: longtext("userAnswer"), // User's text response (from voice or typed)
  feedback: text("feedback"), // LLM-generated feedback
  score: decimal("score", { precision: 3, scale: 1 }), // 0-10 score for this question
  improvementTips: json("improvementTips"), // Array of improvement suggestions
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InterviewQA = typeof interviewQA.$inferSelect;
export type InsertInterviewQA = typeof interviewQA.$inferInsert;
