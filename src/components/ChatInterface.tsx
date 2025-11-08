import { useState, useRef, useEffect } from "react";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  onSpeaking: (speaking: boolean) => void;
}

const ChatInterface = ({ onSpeaking }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    
    // Listen for voice transcripts
    const handleVoiceTranscript = (event: any) => {
      if (event.detail) {
        sendMessage(event.detail);
      }
    };
    
    // Listen for command results
    const handleCommandResult = (event: any) => {
      if (event.detail) {
        const commandMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: event.detail,
        };
        setMessages((prev) => [...prev, commandMessage]);
        saveMessage("assistant", event.detail);
      }
    };
    
    window.addEventListener("voiceTranscript", handleVoiceTranscript);
    window.addEventListener("commandResult", handleCommandResult);
    
    return () => {
      window.removeEventListener("voiceTranscript", handleVoiceTranscript);
      window.removeEventListener("commandResult", handleCommandResult);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    if (data) {
      setMessages(
        data.map((conv) => ({
          id: conv.id,
          role: conv.role as "user" | "assistant",
          content: conv.message,
        }))
      );
    }
  };

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from("conversations").insert({
      user_id: user?.id || null,
      role,
      message: content,
    });

    if (error) {
      console.error("Error saving message:", error);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    onSpeaking(true);

    await saveMessage("user", textToSend);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let assistantId = (Date.now() + 1).toString();

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
                assistantMessage += content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];

                  if (lastMessage?.role === "assistant" && lastMessage.id === assistantId) {
                    newMessages[newMessages.length - 1] = {
                      ...lastMessage,
                      content: assistantMessage,
                    };
                  } else {
                    newMessages.push({
                      id: assistantId,
                      role: "assistant",
                      content: assistantMessage,
                    });
                  }

                  return newMessages;
                });
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      if (assistantMessage) {
        await saveMessage("assistant", assistantMessage);
        
        // Text-to-speech with language detection
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(assistantMessage);
          utterance.rate = 1.1;
          utterance.pitch = 1;
          
          // Auto-detect language and set appropriate voice
          const voices = speechSynthesis.getVoices();
          const hindiVoice = voices.find(v => v.lang.startsWith('hi'));
          const marathiVoice = voices.find(v => v.lang.startsWith('mr'));
          
          // Try to detect language from content
          if (/[\u0900-\u097F]/.test(assistantMessage)) {
            // Contains Devanagari script (Hindi/Marathi)
            utterance.lang = 'hi-IN';
            if (hindiVoice) utterance.voice = hindiVoice;
          } else if (marathiVoice && /[\u0900-\u097F]/.test(assistantMessage)) {
            utterance.lang = 'mr-IN';
            utterance.voice = marathiVoice;
          }
          
          utterance.onend = () => onSpeaking(false);
          speechSynthesis.speak(utterance);
        } else {
          onSpeaking(false);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to get response from JARVIS",
        variant: "destructive",
      });
      onSpeaking(false);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("user_id", user?.id || null);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to clear conversations",
        variant: "destructive",
      });
      return;
    }

    setMessages([]);
    toast({
      title: "Success",
      description: "Conversation history cleared",
    });
  };

  return (
    <Card className="flex flex-col h-[600px] jarvis-border bg-card/50 backdrop-blur-xl jarvis-scan-line">
      <div className="flex items-center justify-between p-4 border-b jarvis-border">
        <h2 className="text-xl font-bold jarvis-text-glow">JARVIS Interface</h2>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearConversations}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary/20 jarvis-border"
                    : "bg-secondary/20 jarvis-border"
                }`}
              >
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-secondary/20 jarvis-border p-4 rounded-lg">
              <div className="flex gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t jarvis-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Speak with JARVIS..."
            disabled={isLoading}
            className="flex-1 jarvis-border bg-background/50 focus:jarvis-glow"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="jarvis-glow"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ChatInterface;
