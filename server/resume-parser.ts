import * as fs from "fs";
import * as path from "path";

/**
 * Parse resume text from different file formats
 * For PDF files, we'll extract text using a simple approach
 * For text files, we'll read them directly
 */
export async function parseResumeFile(filePath: string, mimeType: string): Promise<string> {
  try {
    if (mimeType === "text/plain") {
      return fs.readFileSync(filePath, "utf-8");
    }

    if (mimeType === "application/pdf") {
      // For PDF parsing, we'll use a simple approach
      // In production, you might want to use a library like pdfjs-dist or pdf-parse
      // For now, we'll return a placeholder that can be enhanced
      return await parsePDFSimple(filePath);
    }

    // Default: try to read as text
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error("[Resume Parser] Error parsing resume:", error);
    throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Simple PDF text extraction
 * In a real application, you'd use a proper PDF library
 */
async function parsePDFSimple(filePath: string): Promise<string> {
  // This is a placeholder implementation
  // In production, integrate with pdf-parse or similar library
  try {
    // For now, return file info as placeholder
    const stats = fs.statSync(filePath);
    return `[PDF Resume - ${stats.size} bytes]\n\nNote: Full PDF parsing requires additional setup. Please ensure the PDF contains text (not scanned images).`;
  } catch (error) {
    throw new Error(`Failed to read PDF file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Clean and normalize resume text
 */
export function normalizeResumeText(text: string): string {
  return text
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/\n\s*\n/g, "\n") // Remove extra blank lines
    .trim();
}

/**
 * Extract key sections from resume text
 */
export function extractResumeSections(text: string): {
  fullText: string;
  summary: string;
} {
  const normalized = normalizeResumeText(text);
  
  // Take first 500 characters as summary
  const summary = normalized.substring(0, 500);

  return {
    fullText: normalized,
    summary,
  };
}
