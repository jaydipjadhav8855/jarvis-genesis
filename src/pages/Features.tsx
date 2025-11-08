import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ImageGenerator from "@/components/ImageGenerator";
import TaskManager from "@/components/TaskManager";
import CodeAssistant from "@/components/CodeAssistant";
import WebSearchPanel from "@/components/WebSearchPanel";
import FileAnalyzer from "@/components/FileAnalyzer";
import ParticleBackground from "@/components/ParticleBackground";

const Features = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 relative">
      <ParticleBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="jarvis-border gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Main
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold jarvis-text-glow mb-4">
              Advanced Features
            </h1>
            <p className="text-xl text-muted-foreground">
              सगळे Nova AI सारखे फीचर्स (All Nova AI-like features)
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FileAnalyzer />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ImageGenerator />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TaskManager />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CodeAssistant />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <WebSearchPanel />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Features;
