import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Key, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  Copy,
  Settings,
  Cloud,
  Terminal,
  Info
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const GeminiApiHelper = () => {
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Command copied to clipboard",
    });
  };

  const steps = [
    {
      title: "Get Gemini API Key",
      description: "Obtain your API key from Google AI Studio",
      icon: <Key className="h-5 w-5" />,
      action: () => window.open('https://aistudio.google.com/app/apikey', '_blank')
    },
    {
      title: "Set Environment Variable",
      description: "Configure the API key in Supabase Edge Functions",
      icon: <Settings className="h-5 w-5" />,
      action: () => window.open('https://app.supabase.com/project/vilhreflbavpivsahfgi/functions', '_blank')
    },
    {
      title: "Deploy Function",
      description: "Redeploy the Edge Function with new environment",
      icon: <Cloud className="h-5 w-5" />
    }
  ];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-xl">Fix Gemini API Configuration</CardTitle>
        </div>
        <CardDescription>
          The Edge Function is missing the GEMINI_API_KEY environment variable
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Status */}
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <strong>Issue:</strong> Edge Function returning 500 error due to missing GEMINI_API_KEY
          </AlertDescription>
        </Alert>

        {/* Quick Solution */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Quick Solution
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            The app will continue to work with offline AI responses, but to enable full Gemini AI features:
          </p>
          
          <div className="space-y-3">
            {steps.map((stepItem, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded border">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step > index + 1 ? 'bg-green-100 text-green-600' : 
                  step === index + 1 ? 'bg-blue-100 text-blue-600' : 
                  'bg-gray-100 text-gray-400'
                }`}>
                  {step > index + 1 ? <CheckCircle className="h-4 w-4" /> : stepItem.icon}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{stepItem.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{stepItem.description}</p>
                </div>
                
                {stepItem.action && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      stepItem.action!();
                      setStep(Math.max(step, index + 2));
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Detailed Instructions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Detailed Setup Instructions</h3>
          
          {/* Step 1: Get API Key */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Get Gemini API Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-600 hover:underline">Google AI Studio</a></li>
                <li>Sign in with your Google account</li>
                <li>Click "Create API Key"</li>
                <li>Copy the generated API key</li>
              </ol>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Google AI Studio
              </Button>
            </CardContent>
          </Card>

          {/* Step 2: Set Environment Variable */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="bg-green-100 text-green-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Configure in Supabase
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to your Supabase Dashboard → Edge Functions</li>
                <li>Click on "Settings" or "Environment Variables"</li>
                <li>Add a new environment variable:</li>
              </ol>
              
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">Environment Variable</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard('GEMINI_API_KEY')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <code className="text-sm">
                  <strong>Name:</strong> GEMINI_API_KEY<br/>
                  <strong>Value:</strong> [your-api-key-here]
                </code>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('https://app.supabase.com/project/vilhreflbavpivsahfgi/functions', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Supabase Edge Functions
              </Button>
            </CardContent>
          </Card>

          {/* Step 3: Deploy */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="bg-purple-100 text-purple-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Deploy Edge Function
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">After setting the environment variable, redeploy the Edge Function:</p>
              
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span>Terminal Command</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard('supabase functions deploy generate-advice')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <code>$ supabase functions deploy generate-advice</code>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Or use the Supabase Dashboard to redeploy the function
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current Workaround */}
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Good News:</strong> The app continues to work with offline AI responses while you configure the API key.
            All features remain functional with structured data and fallback AI responses.
          </AlertDescription>
        </Alert>

        {/* Alternative: Use Offline Mode */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Alternative: Continue with Offline AI
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            If you prefer not to set up the API key, the app will continue to work with:
          </p>
          <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
            <li>• Structured market and weather data summaries</li>
            <li>• Offline AI responses for farming advice</li>
            <li>• Real-time data integration (without AI enhancement)</li>
            <li>• All core agricultural features</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
