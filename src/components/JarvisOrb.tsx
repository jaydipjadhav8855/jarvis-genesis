import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

interface JarvisOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  onClick: () => void;
}

const JarvisOrb = ({ isListening, isSpeaking, onClick }: JarvisOrbProps) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      <motion.div
        className="absolute w-64 h-64 rounded-full border-2 jarvis-border opacity-20"
        animate={{
          scale: isSpeaking ? [1, 1.2, 1] : isListening ? [1, 1.1, 1] : 1,
          opacity: isSpeaking || isListening ? [0.2, 0.4, 0.2] : 0.2,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full border-2 jarvis-border opacity-30"
        animate={{
          scale: isSpeaking ? [1, 1.15, 1] : isListening ? [1, 1.08, 1] : 1,
          opacity: isSpeaking || isListening ? [0.3, 0.5, 0.3] : 0.3,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main orb */}
      <motion.button
        onClick={onClick}
        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-xl border-2 jarvis-border flex items-center justify-center cursor-pointer transition-all hover:scale-105"
        animate={{
          boxShadow: isSpeaking
            ? [
                "0 0 40px hsl(var(--jarvis-glow) / 0.6)",
                "0 0 80px hsl(var(--jarvis-glow) / 0.8)",
                "0 0 40px hsl(var(--jarvis-glow) / 0.6)",
              ]
            : isListening
            ? [
                "0 0 30px hsl(var(--jarvis-glow) / 0.5)",
                "0 0 60px hsl(var(--jarvis-glow) / 0.7)",
                "0 0 30px hsl(var(--jarvis-glow) / 0.5)",
              ]
            : "0 0 20px hsl(var(--jarvis-glow) / 0.3)",
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Inner pulse */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20"
          animate={{
            scale: isSpeaking ? [1, 1.3, 1] : isListening ? [1, 1.2, 1] : [1, 1.1, 1],
            opacity: isSpeaking ? [0.5, 0, 0.5] : isListening ? [0.4, 0, 0.4] : [0.3, 0, 0.3],
          }}
          transition={{
            duration: isSpeaking ? 0.8 : isListening ? 1 : 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* Icon */}
        {isListening ? (
          <Mic className="w-12 h-12 text-primary jarvis-text-glow z-10" />
        ) : (
          <MicOff className="w-12 h-12 text-muted-foreground/60 z-10" />
        )}
      </motion.button>
    </div>
  );
};

export default JarvisOrb;
