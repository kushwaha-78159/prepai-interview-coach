import * as fs from "fs";
import * as pdfParseModule from "pdf-parse";
const pdfParse = (pdfParseModule as any).default || pdfParseModule;

/**
 * Extract text from PDF file using pdf-parse
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(fileBuffer);

    // Extract text from all pages
    const text = data.text || "";

    if (!text.trim()) {
      throw new Error("No text content found in PDF");
    }

    return text;
  } catch (error) {
    console.error("[PDF Parser] Error extracting text from PDF:", error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Extract text from plain text file
 */
export async function extractTextFromFile(filePath: string): Promise<string> {
  try {
    const content = fs.readFileSync(filePath, "utf-8");

    if (!content.trim()) {
      throw new Error("File is empty");
    }

    return content;
  } catch (error) {
    console.error("[PDF Parser] Error reading text file:", error);
    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Parse resume file based on MIME type
 */
export async function parseResumeFile(filePath: string, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    return extractTextFromPDF(filePath);
  } else if (mimeType === "text/plain") {
    return extractTextFromFile(filePath);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

/**
 * Clean and normalize resume text
 */
export function normalizeResumeText(text: string): string {
  // Remove extra whitespace
  let normalized = text
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, "\n") // Remove empty lines
    .trim();

  // Remove common PDF artifacts
  normalized = normalized
    .replace(/[^\x20-\x7E\n]/g, "") // Remove non-ASCII characters except newlines
    .replace(/\f/g, "") // Remove form feeds
    .replace(/\r/g, ""); // Remove carriage returns

  return normalized;
}

/**
 * Extract key sections from resume
 */
export function extractResumeSections(text: string): {
  summary: string;
  skills: string[];
  experience: string;
  education: string;
} {
  const sections = {
    summary: "",
    skills: [] as string[],
    experience: "",
    education: "",
  };

  // Simple heuristic-based extraction
  const lines = text.split("\n");

  // Look for common section headers
  let currentSection = "summary";
  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes("skill")) {
      currentSection = "skills";
    } else if (lowerLine.includes("experience") || lowerLine.includes("work")) {
      currentSection = "experience";
    } else if (lowerLine.includes("education") || lowerLine.includes("degree")) {
      currentSection = "education";
    } else if (currentSection === "skills" && line.trim()) {
      sections.skills.push(line.trim());
    } else if (currentSection === "experience" && line.trim()) {
      sections.experience += line + "\n";
    } else if (currentSection === "education" && line.trim()) {
      sections.education += line + "\n";
    } else if (currentSection === "summary" && line.trim()) {
      sections.summary += line + "\n";
    }
  }

  return sections;
}
