import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "@/components/Dashboard";
import ChatInterface from "@/components/ChatInterface";
import VoiceControl from "@/components/VoiceControl";
import CommandPalette from "@/components/CommandPalette";
import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Voice Control */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="flex items-center justify-center"
          >
            <VoiceControl
              onTranscript={(text) => {
                // Text will be sent through ChatInterface
                const event = new CustomEvent("voiceTranscript", { detail: text });
                window.dispatchEvent(event);
              }}
              isSpeaking={isSpeaking}
            />
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <ChatInterface onSpeaking={setIsSpeaking} />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="text-center mt-12 text-sm text-muted-foreground"
        >
          <p>System Status: Online | AI Model: Gemini 2.5 Flash | Version: 1.0.0</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
