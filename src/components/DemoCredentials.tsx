import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle, User, Lock, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DemoCredentialsProps {
  onCredentialsFill: (email: string, password: string) => void;
}

export const DemoCredentials = ({ onCredentialsFill }: DemoCredentialsProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const demoCredentials = {
    email: 'demo@krishisakha.com',
    password: 'demo123456'
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const handleUseDemoCredentials = () => {
    onCredentialsFill(demoCredentials.email, demoCredentials.password);
    toast({
      title: "Demo credentials filled",
      description: "You can now click 'Sign In' to access the demo",
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <CardTitle className="text-lg text-blue-800 dark:text-blue-200">Demo Account</CardTitle>
        </div>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          Use these credentials to explore Krishi Sakha without creating an account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Email */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{demoCredentials.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(demoCredentials.email, 'Email')}
            className="flex items-center gap-1"
          >
            {copiedField === 'Email' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Password */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{demoCredentials.password}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(demoCredentials.password, 'Password')}
            className="flex items-center gap-1"
          >
            {copiedField === 'Password' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Auto-fill Button */}
        <Button 
          onClick={handleUseDemoCredentials}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Use Demo Credentials
        </Button>

        {/* Features Available */}
        <div className="mt-4">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">Available in demo:</p>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">Market Data</Badge>
            <Badge variant="secondary" className="text-xs">Weather Info</Badge>
            <Badge variant="secondary" className="text-xs">AI Advice</Badge>
            <Badge variant="secondary" className="text-xs">Voice Input</Badge>
          </div>
        </div>
        
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
          💡 This is a demo account with limited functionality. Create your own account for full access.
        </div>
      </CardContent>
    </Card>
  );
};
