import { useState } from "react";
import { Code, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CodeAssistant = () => {
  const [code, setCode] = useState("");
  const [task, setTask] = useState<string>("generate");
  const [language, setLanguage] = useState<string>("javascript");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const processCode = async () => {
    if (!code.trim()) {
      toast({
        title: "कृपया code किंवा prompt द्या",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('code-assistant', {
        body: { task, code, language }
      });

      if (error) throw error;
      
      setResult(data.result);
      toast({
        title: "Complete!",
        description: "कोड तयार झाला आहे",
      });
    } catch (error) {
      console.error('Code assistant error:', error);
      toast({
        title: "Error",
        description: "Failed to process code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold jarvis-text-glow">Code Assistant</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select value={task} onValueChange={setTask}>
          <SelectTrigger className="jarvis-border bg-background/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="jarvis-border bg-card/95 backdrop-blur-xl">
            <SelectItem value="generate">Generate Code</SelectItem>
            <SelectItem value="explain">Explain Code</SelectItem>
            <SelectItem value="debug">Debug Code</SelectItem>
            <SelectItem value="optimize">Optimize Code</SelectItem>
          </SelectContent>
        </Select>

        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="jarvis-border bg-background/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="jarvis-border bg-card/95 backdrop-blur-xl">
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={task === 'generate' ? "वर्णन द्या... (Describe what you want...)" : "कोड पेस्ट करा... (Paste code...)"}
        className="jarvis-border bg-background/50 min-h-[120px] font-mono text-sm"
        disabled={loading}
      />

      <Button
        onClick={processCode}
        disabled={loading || !code.trim()}
        className="w-full jarvis-glow"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Code className="w-4 h-4 mr-2" />
            {task === 'generate' ? 'Generate' : task === 'explain' ? 'Explain' : task === 'debug' ? 'Debug' : 'Optimize'}
          </>
        )}
      </Button>

      {result && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Result:</p>
          <Textarea
            value={result}
            readOnly
            className="jarvis-border bg-background/30 min-h-[200px] font-mono text-sm"
          />
        </div>
      )}
    </Card>
  );
};

export default CodeAssistant;
