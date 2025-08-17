import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { startVoiceRecognition, getSTTErrorMessage } from '@/utils/languageProcessor';
import { getStringTranslation } from '@/utils/translations';

interface VoiceInputProps {
  language: string;
  onResult: (text: string) => void;
  onLanguageDetected?: (detectedLang: string) => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceInput = ({ 
  language, 
  onResult, 
  onLanguageDetected, 
  disabled = false,
  className = ""
}: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech recognition is supported
    const isSTTSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(isSTTSupported);

    if (!isSTTSupported) {
      console.warn('Speech recognition not supported in this browser');
    }

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    if (!isSupported) {
      const errorMsg = getStringTranslation(language, 'voiceNotSupported');
      toast({
        title: errorMsg,
        description: getStringTranslation(language, 'voiceNotSupportedDesc'),
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    setError(null);
    setTranscript('');
    setConfidence(0);
    setIsListening(true);

    const recognition = startVoiceRecognition(
      language,
      (result: string) => {
        console.log('🎤 Voice recognition result:', result);
        setTranscript(result);
        setIsListening(false);
        
        // Call the result handler
        onResult(result);
        
        // Show success toast
        toast({
          title: "🎤 Voice Input Successful",
          description: `Recognized: "${result.slice(0, 50)}${result.length > 50 ? '...' : ''}"`,
        });
      },
      (error: string) => {
        console.error('🎤 Voice recognition error:', error);
        setError(error);
        setIsListening(false);
        
        const errorMessage = getSTTErrorMessage(language, error);
        toast({
          title: "🎤 Voice Input Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      () => {
        console.log('🎤 Voice recognition ended');
        setIsListening(false);
      }
    );

    if (recognition) {
      recognitionRef.current = recognition;
    } else {
      setIsListening(false);
      setError('Failed to start voice recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const playTranscript = () => {
    if (!transcript) return;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(transcript);
      
      // Set language for speech synthesis
      const speechLanguages = {
        'hi': 'hi-IN',
        'bn': 'bn-IN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'mr': 'mr-IN',
        'gu': 'gu-IN',
        'pa': 'pa-IN',
        'en': 'en-IN'
      };
      
      utterance.lang = speechLanguages[language as keyof typeof speechLanguages] || 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: getStringTranslation(language, 'speechNotSupported'),
        description: getStringTranslation(language, 'speechNotSupportedDesc'),
        variant: "destructive",
      });
    }
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button variant="outline" disabled className="opacity-50">
          <MicOff className="h-4 w-4" />
          <span className="sr-only">Voice input not supported</span>
        </Button>
        <Badge variant="destructive" className="text-xs">
          Not Supported
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Voice Input Button */}
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        onClick={startListening}
        disabled={disabled}
        className={`transition-all duration-200 ${isListening ? 'animate-pulse' : ''}`}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        <span className="sr-only">
          {isListening ? getStringTranslation(language, 'stopVoice') : getStringTranslation(language, 'startVoice')}
        </span>
      </Button>

      {/* Play Transcript Button */}
      {transcript && (
        <Button
          variant="ghost"
          size="sm"
          onClick={playTranscript}
          disabled={disabled}
        >
          <Volume2 className="h-4 w-4" />
          <span className="sr-only">Play transcript</span>
        </Button>
      )}

      {/* Status Indicators */}
      {isListening && (
        <Badge variant="secondary" className="animate-pulse">
          🎤 Listening...
        </Badge>
      )}

      {transcript && !isListening && (
        <Badge variant="secondary" className="max-w-xs truncate">
          ✅ "{transcript.slice(0, 30)}..."
        </Badge>
      )}

      {error && (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Error
        </Badge>
      )}

      {/* Language Support Indicator */}
      <Badge variant="outline" className="text-xs">
        {language.toUpperCase()}
      </Badge>
    </div>
  );
};

export default VoiceInput;
