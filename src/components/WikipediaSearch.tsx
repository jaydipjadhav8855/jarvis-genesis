import { useState } from "react";
import { BookOpen, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const WikipediaSearch = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; summary: string; url: string } | null>(null);
  const { toast } = useToast();

  const search = async () => {
    if (!query.trim()) {
      toast({
        title: "कृपया search query द्या",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('wikipedia', {
        body: { query }
      });

      if (error) throw error;
      
      setResult(data);
      
      toast({
        title: "माहिती मिळाली!",
        description: "Wikipedia वरून माहिती आली आहे",
      });
    } catch (error) {
      console.error('Wikipedia search error:', error);
      toast({
        title: "Error",
        description: "Failed to search Wikipedia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold jarvis-text-glow">Wikipedia Search</h3>
      </div>

      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Wikipedia वर शोधा... (Search Wikipedia...)"
          className="jarvis-border bg-background/50"
          disabled={loading}
          onKeyPress={(e) => e.key === 'Enter' && search()}
        />
        <Button onClick={search} disabled={loading} className="jarvis-glow">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <BookOpen className="w-4 h-4" />
          )}
        </Button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="p-4 rounded-lg jarvis-border bg-background/30">
            <h4 className="text-lg font-semibold text-foreground mb-2">{result.title}</h4>
            <p className="text-sm text-muted-foreground mb-3">{result.summary}</p>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
            >
              Read more on Wikipedia
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      )}
    </Card>
  );
};

export default WikipediaSearch;
