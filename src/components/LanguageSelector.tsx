import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown } from "lucide-react";

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  variant?: "default" | "footer";
}

export const LanguageSelector = ({ selectedLanguage, onLanguageChange, variant = "default" }: LanguageSelectorProps) => {
  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  if (variant === "footer") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700">
            <Globe className="h-4 w-4" />
            <span>{currentLanguage.native}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-600">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => onLanguageChange(language.code)}
              className="flex items-center justify-between text-gray-300 hover:bg-gray-700 focus:bg-gray-700"
            >
              <span>{language.native}</span>
              <span className="text-gray-400 text-sm">{language.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 touch-target">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.native}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            className="flex items-center justify-between"
          >
            <span>{language.native}</span>
            <span className="text-muted-foreground text-sm">{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
