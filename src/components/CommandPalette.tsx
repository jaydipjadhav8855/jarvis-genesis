import { useState } from "react";
import { Command, Calculator, Search, Newspaper, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface CommandPaletteProps {
  onCommandResult: (result: string) => void;
}

const CommandPalette = ({ onCommandResult }: CommandPaletteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const executeCommand = async (type: 'calculate' | 'wikipedia' | 'weather') => {
    if (!input.trim()) {
      toast({
        title: "कृपया input द्या (Please provide input)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let result = "";

      switch (type) {
        case 'calculate':
          try {
            // Safe eval for basic math
            const sanitized = input.replace(/[^0-9+\-*/().\s]/g, '');
            const calcResult = Function(`"use strict"; return (${sanitized})`)();
            result = `${input} = ${calcResult}`;
          } catch {
            result = "Invalid calculation";
          }
          break;

        case 'wikipedia':
          const { data: wikiData, error: wikiError } = await supabase.functions.invoke('wikipedia', {
            body: { query: input, language: 'en' }
          });
          if (wikiError) throw wikiError;
          result = `${wikiData.title}\n\n${wikiData.summary}\n\nRead more: ${wikiData.url}`;
          break;

        case 'weather':
          const { data: weatherData, error: weatherError } = await supabase.functions.invoke('weather', {
            body: { city: input }
          });
          if (weatherError) throw weatherError;
          result = `Weather in ${weatherData.city}:\n${weatherData.condition}\nTemperature: ${weatherData.temperature}°C (Feels like ${weatherData.feelsLike}°C)\nHumidity: ${weatherData.humidity}%\nWind: ${weatherData.windSpeed} km/h`;
          break;
      }

      onCommandResult(result);
      setInput("");
      setIsOpen(false);
      
      toast({
        title: "कमांड पूर्ण झाली (Command completed)",
        description: "परिणाम चॅटमध्ये दिसेल (Result shown in chat)",
      });
    } catch (error) {
      console.error('Command error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Command failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="jarvis-glow gap-2"
        variant="outline"
      >
        <Command className="w-4 h-4" />
        Commands
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-4 right-4 z-50"
          >
            <Card className="p-4 jarvis-border bg-card/95 backdrop-blur-xl space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2 text-foreground">Quick Commands</p>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter query..."
                  className="jarvis-border bg-background/50"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  onClick={() => executeCommand('calculate')}
                  disabled={loading}
                  variant="outline"
                  className="gap-2 jarvis-border hover:jarvis-glow"
                >
                  <Calculator className="w-4 h-4" />
                  Calculate
                </Button>

                <Button
                  onClick={() => executeCommand('wikipedia')}
                  disabled={loading}
                  variant="outline"
                  className="gap-2 jarvis-border hover:jarvis-glow"
                >
                  <Search className="w-4 h-4" />
                  Wikipedia
                </Button>

                <Button
                  onClick={() => executeCommand('weather')}
                  disabled={loading}
                  variant="outline"
                  className="gap-2 jarvis-border hover:jarvis-glow"
                >
                  <Cloud className="w-4 h-4" />
                  Weather
                </Button>

                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  className="gap-2"
                >
                  Close
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>• Calculator: Enter math (e.g., "2+2*5")</p>
                <p>• Wikipedia: Search any topic</p>
                <p>• Weather: Enter city name</p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommandPalette;
