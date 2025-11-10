import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Trash2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@supabase/supabase-js";

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
  const [user, setUser] = useState<User | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
    
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
  }, [user]);

  useEffect(() => {
    // Only scroll if there are messages and user is near bottom
    if (messages.length > 0) {
      const container = messagesEndRef.current?.parentElement;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
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
    if (!user) return;
    
    const { error } = await supabase.from("conversations").insert({
      user_id: user.id,
      role,
      message: content,
    });

    if (error) {
      console.error("Error saving message:", error);
    }
  };

  const playTextToSpeech = async (text: string) => {
    if (!ttsEnabled) {
      onSpeaking(false);
      return;
    }

    try {
      // Use browser's built-in speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings for a deeper, more authoritative voice
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 0.8; // Lower pitch for deeper voice
      utterance.volume = 1.0;

      // Try to use a deeper voice if available
      const voices = speechSynthesis.getVoices();
      const deepVoice = voices.find(voice => 
        voice.name.includes('Male') || 
        voice.name.includes('Deep') ||
        voice.name.includes('Bass')
      );
      if (deepVoice) {
        utterance.voice = deepVoice;
      }

      utterance.onend = () => {
        onSpeaking(false);
      };

      utterance.onerror = (error) => {
        console.error("Speech synthesis error:", error);
        onSpeaking(false);
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("TTS error:", error);
      onSpeaking(false);
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
        await playTextToSpeech(assistantMessage);
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
    if (!user) return;
    
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("user_id", user.id);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <Card className="flex flex-col h-[600px] jarvis-border bg-card/50 backdrop-blur-xl jarvis-scan-line">
      <div className="flex items-center justify-between p-4 border-b jarvis-border">
        <h2 className="text-xl font-bold jarvis-text-glow">JARVIS Interface</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className="text-muted-foreground"
          >
            {ttsEnabled ? (
              <Volume2 className="w-4 h-4 mr-2" />
            ) : (
              <VolumeX className="w-4 h-4 mr-2" />
            )}
            {ttsEnabled ? "Voice On" : "Voice Off"}
          </Button>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive"
          >
            Logout
          </Button>
        </div>
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
