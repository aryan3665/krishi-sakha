import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, ChevronDown, ChevronUp, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdviceCardProps {
  advice: string;
  explanation: string;
  source: string;
  language: string;
  onTranslate: (targetLang: string) => void;
}

export const AdviceCard = ({ advice, explanation, source, language, onTranslate }: AdviceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(language);
      utterance.rate = 0.9;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        toast({
          title: "Speech not available",
          description: "Text-to-speech is not supported in your browser",
          variant: "destructive",
        });
      };

      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Speech not supported",
        description: "Your browser doesn't support text-to-speech",
        variant: "destructive",
      });
    }
  };

  const getLanguageCode = (lang: string) => {
    const langMap: Record<string, string> = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'mr': 'mr-IN',
      'bn': 'bn-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'gu': 'gu-IN',
      'pa': 'pa-IN',
    };
    return langMap[lang] || 'en-IN';
  };

  return (
    <Card className="shadow-soft transition-smooth hover:shadow-glow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main advice */}
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-lg font-semibold leading-relaxed">{advice}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => speakText(advice)}
                className="touch-target"
                aria-label={isPlaying ? "Stop reading" : "Read advice aloud"}
              >
                <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTranslate(language)}
                className="touch-target"
                aria-label="Translate advice"
              >
                <Languages className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Source badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Source: {source}
            </Badge>
          </div>

          {/* Expandable explanation */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full justify-between p-0 h-auto text-left"
            >
              <span className="text-sm font-medium">
                {isExpanded ? "Hide explanation" : "Show detailed explanation"}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            {isExpanded && (
              <div className="animate-fade-in">
                <p className="text-sm text-muted-foreground leading-relaxed border-l-4 border-primary/20 pl-4">
                  {explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};