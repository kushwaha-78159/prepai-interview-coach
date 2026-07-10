import { ENV } from "./_core/env";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Call Gemini API with a prompt
 */
async function callGemini(prompt: string, systemPrompt?: string): Promise<string> {
  if (!ENV.geminiApiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const contents: GeminiMessage[] = [];

  if (systemPrompt) {
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt }],
    });
    contents.push({
      role: "model",
      parts: [{ text: "Understood. I will follow these instructions." }],
    });
  }

  contents.push({
    role: "user",
    parts: [{ text: prompt }],
  });

  const request: GeminiRequest = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${ENV.geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No response from Gemini API");
    }

    return text;
  } catch (error) {
    console.error("[LLM Service] Gemini API error:", error);
    throw error;
  }
}

/**
 * Analyze a resume and provide feedback
 */
export async function analyzeResume(resumeContent: string): Promise<{
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
}> {
  const systemPrompt = `You are an expert career coach and resume reviewer. Analyze the provided resume and give constructive, specific feedback.`;

  const prompt = `Please analyze this resume and provide feedback in JSON format:
{
  "strengths": ["list of 3-4 key strengths"],
  "weaknesses": ["list of 3-4 areas for improvement"],
  "suggestions": ["list of 3-4 specific actionable suggestions"],
  "summary": "a 2-3 sentence overall assessment"
}

Resume:
${resumeContent}`;

  try {
    const response = await callGemini(prompt, systemPrompt);
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON response from LLM");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[LLM Service] Resume analysis error:", error);
    throw error;
  }
}

/**
 * Generate interview questions based on resume and job role
 */
export async function generateInterviewQuestions(
  resumeContent: string,
  jobRole: string,
  jobDescription?: string,
  previousQuestions: string[] = []
): Promise<string> {
  const systemPrompt = `You are an expert technical interviewer. Generate thoughtful, role-specific interview questions that assess the candidate's skills and experience. Questions should be challenging but fair, and should be based on the candidate's resume and the job requirements.`;

  const previousQuestionsText = previousQuestions.length > 0 
    ? `\n\nPrevious questions asked (avoid repetition):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : '';

  const prompt = `Generate a single, specific interview question for a ${jobRole} position.
${jobDescription ? `\nJob Description:\n${jobDescription}` : ''}

Candidate's Resume:
${resumeContent}
${previousQuestionsText}

Requirements:
- The question should be relevant to the job role and the candidate's experience
- It should be open-ended and allow for a detailed answer (60-120 seconds)
- It should assess technical skills, problem-solving, or relevant experience
- Keep it conversational and natural
- Return ONLY the question, no numbering or additional text`;

  try {
    const response = await callGemini(prompt, systemPrompt);
    return response.trim();
  } catch (error) {
    console.error("[LLM Service] Question generation error:", error);
    throw error;
  }
}

/**
 * Evaluate a user's answer to an interview question
 */
export async function evaluateAnswer(
  question: string,
  userAnswer: string,
  jobRole: string
): Promise<{
  score: number;
  feedback: string;
  improvementTips: string[];
}> {
  const systemPrompt = `You are an expert technical interviewer evaluating candidate responses. Provide fair, constructive feedback that helps the candidate improve.`;

  const prompt = `Evaluate this interview answer on a scale of 1-10 and provide feedback.

Job Role: ${jobRole}
Question: ${question}
Candidate's Answer: ${userAnswer}

Provide your evaluation in JSON format:
{
  "score": <number between 1-10>,
  "feedback": "<2-3 sentence evaluation of the answer>",
  "improvementTips": ["tip 1", "tip 2", "tip 3"]
}

Focus on:
- Technical accuracy
- Communication clarity
- Relevance to the job role
- Depth of understanding`;

  try {
    const response = await callGemini(prompt, systemPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON response from LLM");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      score: Math.min(10, Math.max(1, parsed.score || 5)),
      feedback: parsed.feedback || "Good response",
      improvementTips: parsed.improvementTips || [],
    };
  } catch (error) {
    console.error("[LLM Service] Answer evaluation error:", error);
    throw error;
  }
}

/**
 * Generate a follow-up question based on the user's previous answer
 */
export async function generateFollowUpQuestion(
  initialQuestion: string,
  userAnswer: string,
  jobRole: string
): Promise<string> {
  const systemPrompt = `You are an expert technical interviewer. Generate a thoughtful follow-up question that digs deeper into the candidate's response.`;

  const prompt = `Generate a follow-up question based on the candidate's answer.

Job Role: ${jobRole}
Initial Question: ${initialQuestion}
Candidate's Answer: ${userAnswer}

The follow-up should:
- Dig deeper into their response
- Ask for clarification or examples
- Test their depth of knowledge
- Be conversational and natural
- Return ONLY the question, no numbering or additional text`;

  try {
    const response = await callGemini(prompt, systemPrompt);
    return response.trim();
  } catch (error) {
    console.error("[LLM Service] Follow-up question generation error:", error);
    throw error;
  }
}
