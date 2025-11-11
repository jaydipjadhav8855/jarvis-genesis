import { useState, useRef, useEffect } from "react";
import { Search, Loader2, Sparkles, Globe, BookOpen, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';

interface SearchResult {
  id: string;
  query: string;
  answer: string;
  mode: "default" | "deep";
  timestamp: number;
}

const DeepSearch = () => {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"default" | "deep">("default");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const resultEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    resultEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentAnswer]);

  const performSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "कृपया search query द्या",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setCurrentAnswer("");

    const searchResult: SearchResult = {
      id: Date.now().toString(),
      query: query,
      answer: "",
      mode: searchMode,
      timestamp: Date.now(),
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/perplexity-search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            query: query,
            searchMode: searchMode,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Search failed");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                fullAnswer += content;
                setCurrentAnswer(fullAnswer);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      if (fullAnswer) {
        searchResult.answer = fullAnswer;
        setResults((prev) => [searchResult, ...prev]);
        toast({
          title: "खोज पूर्ण झाली!",
          description: `${searchMode === "deep" ? "Deep" : "Quick"} search completed`,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Search failed. Please check your Perplexity API key.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      setQuery("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-primary jarvis-pulse" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            </div>
            <div>
              <h2 className="text-3xl font-bold jarvis-text-glow">Deep Search</h2>
              <p className="text-sm text-muted-foreground">Powered by Perplexity AI • Real-time Research</p>
            </div>
          </div>

          <Tabs value={searchMode} onValueChange={(v: any) => setSearchMode(v)}>
            <TabsList className="grid w-full grid-cols-2 jarvis-border">
              <TabsTrigger value="default" className="gap-2">
                <Zap className="w-4 h-4" />
                Quick Search
              </TabsTrigger>
              <TabsTrigger value="deep" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Deep Research
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  searchMode === "deep"
                    ? "गहन संशोधन करा... (Deep research question...)"
                    : "काहीही शोधा... (Search anything...)"
                }
                className="pl-12 jarvis-border bg-background/50 h-12 text-base"
                disabled={isSearching}
                onKeyPress={(e) => e.key === "Enter" && performSearch()}
              />
            </div>
            <Button
              onClick={performSearch}
              disabled={isSearching || !query.trim()}
              className="jarvis-glow h-12 px-8"
              size="lg"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="gap-1">
              <Globe className="w-3 h-3" />
              Real-time Web
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="w-3 h-3" />
              AI Powered
            </Badge>
            <Badge variant="outline" className="gap-1">
              <BookOpen className="w-3 h-3" />
              {searchMode === "deep" ? "Deep Analysis" : "Quick Answer"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Current Search Result (Streaming) */}
      {isSearching && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <h3 className="text-lg font-semibold">Searching: {query}</h3>
              </div>
              
              {currentAnswer && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{currentAnswer}</ReactMarkdown>
                </div>
              )}
              <div ref={resultEndRef} />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Previous Results */}
      <AnimatePresence>
        {results.map((result) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="w-4 h-4 text-primary" />
                      <h3 className="text-lg font-semibold">{result.query}</h3>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {result.mode === "deep" ? "Deep Research" : "Quick Search"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {new Date(result.timestamp).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{result.answer}</ReactMarkdown>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {results.length === 0 && !isSearching && (
        <Card className="p-12 jarvis-border bg-card/50 backdrop-blur-xl text-center">
          <Sparkles className="w-16 h-16 text-primary/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ready to Research</h3>
          <p className="text-muted-foreground mb-6">
            Ask anything - from simple questions to complex research topics
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
            <Button
              variant="outline"
              className="justify-start jarvis-border"
              onClick={() => {
                setQuery("What are the latest breakthroughs in AI?");
                setSearchMode("deep");
              }}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Latest AI breakthroughs
            </Button>
            <Button
              variant="outline"
              className="justify-start jarvis-border"
              onClick={() => {
                setQuery("How does quantum computing work?");
                setSearchMode("deep");
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Quantum computing explained
            </Button>
            <Button
              variant="outline"
              className="justify-start jarvis-border"
              onClick={() => {
                setQuery("Best practices for React development");
                setSearchMode("default");
              }}
            >
              <Globe className="w-4 h-4 mr-2" />
              React best practices
            </Button>
            <Button
              variant="outline"
              className="justify-start jarvis-border"
              onClick={() => {
                setQuery("Climate change solutions 2025");
                setSearchMode("deep");
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Climate solutions 2025
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DeepSearch;
