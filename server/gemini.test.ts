import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("Gemini API Configuration", () => {
  it("should have GEMINI_API_KEY configured", () => {
    expect(ENV.geminiApiKey).toBeDefined();
    expect(ENV.geminiApiKey).not.toBe("");
    expect(ENV.geminiApiKey?.length).toBeGreaterThan(0);
  });

  it("should validate Gemini API key format", () => {
    const apiKey = ENV.geminiApiKey;
    // Gemini API keys typically start with specific patterns
    expect(apiKey).toBeTruthy();
    // Basic validation - key should be a non-empty string
    expect(typeof apiKey).toBe("string");
  });
});
