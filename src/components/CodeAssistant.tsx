import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Code2, Sparkles, Bug, Zap } from "lucide-react";
import { motion } from "framer-motion";

const CodeAssistant = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [task, setTask] = useState<"generate" | "explain" | "debug" | "optimize">("generate");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter some code or description",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/code-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ task, code, language }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process code");
      }

      const data = await response.json();
      setResult(data.result);
      
      toast({
        title: "Success",
        description: "Code processed successfully",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to process code",
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
          <Code2 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold jarvis-text-glow">Code Assistant</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={task} onValueChange={(value: any) => setTask(value)}>
            <SelectTrigger className="jarvis-border">
              <SelectValue placeholder="Select task" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="generate">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate Code
                </div>
              </SelectItem>
              <SelectItem value="explain">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Explain Code
                </div>
              </SelectItem>
              <SelectItem value="debug">
                <div className="flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Debug Code
                </div>
              </SelectItem>
              <SelectItem value="optimize">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Optimize Code
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="jarvis-border">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="go">Go</SelectItem>
              <SelectItem value="rust">Rust</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={
            task === "generate"
              ? "Describe what you want to build..."
              : "Paste your code here..."
          }
          className="min-h-[200px] font-mono jarvis-border bg-background/50"
        />

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full jarvis-glow"
        >
          {isLoading ? "Processing..." : "Process Code"}
        </Button>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <h3 className="text-lg font-semibold mb-2">Result:</h3>
            <Card className="p-4 jarvis-border bg-secondary/20 max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {result}
              </pre>
            </Card>
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default CodeAssistant;