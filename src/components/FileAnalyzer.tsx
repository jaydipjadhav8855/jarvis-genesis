import { useState, useRef } from "react";
import { Upload, FileText, Image as ImageIcon, Code, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

const FileAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size (max 20MB)
    if (selectedFile.size > 20 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "फाईल 20MB पेक्षा लहान असावी (File must be under 20MB)",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setAnalysis("");

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const analyzeFile = async () => {
    if (!file) {
      toast({
        title: "कृपया फाईल निवडा (Please select a file)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Determine analysis type
      let analysisType = 'general';
      if (file.type.startsWith('image/')) {
        analysisType = 'image';
      } else if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) {
        analysisType = 'document';
      } else if (file.name.match(/\.(js|jsx|ts|tsx|py|java|cpp|c|html|css|json)$/i)) {
        analysisType = 'code';
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', analysisType);

      console.log('Analyzing file:', file.name, file.type, analysisType);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-file`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      
      toast({
        title: "Analysis Complete!",
        description: "फाईल विश्लेषण पूर्ण झाले आहे",
      });
    } catch (error) {
      console.error('File analysis error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setAnalysis("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-5 h-5 text-primary" />;
    
    if (file.type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-400" />;
    if (file.name.match(/\.(js|jsx|ts|tsx|py|java|cpp|c|html|css|json)$/i)) {
      return <Code className="w-5 h-5 text-green-400" />;
    }
    return <FileText className="w-5 h-5 text-purple-400" />;
  };

  return (
    <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getFileIcon()}
          <h3 className="text-lg font-semibold jarvis-text-glow">File Analyzer</h3>
        </div>
        {file && (
          <Button
            onClick={clearFile}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.json,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css"
        />

        {!file ? (
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full h-32 jarvis-border hover:jarvis-glow transition-all"
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-primary" />
              <p className="text-sm">Click to upload file</p>
              <p className="text-xs text-muted-foreground">
                Images, PDFs, Documents, Code (Max 20MB)
              </p>
            </div>
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            {preview && (
              <div className="relative rounded-lg overflow-hidden jarvis-border">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            
            <div className="p-3 rounded-lg jarvis-border bg-background/30">
              <div className="flex items-center gap-2">
                {getFileIcon()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={analyzeFile}
              disabled={loading}
              className="w-full jarvis-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <p className="text-sm font-semibold text-foreground">AI Analysis:</p>
            <Textarea
              value={analysis}
              readOnly
              className="jarvis-border bg-background/30 min-h-[250px] text-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default FileAnalyzer;
