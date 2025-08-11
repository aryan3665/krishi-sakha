import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX, ChevronDown, ChevronUp, Languages, Pause, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStringTranslation } from "@/utils/translations";

interface AdviceCardProps {
  advice: string;
  explanation: string;
  source: string;
  language: string;
  sources?: string[];
  onTranslate: (targetLang: string) => void;
}

export const AdviceCard = ({ advice, explanation, source, language, sources, onTranslate }: AdviceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const { toast } = useToast();

  const resetSpeechState = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentUtterance(null);
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
      toast({
        title: getStringTranslation(language, 'speechNotSupported') || 'Speech not supported',
        description: getStringTranslation(language, 'speechNotSupportedDesc') || 'Your browser does not support text-to-speech.',
        variant: "destructive",
      });
      return;
    }

    // Stop current speech if playing
    if (isPlaying && !isPaused) {
      window.speechSynthesis.cancel();
      resetSpeechState();
      return;
    }

    // Resume paused speech
    if (isPaused && currentUtterance) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    // Cancel any existing speech and wait for it to clear
    window.speechSynthesis.cancel();
    
    // Small delay to ensure speechSynthesis is properly reset
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(language);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };
      
      utterance.onend = () => {
        resetSpeechState();
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        resetSpeechState();
        
        // Try fallback to English if language not supported
        if (language !== 'en' && event.error !== 'interrupted') {
          setTimeout(() => {
            const fallbackUtterance = new SpeechSynthesisUtterance(text);
            fallbackUtterance.lang = 'en-US';
            fallbackUtterance.rate = 0.9;
            
            fallbackUtterance.onstart = () => setIsPlaying(true);
            fallbackUtterance.onend = () => resetSpeechState();
            fallbackUtterance.onerror = () => {
              resetSpeechState();
              toast({
                title: getStringTranslation(language, 'speechNotAvailable') || 'Speech not available',
                description: getStringTranslation(language, 'speechNotAvailableDesc') || 'Unable to read text aloud.',
                variant: "destructive",
              });
            };
            
            window.speechSynthesis.speak(fallbackUtterance);
            setCurrentUtterance(fallbackUtterance);
            
            toast({
              title: "Language not supported",
              description: "Reading in English instead.",
              variant: "default",
            });
          }, 100);
        } else if (event.error !== 'interrupted') {
          toast({
            title: getStringTranslation(language, 'speechNotAvailable') || 'Speech not available',
            description: getStringTranslation(language, 'speechNotAvailableDesc') || 'Unable to read text aloud.',
            variant: "destructive",
          });
        }
      };

      setCurrentUtterance(utterance);
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const pauseResumeSpeech = () => {
    if (!isPlaying) return;
    
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    resetSpeechState();
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
    <Card className="shadow-soft transition-smooth hover:shadow-glow harvest-border fertile-glow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main advice */}
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-lg font-semibold leading-relaxed">{advice}</p>
            </div>
            <div className="flex gap-2">
              {/* Primary Listen/Stop Button */}
              <Button
                variant={isPlaying ? "default" : "outline"}
                size="sm"
                onClick={() => speakText(advice)}
                className="touch-target"
                disabled={!speechSupported}
                aria-label={isPlaying ? 
                  (getStringTranslation(language, 'stopReading') || 'Stop reading') : 
                  (getStringTranslation(language, 'readAloud') || 'Read aloud')}
              >
                {isPlaying ? (
                  <VolumeX className="h-4 w-4 animate-pulse" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              {/* Pause/Resume Button - only show when playing */}
              {isPlaying && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pauseResumeSpeech}
                  className="touch-target"
                  aria-label={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTranslate(language)}
                className="touch-target"
                aria-label={getStringTranslation(language, 'translateAdvice') || 'Translate advice'}
              >
                <Languages className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Source badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {getStringTranslation(language, 'source')}: {source}
            </Badge>
            {sources && sources.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {sources.map((dataSource, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {dataSource}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Expandable explanation */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full justify-between p-0 h-auto text-left"
            >
              <span className="text-sm font-medium">
                {isExpanded ? getStringTranslation(language, 'hideExplanation') : getStringTranslation(language, 'showExplanation')}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            {isExpanded && (
              <div className="animate-fade-in space-y-3">
                <div className="flex items-start gap-3">
                  <p className="flex-1 text-sm text-muted-foreground leading-relaxed border-l-4 border-primary/20 pl-4">
                    {explanation}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakText(explanation)}
                    className="touch-target p-1"
                    disabled={!speechSupported}
                    aria-label="Read explanation aloud"
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};