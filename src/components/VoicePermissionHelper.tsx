import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Settings, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Volume2,
  Info
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VoicePermissionHelperProps {
  language: string;
  onPermissionGranted?: () => void;
  className?: string;
}

type PermissionStatus = 'checking' | 'granted' | 'denied' | 'not-supported' | 'no-microphone';

export const VoicePermissionHelper = ({ 
  language, 
  onPermissionGranted,
  className = ""
}: VoicePermissionHelperProps) => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('checking');
  const [microphoneDevices, setMicrophoneDevices] = useState<MediaDeviceInfo[]>([]);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkVoiceSupport();
  }, []);

  const checkVoiceSupport = async () => {
    try {
      // Check if Speech Recognition is supported
      const isSpeechRecognitionSupported = 
        'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

      if (!isSpeechRecognitionSupported) {
        setPermissionStatus('not-supported');
        return;
      }

      // Check for microphone devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setMicrophoneDevices(audioInputs);

      if (audioInputs.length === 0) {
        setPermissionStatus('no-microphone');
        return;
      }

      // Check microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Clean up
        setPermissionStatus('granted');
        onPermissionGranted?.();
      } catch (error: any) {
        if (error.name === 'NotAllowedError') {
          setPermissionStatus('denied');
        } else if (error.name === 'NotFoundError') {
          setPermissionStatus('no-microphone');
        } else {
          console.error('Microphone access error:', error);
          setPermissionStatus('denied');
        }
      }
    } catch (error) {
      console.error('Error checking voice support:', error);
      setPermissionStatus('not-supported');
    }
  };

  const requestMicrophonePermission = async () => {
    setIsTestingMic(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionStatus('granted');
      onPermissionGranted?.();
      
      toast({
        title: "🎤 Microphone Access Granted",
        description: "You can now use voice input features",
      });
    } catch (error: any) {
      console.error('Failed to get microphone permission:', error);
      
      if (error.name === 'NotAllowedError') {
        setPermissionStatus('denied');
        toast({
          title: "Microphone Access Denied",
          description: "Please enable microphone access in your browser settings",
          variant: "destructive",
        });
      } else {
        setPermissionStatus('no-microphone');
        toast({
          title: "Microphone Not Found",
          description: "Please check your audio device connections",
          variant: "destructive",
        });
      }
    } finally {
      setIsTestingMic(false);
    }
  };

  const openBrowserSettings = () => {
    toast({
      title: "Browser Settings",
      description: "Look for 'Site Settings' or 'Permissions' to enable microphone access",
    });
  };

  const testMicrophone = async () => {
    setIsTestingMic(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context to analyze microphone input
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      // Check for audio input for 3 seconds
      let hasInput = false;
      const checkInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        if (average > 5) {
          hasInput = true;
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
        
        if (hasInput) {
          toast({
            title: "🎤 Microphone Test Successful",
            description: "Your microphone is working properly",
          });
        } else {
          toast({
            title: "🎤 No Audio Detected",
            description: "Please speak into your microphone or check the volume",
            variant: "destructive",
          });
        }
        setIsTestingMic(false);
      }, 3000);
      
    } catch (error) {
      setIsTestingMic(false);
      toast({
        title: "Microphone Test Failed",
        description: "Unable to test microphone",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    switch (permissionStatus) {
      case 'checking':
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'denied':
        return <Shield className="h-5 w-5 text-red-500" />;
      case 'no-microphone':
        return <MicOff className="h-5 w-5 text-orange-500" />;
      case 'not-supported':
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
      default:
        return <Mic className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (permissionStatus) {
      case 'checking':
        return "Checking microphone access...";
      case 'granted':
        return "Microphone access granted - Voice input ready!";
      case 'denied':
        return "Microphone access denied - Please enable in browser settings";
      case 'no-microphone':
        return "No microphone found - Please connect an audio input device";
      case 'not-supported':
        return "Voice recognition not supported in this browser";
      default:
        return "Unknown status";
    }
  };

  if (permissionStatus === 'granted') {
    return (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          🎤 Voice input is ready! You can now use the microphone button to speak your questions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={className}>
      <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">Voice Input Setup</CardTitle>
          </div>
          <CardDescription>
            {getStatusMessage()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Microphone Devices */}
          {microphoneDevices.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Detected Audio Devices:</p>
              <div className="space-y-1">
                {microphoneDevices.map((device, index) => (
                  <Badge key={device.deviceId || index} variant="outline" className="text-xs">
                    <Volume2 className="h-3 w-3 mr-1" />
                    {device.label || `Microphone ${index + 1}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions based on status */}
          <div className="space-y-2">
            {permissionStatus === 'denied' && (
              <>
                <Button 
                  onClick={requestMicrophonePermission}
                  disabled={isTestingMic}
                  className="w-full"
                >
                  {isTestingMic && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  Request Microphone Access
                </Button>
                <Button 
                  variant="outline"
                  onClick={openBrowserSettings}
                  className="w-full"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Open Browser Settings
                </Button>
              </>
            )}

            {permissionStatus === 'no-microphone' && (
              <Button 
                onClick={checkVoiceSupport}
                disabled={isTestingMic}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Device List
              </Button>
            )}

            {permissionStatus === 'granted' && (
              <Button 
                onClick={testMicrophone}
                disabled={isTestingMic}
                variant="outline"
                className="w-full"
              >
                {isTestingMic ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing... Speak now!
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Test Microphone
                  </>
                )}
              </Button>
            )}

            {permissionStatus === 'not-supported' && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your browser doesn't support voice recognition. Try using Chrome, Safari, or Edge for voice features.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Troubleshooting Tips */}
          {(permissionStatus === 'denied' || permissionStatus === 'no-microphone') && (
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p className="font-medium">Troubleshooting tips:</p>
              <ul className="space-y-1 ml-4">
                <li>• Ensure your microphone is connected and not muted</li>
                <li>• Check browser permission settings (click the 🔒 icon in address bar)</li>
                <li>• Try refreshing the page and granting permission again</li>
                <li>• Make sure no other apps are using your microphone</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
