import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Loader2, ArrowUpDown, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

type SortField = "date" | "score" | "duration";
type SortOrder = "asc" | "desc";

export default function InterviewHistory() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filterRole, setFilterRole] = useState<string>("");

  const { data: sessions, isLoading } = trpc.interview.listSessions.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  // Extract unique job roles for filter
  const uniqueRoles = useMemo(() => {
    if (!sessions) return [];
    return Array.from(new Set(sessions.map((s) => s.jobRole)));
  }, [sessions]);

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];

    let filtered = sessions;

    // Apply role filter
    if (filterRole) {
      filtered = filtered.filter((s) => s.jobRole === filterRole);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aVal: any = 0;
      let bVal: any = 0;

      switch (sortField) {
        case "date":
          aVal = new Date(a.startedAt).getTime();
          bVal = new Date(b.startedAt).getTime();
          break;
        case "score":
          aVal = parseFloat(a.overallScore?.toString() || "0");
          bVal = parseFloat(b.overallScore?.toString() || "0");
          break;
        case "duration":
          aVal = a.durationSeconds || 0;
          bVal = b.durationSeconds || 0;
          break;
      }

      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [sessions, filterRole, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-border px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate("/dashboard")} className="text-gray-600 hover:text-black mb-4">
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-black mb-2">Interview History</h1>
          <p className="text-gray-600">Review your past interview sessions and track your progress</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="mb-8 flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-bold text-black mb-2">Filter by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black focus:outline-none"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">Sort By</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleSort("date")}
                className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                  sortField === "date"
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:border-black"
                }`}
              >
                Date
                {sortField === "date" && (
                  <ArrowUpDown className="w-4 h-4" style={{ transform: sortOrder === "asc" ? "rotate(0)" : "rotate(180deg)" }} />
                )}
              </button>
              <button
                onClick={() => handleSort("score")}
                className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                  sortField === "score"
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:border-black"
                }`}
              >
                Score
                {sortField === "score" && (
                  <ArrowUpDown className="w-4 h-4" style={{ transform: sortOrder === "asc" ? "rotate(0)" : "rotate(180deg)" }} />
                )}
              </button>
              <button
                onClick={() => handleSort("duration")}
                className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                  sortField === "duration"
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:border-black"
                }`}
              >
                Duration
                {sortField === "duration" && (
                  <ArrowUpDown className="w-4 h-4" style={{ transform: sortOrder === "asc" ? "rotate(0)" : "rotate(180deg)" }} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="space-y-4">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 rounded-lg border-2 border-gray-300 font-bold text-black">
              <div className="col-span-3">Job Role</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Score</div>
              <div className="col-span-2 text-right">Duration</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* Table Rows */}
            {filteredSessions.map((session) => (
              <Card key={session.id} className="border-2 border-black p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-3">
                    <p className="text-xs text-gray-600 md:hidden font-bold">Job Role</p>
                    <p className="font-bold text-black">{session.jobRole}</p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-600 md:hidden font-bold">Date</p>
                    <p className="text-gray-700">{new Date(session.startedAt).toLocaleDateString()}</p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-600 md:hidden font-bold">Score</p>
                    <p className={`font-bold text-lg ${getScoreColor(parseFloat(session.overallScore?.toString() || "0"))}`}>
                      {parseFloat(session.overallScore?.toString() || "0").toFixed(1)}/10
                    </p>
                  </div>

                  <div className="md:col-span-2 md:text-right">
                    <p className="text-xs text-gray-600 md:hidden font-bold">Duration</p>
                    <p className="text-gray-700">{formatDuration(session.durationSeconds || 0)}</p>
                  </div>

                  <div className="md:col-span-3 flex gap-2 md:justify-end">
                    <Button
                      onClick={() => navigate(`/interview/report/${session.id}`)}
                      className="flex-1 md:flex-none bg-black text-white hover:bg-gray-900"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-black p-12 text-center">
            <p className="text-gray-600 mb-4">
              {filterRole ? "No interviews found for this role" : "No interviews yet. Start your first interview to see results here."}
            </p>
            <Button
              onClick={() => navigate("/interview/setup")}
              className="bg-black text-white hover:bg-gray-900"
            >
              Start Interview
            </Button>
          </Card>
        )}

        {/* Statistics */}
        {filteredSessions.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-black p-6 text-center">
              <p className="text-gray-600 text-sm font-medium mb-2">Total Interviews</p>
              <p className="text-4xl font-black text-black">{filteredSessions.length}</p>
            </Card>

            <Card className="border-2 border-black p-6 text-center">
              <p className="text-gray-600 text-sm font-medium mb-2">Average Score</p>
              <p className="text-4xl font-black text-cyan-600">
                {(
                  filteredSessions.reduce((sum, s) => sum + parseFloat(s.overallScore?.toString() || "0"), 0) /
                  filteredSessions.length
                ).toFixed(1)}
                /10
              </p>
            </Card>

            <Card className="border-2 border-black p-6 text-center">
              <p className="text-gray-600 text-sm font-medium mb-2">Total Time</p>
              <p className="text-4xl font-black text-black">
                {Math.floor(filteredSessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 60)}m
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
