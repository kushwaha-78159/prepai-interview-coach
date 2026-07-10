import { ENV } from "./_core/env";

/**
 * Transcribe audio using Manus built-in Whisper API
 */
export async function transcribeAudio(audioBuffer: Buffer, mimeType: string = "audio/wav"): Promise<string> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    throw new Error("Manus Forge API not configured");
  }

  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
    formData.append("file", blob, "audio.wav");
    formData.append("model", "whisper-1");

    const response = await fetch(`${ENV.forgeApiUrl}/voice/transcribe`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Whisper API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.text || "";
  } catch (error) {
    console.error("[Voice Service] Transcription error:", error);
    throw error;
  }
}

/**
 * Validate audio file before transcription
 */
export function validateAudioFile(buffer: Buffer, maxSizeBytes: number = 25 * 1024 * 1024): boolean {
  if (buffer.length === 0) {
    throw new Error("Audio file is empty");
  }

  if (buffer.length > maxSizeBytes) {
    throw new Error(`Audio file exceeds maximum size of ${maxSizeBytes / 1024 / 1024}MB`);
  }

  return true;
}

/**
 * Convert audio format if needed
 */
export async function convertAudioFormat(buffer: Buffer, fromFormat: string, toFormat: string = "wav"): Promise<Buffer> {
  // In a real implementation, you'd use ffmpeg or similar
  // For now, return the buffer as-is
  if (fromFormat === toFormat) {
    return buffer;
  }

  console.warn(`[Voice Service] Audio format conversion from ${fromFormat} to ${toFormat} not implemented. Using original format.`);
  return buffer;
}
