import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FileUp, BarChart3, History, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { isAuthenticated, isReady } = useAuthGuard("/");

  const { data: resumes, isLoading: resumesLoading } = trpc.resume.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: sessions, isLoading: sessionsLoading } = trpc.interview.listSessions.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  const recentSession = sessions?.[0];
  const totalInterviews = sessions?.length || 0;
  const averageScore =
    sessions && sessions.length > 0
      ? (
          sessions.reduce((sum, s) => sum + (parseFloat(s.overallScore?.toString() || "0") || 0), 0) /
          sessions.length
        ).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-border px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black text-black mb-2">Welcome back, {user?.name || "User"}!</h1>
          <p className="text-gray-600">Continue your interview preparation journey</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-black p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Total Interviews</p>
                <p className="text-4xl font-black text-black">{totalInterviews}</p>
              </div>
              <History className="w-8 h-8 text-cyan-600" />
            </div>
          </Card>

          <Card className="border-2 border-black p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Average Score</p>
                <p className="text-4xl font-black text-black">{averageScore}/10</p>
              </div>
              <BarChart3 className="w-8 h-8 text-pink-600" />
            </div>
          </Card>

          <Card className="border-2 border-black p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Resumes Uploaded</p>
                <p className="text-4xl font-black text-black">{resumes?.length || 0}</p>
              </div>
              <FileUp className="w-8 h-8 text-cyan-600" />
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button
            onClick={() => navigate("/resume")}
            className="border-2 border-black rounded-2xl p-8 hover:bg-black hover:text-white transition-all group"
          >
            <FileUp className="w-8 h-8 mb-4 group-hover:text-white" />
            <h3 className="text-xl font-bold text-black group-hover:text-white mb-2">Upload Resume</h3>
            <p className="text-gray-600 group-hover:text-gray-300">
              Upload your resume and get AI-powered analysis and feedback
            </p>
          </button>

          <button
            onClick={() => navigate("/interview/setup")}
            className="border-2 border-black rounded-2xl p-8 hover:bg-black hover:text-white transition-all group"
          >
            <Plus className="w-8 h-8 mb-4 group-hover:text-white" />
            <h3 className="text-xl font-bold text-black group-hover:text-white mb-2">Start Interview</h3>
            <p className="text-gray-600 group-hover:text-gray-300">
              Begin a new mock interview session with AI-generated questions
            </p>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Interview */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-black mb-6">Recent Interview</h2>
            {recentSession ? (
              <Card className="border-2 border-black p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-black">{recentSession.jobRole}</h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(recentSession.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-cyan-600">
                      {parseFloat(recentSession.overallScore?.toString() || "0").toFixed(1)}/10
                    </p>
                    <p className="text-gray-600 text-sm">Score</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  {recentSession.questionsAnswered} of {recentSession.totalQuestions} questions answered
                </p>
                <Button
                  onClick={() => navigate(`/interview/report/${recentSession.id}`)}
                  className="w-full bg-black text-white hover:bg-gray-900"
                >
                  View Report
                </Button>
              </Card>
            ) : (
              <Card className="border-2 border-black p-6 text-center">
                <p className="text-gray-600 mb-4">No interviews yet. Start your first interview to see results here.</p>
                <Button
                  onClick={() => navigate("/interview/setup")}
                  className="bg-black text-white hover:bg-gray-900"
                >
                  Start Interview
                </Button>
              </Card>
            )}
          </div>

          {/* Quick Tips */}
          <div>
            <h2 className="text-2xl font-black text-black mb-6">Quick Tips</h2>
            <div className="space-y-4">
              {[
                "Practice regularly to build confidence",
                "Review your feedback after each session",
                "Record your voice answers for better analysis",
                "Update your resume before each interview",
              ].map((tip, idx) => (
                <div key={idx} className="border-l-4 border-cyan-600 pl-4 py-2">
                  <p className="text-gray-700 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
