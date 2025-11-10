import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Upload, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const FileAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [task, setTask] = useState<"summarize" | "extract" | "analyze" | "translate">("analyze");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const content = await file.text();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-file`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            content,
            fileName: file.name,
            fileType: file.type,
            task,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze file");
      }

      const data = await response.json();
      setResult(data.analysis);
      
      toast({
        title: "Success",
        description: "File analyzed successfully",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to analyze file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold jarvis-text-glow">File Analyzer</h2>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".txt,.md,.json,.csv,.xml,.pdf,.doc,.docx"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-12 h-12 text-primary/50" />
              <span className="text-sm text-muted-foreground">
                {file ? file.name : "Click to upload file"}
              </span>
              <span className="text-xs text-muted-foreground">
                Supports: TXT, MD, JSON, CSV, XML, PDF, DOC, DOCX (Max 10MB)
              </span>
            </label>
          </div>

          <Select value={task} onValueChange={(value: any) => setTask(value)}>
            <SelectTrigger className="jarvis-border">
              <SelectValue placeholder="Select analysis type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summarize">Summarize</SelectItem>
              <SelectItem value="extract">Extract Key Info</SelectItem>
              <SelectItem value="analyze">Deep Analysis</SelectItem>
              <SelectItem value="translate">Translate</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleAnalyze}
            disabled={!file || isLoading}
            className="w-full jarvis-glow"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoading ? "Analyzing..." : "Analyze File"}
          </Button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <h3 className="text-lg font-semibold mb-2">Analysis Result:</h3>
            <Card className="p-4 jarvis-border bg-secondary/20 max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">
                {result}
              </pre>
            </Card>
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default FileAnalyzer;