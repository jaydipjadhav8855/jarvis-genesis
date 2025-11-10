import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import CodeAssistant from "@/components/CodeAssistant";
import FileAnalyzer from "@/components/FileAnalyzer";
import TaskManager from "@/components/TaskManager";
import JarvisOrb from "@/components/JarvisOrb";
import ParticleBackground from "@/components/ParticleBackground";
import { motion } from "framer-motion";

const Features = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 relative">
      <ParticleBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="jarvis-glow"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold jarvis-text-glow mb-2">
            Advanced AI Tools
          </h1>
          <p className="text-muted-foreground">
            Powered by Lovable AI & Jayvik Labs
          </p>
        </motion.div>

        <Tabs defaultValue="code" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="code">Code Assistant</TabsTrigger>
            <TabsTrigger value="files">File Analyzer</TabsTrigger>
            <TabsTrigger value="tasks">Task Manager</TabsTrigger>
          </TabsList>

          <TabsContent value="code">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CodeAssistant />
              </div>
              <div>
                <JarvisOrb isSpeaking={false} isListening={false} onClick={() => {}} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <FileAnalyzer />
              </div>
              <div>
                <JarvisOrb isSpeaking={false} isListening={false} onClick={() => {}} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TaskManager />
              </div>
              <div>
                <JarvisOrb isSpeaking={false} isListening={false} onClick={() => {}} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Features;