import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { demoUserUtils } from '@/utils/demoUserSetup';
import { useToast } from '@/components/ui/use-toast';
import { TestTube, CheckCircle, XCircle, User, Database } from 'lucide-react';

export const DemoUserTest = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runDemoUserTest = async () => {
    setTesting(true);
    setResults(null);

    try {
      // Test 1: Verify if demo user can sign in
      toast({
        title: "🔄 Testing Demo User",
        description: "Checking if demo user can sign in...",
      });

      const verificationResult = await demoUserUtils.verifyDemoUserAccess();
      
      if (verificationResult.canSignIn) {
        setResults({
          canSignIn: true,
          message: "Demo user exists and can sign in successfully!",
          user: verificationResult.user
        });
        
        toast({
          title: "✅ Demo User Works!",
          description: "Demo credentials are working correctly.",
        });
      } else {
        // Try to create demo user
        toast({
          title: "🔄 Creating Demo User",
          description: "Demo user not found, attempting to create...",
        });

        const createResult = await demoUserUtils.createDemoUserIfNotExists();
        
        if (createResult.success) {
          // Test again after creation
          const secondVerification = await demoUserUtils.verifyDemoUserAccess();
          
          setResults({
            canSignIn: secondVerification.canSignIn,
            message: secondVerification.canSignIn 
              ? "Demo user created and verified successfully!"
              : "Demo user created but verification failed",
            created: true,
            user: secondVerification.user
          });

          toast({
            title: secondVerification.canSignIn ? "✅ Demo User Created!" : "⚠️ Partial Success",
            description: secondVerification.canSignIn 
              ? "Demo user created and working correctly."
              : "Demo user created but needs manual verification.",
          });
        } else {
          setResults({
            canSignIn: false,
            message: "Failed to create demo user",
            error: createResult.error
          });

          toast({
            title: "❌ Demo User Setup Failed",
            description: "Could not create or verify demo user. Check console for details.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Demo user test error:', error);
      setResults({
        canSignIn: false,
        message: "Test failed with error",
        error
      });

      toast({
        title: "❌ Test Failed",
        description: "Demo user test encountered an error.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <TestTube className="h-5 w-5" />
          Demo User Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p>Test demo credentials: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">demo@krishisakha.com</code></p>
          <p>Password: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">demo123456</code></p>
        </div>

        <Button 
          onClick={runDemoUserTest}
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <TestTube className="h-4 w-4 mr-2 animate-spin" />
              Testing Demo User...
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4 mr-2" />
              Test Demo User Access
            </>
          )}
        </Button>

        {results && (
          <div className="mt-4 p-4 rounded-lg border bg-white dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-2">
              {results.canSignIn ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                {results.canSignIn ? 'Success' : 'Failed'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {results.message}
            </p>

            {results.user && (
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>User ID: {results.user.id}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <span>Email: {results.user.email}</span>
                </div>
              </div>
            )}

            {results.created && (
              <Badge variant="secondary" className="mt-2">
                Newly Created
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
