import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoiceInput } from "./VoiceInput";
import { Send, Sparkles } from "lucide-react";

const demoQueries = [
  { en: "How to increase wheat yield?", hi: "गेहूं की उपज कैसे बढ़ाएं?", mr: "गहू पिकाची उत्पादकता कशी वाढवावी?", ta: "கோதுமை விளைச்சல் எவ்வாறு அதிகரிப்பது?" },
  { en: "Best time to plant rice?", hi: "चावल लगाने का सबसे अच्छा समय?", mr: "तांदुळ लावण्याची सर्वोत्तम वेळ?", ta: "அரிசி நடவு செய்ய சிறந்த நேரம்?" },
  { en: "How to control pest attacks?", hi: "कीट के हमले को कैसे रोकें?", mr: "कीड हल्ल्यावर कसे नियंत्रण ठेवावे?", ta: "பூச்சி தாக்குதல்களை எவ்வாறு கட்டுப்படுத்துவது?" },
];

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
      setCurrentDemo((prev) => (prev + 1) % demoQueries.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentPlaceholder = () => {
    const demo = demoQueries[currentDemo];
    return demo[language as keyof typeof demo] || demo.en;
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
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={getCurrentPlaceholder()}
              className="pr-12 h-12 rounded-full border-2 transition-smooth focus:shadow-soft text-base"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!query.trim() || isLoading}
              className="absolute right-1 top-1 rounded-full h-10 w-10 p-0 gradient-earth"
            >
              {isLoading ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <VoiceInput onTranscript={handleVoiceTranscript} language={language} />
        </div>
      </form>
      <p className="text-sm text-muted-foreground text-center px-4">
        Ask in any Indian language or mix languages naturally
      </p>
    </div>
  );
};