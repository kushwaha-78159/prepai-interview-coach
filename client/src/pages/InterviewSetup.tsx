import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const JOB_ROLES = [
  { id: "frontend", label: "Frontend Developer", icon: "💻" },
  { id: "backend", label: "Backend Developer", icon: "⚙️" },
  { id: "fullstack", label: "Full Stack Developer", icon: "🔗" },
  { id: "data-scientist", label: "Data Scientist", icon: "📊" },
  { id: "data-engineer", label: "Data Engineer", icon: "🗄️" },
  { id: "product-manager", label: "Product Manager", icon: "📱" },
  { id: "ux-designer", label: "UX Designer", icon: "🎨" },
  { id: "devops", label: "DevOps Engineer", icon: "🚀" },
  { id: "qa", label: "QA Engineer", icon: "✓" },
  { id: "ml-engineer", label: "ML Engineer", icon: "🤖" },
];

export default function InterviewSetup() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);

  const { data: resumes } = trpc.resume.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const startSessionMutation = trpc.interview.startSession.useMutation();

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleStartInterview = async () => {
    if (!selectedRole) {
      toast.error("Please select a job role");
      return;
    }

    setStarting(true);
    try {
      const result = await startSessionMutation.mutateAsync({
        jobRole: selectedRole,
        resumeId: resumeId || undefined,
        jobDescription: jobDescription || undefined,
      });

      navigate(`/interview/session/${result.sessionId}`);
    } catch (error) {
      toast.error("Failed to start interview");
      console.error(error);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-border px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate("/dashboard")} className="text-gray-600 hover:text-black mb-4">
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-black mb-2">Start Interview Session</h1>
          <p className="text-gray-600">Choose a role and customize your interview experience</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Job Role Selection */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-black mb-6">Select Job Role</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {JOB_ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`border-2 rounded-xl p-4 text-center transition-all ${
                    selectedRole === role.id
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-black"
                  }`}
                >
                  <div className="text-2xl mb-2">{role.icon}</div>
                  <p className="font-bold text-sm">{role.label}</p>
                </button>
              ))}
            </div>

            {/* Job Description */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-black mb-4">Job Description (Optional)</h3>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste a specific job description to get role-specific questions..."
                className="w-full border-2 border-gray-300 rounded-lg p-4 font-mono text-sm focus:border-black focus:outline-none"
                rows={6}
              />
              <p className="text-gray-600 text-sm mt-2">
                Leave empty for general {selectedRole ? `${selectedRole} ` : ""}questions
              </p>
            </div>

            {/* Resume Selection */}
            <div>
              <h3 className="text-lg font-bold text-black mb-4">Link Resume (Optional)</h3>
              {resumes && resumes.length > 0 ? (
                <div className="space-y-2">
                  {resumes.map((resume) => (
                    <label
                      key={resume.id}
                      className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-black transition-all"
                    >
                      <input
                        type="radio"
                        name="resume"
                        value={resume.id}
                        checked={resumeId === resume.id}
                        onChange={(e) => setResumeId(parseInt(e.target.value))}
                        className="w-4 h-4 mr-3"
                      />
                      <span className="font-medium text-black">{resume.fileName}</span>
                    </label>
                  ))}
                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-black transition-all">
                    <input
                      type="radio"
                      name="resume"
                      value=""
                      checked={resumeId === null}
                      onChange={() => setResumeId(null)}
                      className="w-4 h-4 mr-3"
                    />
                    <span className="font-medium text-black">No resume</span>
                  </label>
                </div>
              ) : (
                <Card className="border-2 border-gray-300 p-4 text-center">
                  <p className="text-gray-600 mb-3">No resumes uploaded yet</p>
                  <Button
                    onClick={() => navigate("/resume")}
                    variant="outline"
                    className="border-black text-black hover:bg-black hover:text-white"
                  >
                    Upload Resume
                  </Button>
                </Card>
              )}
            </div>
          </div>

          {/* Right: Summary */}
          <div>
            <Card className="border-2 border-black p-6 sticky top-6">
              <h3 className="text-lg font-bold text-black mb-6">Interview Summary</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Job Role</p>
                  <p className="font-bold text-black">
                    {selectedRole
                      ? JOB_ROLES.find((r) => r.id === selectedRole)?.label
                      : "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-1">Questions</p>
                  <p className="font-bold text-black">6 questions</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-1">Duration</p>
                  <p className="font-bold text-black">~15-20 minutes</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-1">Resume</p>
                  <p className="font-bold text-black">
                    {resumeId
                      ? resumes?.find((r) => r.id === resumeId)?.fileName
                      : "Not linked"}
                  </p>
                </div>
              </div>

              <div className="bg-cyan-50 border-l-4 border-cyan-600 p-4 mb-6 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Tip:</strong> You can answer with text or voice. Speak naturally as you would in a real interview.
                </p>
              </div>

              <Button
                onClick={handleStartInterview}
                disabled={!selectedRole || starting}
                className="w-full bg-black text-white hover:bg-gray-900 text-lg py-6"
              >
                {starting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Starting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Start Interview
                  </>
                )}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
