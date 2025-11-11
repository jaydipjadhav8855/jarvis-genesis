import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "@/components/Dashboard";
import ChatInterface from "@/components/ChatInterface";
import VoiceControl from "@/components/VoiceControl";
import CommandPalette from "@/components/CommandPalette";
import ParticleBackground from "@/components/ParticleBackground";
import ImageGenerator from "@/components/ImageGenerator";
import WebSearchPanel from "@/components/WebSearchPanel";
import WikipediaSearch from "@/components/WikipediaSearch";
import DeepSearch from "@/components/DeepSearch";
import CodeAssistant from "@/components/CodeAssistant";
import FileAnalyzer from "@/components/FileAnalyzer";
import TaskManager from "@/components/TaskManager";
import WeatherWidget from "@/components/WeatherWidget";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, MessageSquare, Image, Search, Code, FileText, CheckSquare, Cloud, BookOpen, Zap } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const navigate = useNavigate();

  const handleCommandResult = (result: string) => {
    const event = new CustomEvent("commandResult", { detail: result });
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen p-8 relative">
      <ParticleBackground />
      
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button
          onClick={() => navigate('/features')}
          className="jarvis-glow gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Advanced Features
        </Button>
        <CommandPalette onCommandResult={handleCommandResult} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 jarvis-hologram opacity-30 blur-3xl" />
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl font-bold mb-4 jarvis-text-glow"
          >
            J.A.R.V.I.S.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-muted-foreground mb-2"
          >
            Just A Rather Very Intelligent System
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-sm text-primary"
          >
            ⚡ Powered by Jayvik Labs – Human + AI Intelligence
          </motion.p>
        </div>

        {/* Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Dashboard />
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-8"
        >
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9 jarvis-border">
              <TabsTrigger value="chat" className="gap-1 text-xs lg:text-sm">
                <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="deep-search" className="gap-1 text-xs lg:text-sm">
                <Zap className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Deep Search</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="gap-1 text-xs lg:text-sm">
                <Image className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Image</span>
              </TabsTrigger>
              <TabsTrigger value="search" className="gap-1 text-xs lg:text-sm">
                <Search className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Web</span>
              </TabsTrigger>
              <TabsTrigger value="wiki" className="gap-1 text-xs lg:text-sm">
                <BookOpen className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Wiki</span>
              </TabsTrigger>
              <TabsTrigger value="weather" className="gap-1 text-xs lg:text-sm">
                <Cloud className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Weather</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-1 text-xs lg:text-sm">
                <Code className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Code</span>
              </TabsTrigger>
              <TabsTrigger value="file" className="gap-1 text-xs lg:text-sm">
                <FileText className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Files</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-1 text-xs lg:text-sm">
                <CheckSquare className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Tasks</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex items-center justify-center">
                  <VoiceControl
                    onTranscript={(text) => {
                      const event = new CustomEvent("voiceTranscript", { detail: text });
                      window.dispatchEvent(event);
                    }}
                    isSpeaking={isSpeaking}
                  />
                </div>
                <ChatInterface onSpeaking={setIsSpeaking} />
              </div>
            </TabsContent>

            <TabsContent value="deep-search" className="mt-6">
              <DeepSearch />
            </TabsContent>

            <TabsContent value="image" className="mt-6">
              <div className="max-w-2xl mx-auto">
                <ImageGenerator />
              </div>
            </TabsContent>

            <TabsContent value="search" className="mt-6">
              <div className="max-w-2xl mx-auto">
                <WebSearchPanel />
              </div>
            </TabsContent>

            <TabsContent value="wiki" className="mt-6">
              <div className="max-w-2xl mx-auto">
                <WikipediaSearch />
              </div>
            </TabsContent>

            <TabsContent value="weather" className="mt-6">
              <div className="max-w-2xl mx-auto">
                <WeatherWidget />
              </div>
            </TabsContent>

            <TabsContent value="code" className="mt-6">
              <div className="max-w-4xl mx-auto">
                <CodeAssistant />
              </div>
            </TabsContent>

            <TabsContent value="file" className="mt-6">
              <div className="max-w-4xl mx-auto">
                <FileAnalyzer />
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <div className="max-w-2xl mx-auto">
                <TaskManager />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="mt-12"
        >
          <div className="jarvis-card p-8 text-center">
            <h2 className="text-3xl font-bold jarvis-text-glow mb-4">About J.A.R.V.I.S.</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg">
                Developed by <span className="text-primary font-semibold">Jayvik Labs</span>
              </p>
              <p className="text-base">
                Founder & Creator: <span className="text-primary font-semibold">Jaydip Jadhav</span>
              </p>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm">
                  Jayvik Labs combines cutting-edge AI technology with human intelligence to create 
                  innovative solutions that empower users with advanced capabilities.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.6 }}
          className="text-center mt-8 text-sm text-muted-foreground"
        >
          <p>System Status: Online | AI Models: Gemini 2.5 + GPT-5 + Perplexity | Version: 2.0.0</p>
          <p className="mt-2 text-xs">Features: Chat • Deep Search • Voice • Image Gen • Web Search • Weather • Code Gen • File Analysis • Task Manager</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
