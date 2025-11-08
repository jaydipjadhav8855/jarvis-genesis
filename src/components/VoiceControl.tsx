import { useState, useEffect, useRef } from "react";
import JarvisOrb from "./JarvisOrb";
import { useToast } from "@/components/ui/use-toast";

interface VoiceControlProps {
  onTranscript: (text: string) => void;
  isSpeaking: boolean;
}

const VoiceControl = ({ onTranscript, isSpeaking }: VoiceControlProps) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Voice transcript:", transcript);
        onTranscript(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        
        if (event.error !== "no-speech" && event.error !== "aborted") {
          toast({
            title: "Voice Recognition Error",
            description: "Please try again",
            variant: "destructive",
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive",
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast({
          title: "Listening",
          description: "Speak now...",
        });
      } catch (error) {
        console.error("Error starting recognition:", error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <JarvisOrb
        isListening={isListening}
        isSpeaking={isSpeaking}
        onClick={toggleListening}
      />
      <p className="mt-6 text-sm text-muted-foreground">
        {isListening
          ? "Listening..."
          : isSpeaking
          ? "JARVIS is speaking..."
          : "Click to activate voice input"}
      </p>
    </div>
  );
};

export default VoiceControl;
