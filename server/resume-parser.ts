import * as fs from "fs";
import * as path from "path";
import { extractTextFromPDF, extractTextFromFile, normalizeResumeText as normalizePDFText, extractResumeSections as extractPDFSections } from "./pdf-parser";

/**
 * Parse resume text from different file formats
 * Uses pdf-parse for PDFs and fs for text files
 */
export async function parseResumeFile(filePath: string, mimeType: string): Promise<string> {
  try {
    if (mimeType === "text/plain") {
      return await extractTextFromFile(filePath);
    }

    if (mimeType === "application/pdf") {
      return await extractTextFromPDF(filePath);
    }

    // Default: try to read as text
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error("[Resume Parser] Error parsing resume:", error);
    throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Clean and normalize resume text
 */
export function normalizeResumeText(text: string): string {
  return normalizePDFText(text);
}

/**
 * Extract key sections from resume text
 */
export function extractResumeSections(text: string): {
  fullText: string;
  summary: string;
  skills: string[];
  experience: string;
  education: string;
} {
  const sections = extractPDFSections(text);
  const normalized = normalizeResumeText(text);

  // Take first 500 characters as summary
  const summary = normalized.substring(0, 500);

  return {
    fullText: normalized,
    summary,
    skills: sections.skills,
    experience: sections.experience,
    education: sections.education,
  };
}
