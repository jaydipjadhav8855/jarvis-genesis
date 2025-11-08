import { useState } from "react";
import { Image, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "कृपया prompt द्या (Please provide prompt)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('image-generation', {
        body: { prompt }
      });

      if (error) throw error;
      
      setGeneratedImage(data.image);
      toast({
        title: "Image Generated!",
        description: "आपली image तयार झाली आहे",
      });
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `jarvis-${Date.now()}.png`;
    link.click();
  };

  return (
    <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Image className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold jarvis-text-glow">Image Generator</h3>
      </div>

      <div className="space-y-3">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="वर्णन द्या... (Describe the image...)"
          className="jarvis-border bg-background/50"
          disabled={loading}
          onKeyPress={(e) => e.key === 'Enter' && generateImage()}
        />
        
        <Button
          onClick={generateImage}
          disabled={loading || !prompt.trim()}
          className="w-full jarvis-glow"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image className="w-4 h-4 mr-2" />
              Generate Image
            </>
          )}
        </Button>
      </div>

      {generatedImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <div className="relative rounded-lg overflow-hidden jarvis-border">
            <img
              src={generatedImage}
              alt="Generated"
              className="w-full h-auto"
            />
          </div>
          
          <Button
            onClick={downloadImage}
            variant="outline"
            className="w-full jarvis-border"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Image
          </Button>
        </motion.div>
      )}
    </Card>
  );
};

export default ImageGenerator;
