import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VoiceInput from "./VoiceInput";
import { DemoQuestionsShowcase } from "./DemoQuestionsShowcase";
import { processLanguageQuery } from "@/utils/languageProcessor";
import { Send, Sparkles, HelpCircle } from "lucide-react";
import { getTranslation, getStringTranslation, translations } from "@/utils/translations";

interface QueryInputProps {
  onSubmit: (query: string) => void;
  language: string;
  isLoading?: boolean;
  onLanguageDetected?: (detectedLang: string) => void;
}

export const QueryInput = ({ onSubmit, language, isLoading, onLanguageDetected }: QueryInputProps) => {
  const [query, setQuery] = useState("");
  const [currentDemo, setCurrentDemo] = useState(0);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [languageConfidence, setLanguageConfidence] = useState<number>(0);
  const [showDemoQuestions, setShowDemoQuestions] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Get all demo queries from all languages
      const allDemoQueries = Object.keys(translations).flatMap(lang => 
        getTranslation(lang, 'demoQueries') as string[]
      );
      setCurrentDemo((prev) => (prev + 1) % allDemoQueries.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentPlaceholder = () => {
    // Get all demo queries from all languages
    const allDemoQueries = Object.keys(translations).flatMap(lang => 
      getTranslation(lang, 'demoQueries') as string[]
    );
    return allDemoQueries[currentDemo] || "Ask your farming question...";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      // Process language before submitting
      const langResult = processLanguageQuery(query.trim());

      if (langResult.detectedLanguage !== language && onLanguageDetected) {
        onLanguageDetected(langResult.detectedLanguage);
      }

      onSubmit(query.trim());
      setQuery("");
      setDetectedLanguage(null);
      setLanguageConfidence(0);
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setQuery(transcript);

    // Immediately detect language for the voice input
    const langResult = processLanguageQuery(transcript);
    setDetectedLanguage(langResult.detectedLanguage);
    setLanguageConfidence(langResult.confidence);

    if (onLanguageDetected && langResult.detectedLanguage !== language) {
      onLanguageDetected(langResult.detectedLanguage);
    }

    // Auto-submit voice queries for better UX
    if (transcript.trim() && !isLoading) {
      setTimeout(() => {
        onSubmit(transcript.trim());
        setQuery("");
        setDetectedLanguage(null);
        setLanguageConfidence(0);
      }, 500); // Small delay to show the text before submitting
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 animated-search-border rounded-full">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={getCurrentPlaceholder()}
              className="pr-14 h-16 rounded-full border-0 transition-smooth focus:shadow-glow text-lg bg-card/90 backdrop-blur-sm shadow-soft"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!query.trim() || isLoading}
              className="absolute right-2 top-2 rounded-full h-12 w-12 p-0 gradient-earth shadow-glow hover:scale-110 transition-smooth"
            >
              {isLoading ? (
                <Sparkles className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>

          <VoiceInput
            language={language}
            onResult={handleVoiceResult}
            onLanguageDetected={onLanguageDetected}
            disabled={isLoading}
          />

          {/* Demo Questions Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDemoQuestions(!showDemoQuestions)}
            className="flex items-center gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Demo Questions
          </Button>
        </div>
      </form>
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground px-4 font-medium">
          {getStringTranslation(language, 'askInAnyLanguage')}
        </p>
        {detectedLanguage && languageConfidence > 0.6 && (
          <div className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs text-blue-700">
            <Sparkles className="h-3 w-3" />
            <span>Language detected: {detectedLanguage.toUpperCase()} ({(languageConfidence * 100).toFixed(0)}%)</span>
          </div>
        )}
      </div>
    </div>
  );
};
