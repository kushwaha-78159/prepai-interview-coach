import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { FileUp, Loader2, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Resume() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<number | null>(null);

  const { data: resumes, isLoading, refetch } = trpc.resume.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const uploadMutation = trpc.resume.upload.useMutation();
  const analyzeMutation = trpc.resume.analyze.useMutation();
  const deleteMutation = trpc.resume.delete.useMutation();

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["application/pdf", "text/plain"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF or text file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      // Read file content
      const content = await file.text();

      // Upload to backend
      const result = await uploadMutation.mutateAsync({
        fileName: file.name,
        fileKey: `resume-${Date.now()}-${file.name}`,
        fileUrl: `/files/${file.name}`,
        mimeType: file.type,
        fileSize: file.size,
        parsedContent: content,
      });

      toast.success("Resume uploaded successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to upload resume");
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAnalyze = async (resumeId: number) => {
    setAnalyzing(resumeId);
    try {
      await analyzeMutation.mutateAsync({ resumeId });
      toast.success("Resume analysis complete!");
      refetch();
    } catch (error) {
      toast.error("Failed to analyze resume");
      console.error(error);
    } finally {
      setAnalyzing(null);
    }
  };

  const handleDelete = async (resumeId: number) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      await deleteMutation.mutateAsync({ id: resumeId });
      toast.success("Resume deleted");
      refetch();
    } catch (error) {
      toast.error("Failed to delete resume");
      console.error(error);
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
          <h1 className="text-3xl font-black text-black mb-2">Resume Management</h1>
          <p className="text-gray-600">Upload and analyze your resumes for interview preparation</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Upload Section */}
        <Card className="border-2 border-dashed border-black rounded-2xl p-12 text-center mb-12">
          <input
            type="file"
            id="resume-upload"
            accept=".pdf,.txt"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          <label htmlFor="resume-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-cyan-100 rounded-lg flex items-center justify-center">
                <FileUp className="w-8 h-8 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black mb-2">Upload Your Resume</h3>
                <p className="text-gray-600 mb-4">Drag and drop or click to select a PDF or text file</p>
                <Button
                  disabled={uploading}
                  className="bg-black text-white hover:bg-gray-900"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("resume-upload")?.click();
                  }}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {uploading ? "Uploading..." : "Choose File"}
                </Button>
              </div>
            </div>
          </label>
        </Card>

        {/* Resumes List */}
        <div>
          <h2 className="text-2xl font-black text-black mb-6">Your Resumes</h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
          ) : resumes && resumes.length > 0 ? (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <Card key={resume.id} className="border-2 border-black p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-black mb-2">{resume.fileName}</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                      </p>

                      {resume.analysis ? (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="font-bold text-black mb-3">Analysis Results</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 mb-1">Strengths</p>
                              <ul className="space-y-1">
                                {(resume.analysis as any).strengths?.map((s: string, i: number) => (
                                  <li key={i} className="text-gray-700">
                                    • {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-1">Weaknesses</p>
                              <ul className="space-y-1">
                                {(resume.analysis as any).weaknesses?.map((w: string, i: number) => (
                                  <li key={i} className="text-gray-700">
                                    • {w}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-1">Suggestions</p>
                              <ul className="space-y-1">
                                {(resume.analysis as any).suggestions?.map((s: string, i: number) => (
                                  <li key={i} className="text-gray-700">
                                    • {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {!resume.analysis && (
                        <Button
                          onClick={() => handleAnalyze(resume.id)}
                          disabled={analyzing === resume.id}
                          className="bg-cyan-600 text-white hover:bg-cyan-700"
                          size="sm"
                        >
                          {analyzing === resume.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDelete(resume.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-black p-12 text-center">
              <p className="text-gray-600 mb-4">No resumes uploaded yet. Upload your first resume to get started.</p>
              <Button
                onClick={() => document.getElementById("resume-upload")?.click()}
                className="bg-black text-white hover:bg-gray-900"
              >
                Upload Resume
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
