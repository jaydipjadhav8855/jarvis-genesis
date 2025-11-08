import { useState } from "react";
import { Search, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface SearchResult {
  title: string;
  url: string;
  description: string;
}

const WebSearchPanel = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
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
      const { data, error } = await supabase.functions.invoke('web-search', {
        body: { query }
      });

      if (error) throw error;
      
      setAnswer(data.answer);
      setResults(data.results || []);
      
      toast({
        title: "Search Complete!",
        description: "परिणाम मिळाले आहेत",
      });
    } catch (error) {
      console.error('Web search error:', error);
      toast({
        title: "Error",
        description: "Failed to search",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold jarvis-text-glow">Web Search</h3>
      </div>

      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="वेबवर शोधा... (Search the web...)"
          className="jarvis-border bg-background/50"
          disabled={loading}
          onKeyPress={(e) => e.key === 'Enter' && search()}
        />
        <Button onClick={search} disabled={loading} className="jarvis-glow">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {answer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg jarvis-border bg-background/30"
        >
          <p className="text-sm text-foreground">{answer}</p>
        </motion.div>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          <p className="text-sm font-semibold text-foreground">Related Results:</p>
          {results.map((result, index) => (
            <motion.a
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg jarvis-border bg-background/20 hover:bg-background/40 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {result.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {result.description}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </Card>
  );
};

export default WebSearchPanel;
