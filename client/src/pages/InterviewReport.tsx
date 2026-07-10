import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Download, Share2, BarChart3, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

export default function InterviewReport() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/interview/report/:sessionId");
  const sessionId = parseInt(params?.sessionId || "0");

  const { data: session, isLoading } = trpc.interview.getSession.useQuery(
    { sessionId },
    { enabled: isAuthenticated && sessionId > 0 }
  );

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  if (isLoading) {
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
          <p className="text-gray-600 mb-4">Report not found</p>
          <Button onClick={() => navigate("/dashboard")} className="bg-black text-white hover:bg-gray-900">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const { session: sessionData, qa } = session;
  const overallScore = parseFloat(sessionData.overallScore?.toString() || "0");
  const durationMinutes = Math.floor((sessionData.durationSeconds || 0) / 60);

  // Prepare chart data
  const scoreData = qa.map((q, idx) => ({
    name: `Q${idx + 1}`,
    score: parseFloat(q.score?.toString() || "0"),
  }));

  const performanceData = [
    { category: "Technical", value: Math.min(10, overallScore + 1) },
    { category: "Communication", value: Math.min(10, overallScore) },
    { category: "Clarity", value: Math.min(10, overallScore + 0.5) },
    { category: "Confidence", value: Math.min(10, overallScore - 0.5) },
    { category: "Relevance", value: Math.min(10, overallScore) },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return "bg-green-50 border-green-300";
    if (score >= 6) return "bg-yellow-50 border-yellow-300";
    return "bg-red-50 border-red-300";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-border px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate("/dashboard")} className="text-gray-600 hover:text-black mb-4">
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-black mb-2">Interview Report</h1>
          <p className="text-gray-600">
            {sessionData.jobRole} • {new Date(sessionData.completedAt || sessionData.startedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Overall Score Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className={`border-2 p-8 text-center ${getScoreBg(overallScore)}`}>
            <p className="text-gray-600 text-sm font-medium mb-2">Overall Score</p>
            <p className={`text-5xl font-black ${getScoreColor(overallScore)}`}>{overallScore.toFixed(1)}/10</p>
            <p className="text-gray-600 text-sm mt-2">
              {overallScore >= 8 ? "Excellent" : overallScore >= 6 ? "Good" : "Needs Improvement"}
            </p>
          </Card>

          <Card className="border-2 border-black p-8 text-center">
            <p className="text-gray-600 text-sm font-medium mb-2">Duration</p>
            <p className="text-5xl font-black text-black">{durationMinutes}</p>
            <p className="text-gray-600 text-sm mt-2">minutes</p>
          </Card>

          <Card className="border-2 border-black p-8 text-center">
            <p className="text-gray-600 text-sm font-medium mb-2">Questions</p>
            <p className="text-5xl font-black text-black">{qa.length}</p>
            <p className="text-gray-600 text-sm mt-2">completed</p>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Score by Question */}
          <Card className="border-2 border-black p-6">
            <h2 className="text-lg font-bold text-black mb-4">Score by Question</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="score" fill="#0891b2" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Performance Radar */}
          <Card className="border-2 border-black p-6">
            <h2 className="text-lg font-bold text-black mb-4">Performance Analysis</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={90} domain={[0, 10]} />
                <Radar name="Score" dataKey="value" stroke="#0891b2" fill="#0891b2" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Detailed Q&A Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-black mb-6">Detailed Feedback</h2>
          <div className="space-y-6">
            {qa.map((item, idx) => (
              <Card key={idx} className="border-2 border-black p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-black mb-2">Question {idx + 1}</h3>
                    <p className="text-gray-700">{item.question}</p>
                  </div>
                  <div className={`text-2xl font-black ${getScoreColor(parseFloat(item.score?.toString() || "0"))}`}>
                    {parseFloat(item.score?.toString() || "0").toFixed(1)}/10
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Your Answer</p>
                  <p className="text-gray-700 font-mono text-sm">{item.userAnswer}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-black mb-2">Feedback</p>
                  <p className="text-gray-700">{item.feedback}</p>
                </div>

                {item.improvementTips && Array.isArray(item.improvementTips) && (item.improvementTips as any).length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-black mb-2">Improvement Tips</p>
                    <ul className="space-y-2">
                      {(item.improvementTips as any).map((tip: any, tipIdx: number) => (
                        <li key={tipIdx} className="flex gap-2 text-gray-700 text-sm">
                          <span className="text-cyan-600 font-bold">→</span>
                          <span>{String(tip)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate("/interview/setup")}
            className="bg-black text-white hover:bg-gray-900 px-8"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Practice Again
          </Button>
          <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white px-8">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white px-8">
            <Share2 className="w-4 h-4 mr-2" />
            Share Results
          </Button>
        </div>
      </div>
    </div>
  );
}
