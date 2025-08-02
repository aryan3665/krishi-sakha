import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoiceInput } from "./VoiceInput";
import { Send, Sparkles } from "lucide-react";
import { getTranslation, getStringTranslation, translations } from "@/utils/translations";

interface QueryInputProps {
  onSubmit: (query: string) => void;
  language: string;
  isLoading?: boolean;
}

export const QueryInput = ({ onSubmit, language, isLoading }: QueryInputProps) => {
  const [query, setQuery] = useState("");
  const [currentDemo, setCurrentDemo] = useState(0);

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
      onSubmit(query.trim());
      setQuery("");
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setQuery(transcript);
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
          <VoiceInput onTranscript={handleVoiceTranscript} language={language} />
        </div>
      </form>
      <p className="text-sm text-muted-foreground text-center px-4 font-medium">
        {getStringTranslation(language, 'askInAnyLanguage')}
      </p>
    </div>
  );
};