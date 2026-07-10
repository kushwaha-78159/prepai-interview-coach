import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ResumeUploadEnhancedProps {
  onSuccess?: (resumeId: number) => void;
}

export function ResumeUploadEnhanced({ onSuccess }: ResumeUploadEnhancedProps) {
  const [uploading, setUploading] = useState(false);
  const uploadMutation = trpc.resumeUpload.uploadBase64.useMutation();

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
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Content = (event.target?.result as string).split(",")[1];

          // Upload using enhanced router
          const result = await uploadMutation.mutateAsync({
            fileName: file.name,
            fileContent: base64Content,
            mimeType: file.type,
          });

          toast.success("Resume uploaded successfully!");
          onSuccess?.(result.resumeId);
        } catch (error) {
          toast.error("Failed to upload resume");
          console.error(error);
        } finally {
          setUploading(false);
          e.target.value = "";
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to read file");
      console.error(error);
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Card className="border-2 border-dashed border-black rounded-2xl p-12 text-center">
      <input
        type="file"
        id="resume-upload-enhanced"
        accept=".pdf,.txt"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
      />
      <label htmlFor="resume-upload-enhanced" className="cursor-pointer">
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
                document.getElementById("resume-upload-enhanced")?.click();
              }}
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {uploading ? "Uploading..." : "Choose File"}
            </Button>
          </div>
        </div>
      </label>
    </Card>
  );
}
