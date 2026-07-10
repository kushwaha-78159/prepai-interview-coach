import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState, useEffect, useRef } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { VoiceRecorder } from "@/components/VoiceRecorder";

export default function InterviewSession() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/interview/session/:sessionId");
  const sessionId = parseInt(params?.sessionId || "0");

  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentQAId, setCurrentQAId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Array<{ type: "question" | "answer"; text: string }>>([]);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: session, isLoading: sessionLoading } = trpc.interview.getSession.useQuery(
    { sessionId },
    { enabled: isAuthenticated && sessionId > 0 }
  );

  const getNextQuestionMutation = trpc.interview.getNextQuestion.useMutation();
  const submitAnswerMutation = trpc.interview.submitAnswer.useMutation();
  const completeSessionMutation = trpc.interview.completeSession.useMutation();
  const submitAnswerWithVoiceMutation = trpc.interviewEnhanced.submitAnswerWithVoice.useMutation();

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="border-2 border-black p-8 text-center">
          <p className="text-gray-600 mb-4">Session not found</p>
          <Button onClick={() => navigate("/dashboard")} className="bg-black text-white hover:bg-gray-900">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Initialize timer
  useEffect(() => {
    if (startTime === 0 && session.session) {
      setStartTime(Date.now());
    }
  }, [session.session, startTime]);

  // Update elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime > 0) {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Load first question
  useEffect(() => {
    if (currentQuestion === null && !sessionLoading && session.session.questionsAnswered === 0) {
      loadNextQuestion();
    }
  }, [sessionLoading, currentQuestion, session.session.questionsAnswered]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadNextQuestion = async () => {
    try {
      const result = await getNextQuestionMutation.mutateAsync({ sessionId });
      setCurrentQuestion(result.question);
      setCurrentQAId(result.qaId);
      setMessages((prev) => [...prev, { type: "question", text: result.question }]);
      setAnswer("");
    } catch (error) {
      toast.error("Failed to load next question");
      console.error(error);
    }
  };

  const handleVoiceTranscription = (transcribedText: string) => {
    setAnswer((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Please enter an answer");
      return;
    }

    if (!currentQAId) {
      toast.error("Question ID not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitAnswerMutation.mutateAsync({
        sessionId,
        qaId: currentQAId,
        answer,
      });

      setMessages((prev) => [
        ...prev,
        { type: "answer", text: answer },
        { type: "question", text: `Feedback: ${result.feedback}` },
      ]);

      // Check if we've completed all questions
      if (session.session.questionsAnswered + 1 >= session.session.totalQuestions) {
        // Complete session
        await completeSessionMutation.mutateAsync({ sessionId });
        toast.success("Interview completed!");
        navigate(`/interview/report/${sessionId}`);
      } else {
        // Load next question
        await loadNextQuestion();
      }
    } catch (error) {
      toast.error("Failed to submit answer");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Timer */}
      <div className="border-b border-border px-6 py-4 bg-gray-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-black">{session.session.jobRole}</h1>
            <p className="text-gray-600 text-sm">
              Question {session.session.questionsAnswered + 1} of {session.session.totalQuestions}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-cyan-600">{formatTime(elapsedTime)}</p>
            <p className="text-gray-600 text-sm">Elapsed Time</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 h-[calc(100vh-200px)] flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === "answer" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-2xl rounded-lg p-4 ${
                  msg.type === "answer"
                    ? "bg-black text-white rounded-br-none"
                    : "bg-gray-100 text-black rounded-bl-none border-2 border-black"
                }`}
              >
                <p className="text-sm font-mono leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <Card className="border-2 border-black p-6">
          <div className="space-y-4">
            {/* Answer Input */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">Your Answer</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here or use voice recording..."
                className="w-full border-2 border-gray-300 rounded-lg p-4 font-mono text-sm focus:border-black focus:outline-none resize-none"
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            {/* Controls */}
            <div className="flex gap-4 flex-col">
              <VoiceRecorder onTranscription={handleVoiceTranscription} disabled={isSubmitting} />

              <Button
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !answer.trim()}
                className="bg-black text-white hover:bg-gray-900"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Answer
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-600 text-center">
              💡 Tip: Speak naturally and take your time. The AI will evaluate your response.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
