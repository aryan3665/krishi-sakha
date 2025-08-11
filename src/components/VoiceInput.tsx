import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onVoiceResult: (text: string) => void;
  language: string;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export const VoiceInput = ({ onVoiceResult, language, isListening, setIsListening }: VoiceInputProps) => {
  const [isSupported, setIsSupported] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    // Set language based on user preference
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => {
      console.log('Voice recognition started');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice recognition result:', transcript);
      
      if (transcript.trim()) {
        onVoiceResult(transcript);
        toast({
          title: "🎤 Voice input received",
          description: `"${transcript.substring(0, 50)}${transcript.length > 50 ? '...' : ''}"`,
        });
      }
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
      
      let errorMessage = "🎤 Voice input did not work. Please check microphone permissions or try typing your question instead.";
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = "🎤 No speech detected. Please try speaking again or type your question.";
          break;
        case 'audio-capture':
          errorMessage = "🎤 Microphone not accessible. Please check permissions or type your question.";
          break;
        case 'not-allowed':
          setPermissionDenied(true);
          errorMessage = "🎤 Microphone permission denied. Please enable microphone access or type your question.";
          break;
        case 'network':
          errorMessage = "🎤 Network error during voice recognition. Please try typing your question.";
          break;
        case 'aborted':
          return; // Don't show error for user-initiated abort
        default:
          errorMessage = "🎤 Voice input failed. Please try typing your question instead.";
      }
      
      toast({
        title: "Voice Input Issue",
        description: errorMessage,
        variant: "default",
      });
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [language, onVoiceResult, setIsListening, toast]);

  const startListening = async () => {
    if (!isSupported) {
      toast({
        title: "Voice Input Not Supported",
        description: "🎤 Voice input is not supported in this browser. Please type your question instead.",
        variant: "default",
      });
      return;
    }

    if (permissionDenied) {
      toast({
        title: "Microphone Permission Required",
        description: "🎤 Please enable microphone permissions in your browser settings to use voice input.",
        variant: "default",
      });
      return;
    }

    try {
      // Check microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      
      setIsListening(true);
      recognitionRef.current?.start();
      
      toast({
        title: "🎤 Listening...",
        description: language === 'hi' ? 
          "अपना कृषि प्रश्न बोलें" : 
          "Speak your farming question now",
      });
    } catch (error) {
      console.error('Microphone access error:', error);
      setPermissionDenied(true);
      toast({
        title: "Microphone Access Denied",
        description: "🎤 Please enable microphone permissions or type your question instead.",
        variant: "default",
      });
    }
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.abort();
  };

  if (!isSupported) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="opacity-50"
        title="Voice input not supported in this browser"
      >
        <MicOff className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant={isListening ? "default" : "outline"}
      size="sm"
      onClick={isListening ? stopListening : startListening}
      className={isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""}
      title={isListening ? "Click to stop listening" : "Click to use voice input"}
    >
      {isListening ? (
        <>
          <Volume2 className="h-4 w-4 animate-pulse" />
          <span className="ml-1 text-xs">Listening...</span>
        </>
      ) : (
        <Mic className={`h-4 w-4 ${permissionDenied ? 'text-gray-400' : ''}`} />
      )}
    </Button>
  );
};
