import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

const languages = [
  { code: "en-US", name: "English", native: "English" },
  { code: "hi-IN", name: "Hindi", native: "हिंदी" },
  { code: "mr-IN", name: "Marathi", native: "मराठी" },
  { code: "ta-IN", name: "Tamil", native: "தமிழ்" },
  { code: "te-IN", name: "Telugu", native: "తెలుగు" },
  { code: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml-IN", name: "Malayalam", native: "മലയാളം" },
  { code: "bn-IN", name: "Bengali", native: "বাংলা" },
  { code: "gu-IN", name: "Gujarati", native: "ગુજરાતી" },
  { code: "pa-IN", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
];

const LanguageSelector = ({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) => {
  return (
    <div className="flex items-center gap-2 p-2 jarvis-border rounded-lg bg-card/50 backdrop-blur-xl">
      <Globe className="w-4 h-4 text-primary" />
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-[180px] border-0 focus:ring-0">
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent className="jarvis-border bg-card/95 backdrop-blur-xl">
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.native} ({lang.name})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
