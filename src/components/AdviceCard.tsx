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
  onTranslate: (targetLang: string) => void;
}

export const AdviceCard = ({ advice, explanation, source, language, onTranslate }: AdviceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isPlaying && !isPaused) {
        // Stop current speech
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        return;
      }

      if (isPaused && currentUtterance) {
        // Resume paused speech
        window.speechSynthesis.resume();
        setIsPaused(false);
        return;
      }

      // Start new speech
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
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
        
        // Try fallback to English if language not supported
        if (language !== 'en') {
          const fallbackUtterance = new SpeechSynthesisUtterance(text);
          fallbackUtterance.lang = 'en-US';
          fallbackUtterance.rate = 0.9;
          
          fallbackUtterance.onstart = () => setIsPlaying(true);
          fallbackUtterance.onend = () => {
            setIsPlaying(false);
            setCurrentUtterance(null);
          };
          
          fallbackUtterance.onerror = () => {
            setIsPlaying(false);
            setCurrentUtterance(null);
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
        } else {
          toast({
            title: getStringTranslation(language, 'speechNotAvailable') || 'Speech not available',
            description: getStringTranslation(language, 'speechNotAvailableDesc') || 'Unable to read text aloud.',
            variant: "destructive",
          });
        }
      };

      setCurrentUtterance(utterance);
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: getStringTranslation(language, 'speechNotSupported') || 'Speech not supported',
        description: getStringTranslation(language, 'speechNotSupportedDesc') || 'Your browser does not support text-to-speech.',
        variant: "destructive",
      });
    }
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
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentUtterance(null);
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
                variant="outline"
                size="sm"
                onClick={() => speakText(advice)}
                className="touch-target"
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
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {getStringTranslation(language, 'source')}: {source}
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