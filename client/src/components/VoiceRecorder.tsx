import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscription, disabled = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const testTranscriptionMutation = trpc.interviewEnhanced.testVoiceTranscription.useMutation();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started...");
    } catch (error) {
      toast.error("Failed to access microphone. Please check permissions.");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Audio = (event.target?.result as string).split(",")[1];

          // Call transcription API
          const result = await testTranscriptionMutation.mutateAsync({
            audioData: base64Audio,
            audioMimeType: "audio/wav",
          });

          if (result.text) {
            onTranscription(result.text);
            toast.success("Voice transcribed successfully!");
          } else {
            toast.error("Could not transcribe audio. Please try again.");
          }
        } catch (error) {
          toast.error("Failed to transcribe audio");
          console.error(error);
        } finally {
          setIsTranscribing(false);
        }
      };

      reader.readAsDataURL(audioBlob);
    } catch (error) {
      toast.error("Failed to process audio");
      console.error(error);
      setIsTranscribing(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled || isTranscribing}
        variant={isRecording ? "destructive" : "outline"}
        className={isRecording ? "border-red-500 text-red-500 hover:bg-red-50" : "border-black"}
      >
        {isTranscribing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Transcribing...
          </>
        ) : isRecording ? (
          <>
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-2" />
            Start Recording
          </>
        )}
      </Button>
      <p className="text-xs text-gray-600 flex items-center">
        {isRecording && "🔴 Recording..."}
        {isTranscribing && "⏳ Transcribing..."}
        {!isRecording && !isTranscribing && "Click to record your answer"}
      </p>
    </div>
  );
}
