import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiStatusChecker } from './ApiStatusChecker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  Mail, 
  Globe,
  Copy,
  ExternalLink 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConfigCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'checking';
  message: string;
  solution?: string;
}

export const AuthDebugger = () => {
  const [checks, setChecks] = useState<ConfigCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnostics: ConfigCheck[] = [];

    // Check 1: Supabase Connection
    try {
      const { data, error } = await supabase.auth.getSession();
      diagnostics.push({
        name: 'Supabase Connection',
        status: error ? 'fail' : 'pass',
        message: error ? `Connection failed: ${error.message}` : 'Successfully connected to Supabase',
        solution: error ? 'Check your Supabase URL and API key' : undefined
      });
    } catch (err) {
      diagnostics.push({
        name: 'Supabase Connection',
        status: 'fail',
        message: 'Failed to connect to Supabase',
        solution: 'Verify Supabase configuration in src/integrations/supabase/client.ts'
      });
    }

    // Check 2: Current URL for OAuth
    const currentUrl = window.location.origin;
    const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');
    
    diagnostics.push({
      name: 'OAuth Redirect URL',
      status: isLocalhost ? 'warning' : 'pass',
      message: `Current URL: ${currentUrl}`,
      solution: isLocalhost ? 
        'For Google OAuth, you need to add this URL to your Google OAuth client configuration' : 
        undefined
    });

    // Check 3: Test Email Configuration
    try {
      // Try to get auth settings (this will fail gracefully if not accessible)
      diagnostics.push({
        name: 'Email Service',
        status: 'warning',
        message: 'Email service configuration cannot be checked from client-side',
        solution: 'Check Supabase Dashboard > Authentication > Settings > SMTP Settings'
      });
    } catch (err) {
      diagnostics.push({
        name: 'Email Service',
        status: 'fail',
        message: 'Unable to verify email configuration',
        solution: 'Configure SMTP settings in Supabase Dashboard'
      });
    }

    // Check 4: Google OAuth Provider
    diagnostics.push({
      name: 'Google OAuth Provider',
      status: 'warning',
      message: 'Provider configuration cannot be checked from client-side',
      solution: 'Check Supabase Dashboard > Authentication > Providers > Google'
    });

    setChecks(diagnostics);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Settings className="h-4 w-4 text-gray-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800 border-green-200';
      case 'fail': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* API Status Checker */}
      <ApiStatusChecker />

      <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Authentication Configuration Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">System Checks</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runDiagnostics}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Re-run Checks'}
            </Button>
          </div>

          {checks.map((check, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  <span className="font-medium">{check.name}</span>
                  <Badge className={`text-xs ${getStatusColor(check.status)}`}>
                    {check.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mt-2">{check.message}</p>
              
              {check.solution && (
                <Alert className="mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Solution:</strong> {check.solution}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>

        {/* Quick Fixes */}
        <div className="space-y-4">
          <h3 className="font-medium">Quick Fixes</h3>
          
          {/* Google OAuth Fix */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">Fix Google OAuth "refused to connect"</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Add this URL to your Google OAuth client configuration:
                </p>
                <div className="bg-white border border-blue-300 rounded p-2 mt-2 flex items-center justify-between">
                  <code className="text-sm">{window.location.origin}</code>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(window.location.origin)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Steps: Google Cloud Console → APIs & Services → Credentials → Your OAuth Client → Authorized redirect URIs
                </p>
              </div>
            </div>
          </Card>

          {/* Email Configuration Fix */}
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-purple-900">Fix Email Not Sending</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Configure SMTP settings in your Supabase project:
                </p>
                <div className="space-y-2 mt-2">
                  <div className="bg-white border border-purple-300 rounded p-2">
                    <p className="text-xs text-purple-600">
                      1. Go to Supabase Dashboard → Authentication → Settings
                    </p>
                  </div>
                  <div className="bg-white border border-purple-300 rounded p-2">
                    <p className="text-xs text-purple-600">
                      2. Enable "Enable email confirmations"
                    </p>
                  </div>
                  <div className="bg-white border border-purple-300 rounded p-2">
                    <p className="text-xs text-purple-600">
                      3. Configure SMTP Settings (use Gmail, SendGrid, or other provider)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Supabase Dashboard Link */}
          <div className="flex justify-center">
            <Button 
              variant="outline"
              onClick={() => window.open('https://app.supabase.com/project/vilhreflbavpivsahfgi/auth/users', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Supabase Dashboard
            </Button>
          </div>
        </div>

        {/* Alternative Solutions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-2">Alternative Solutions</h4>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• For development: Use email/password with a real email service</li>
            <li>• For testing: Check Supabase logs in the dashboard</li>
            <li>• For Google OAuth: Ensure your domain is added to authorized origins</li>
            <li>• For emails: Consider using Supabase's built-in email service or external SMTP</li>
          </ul>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};
