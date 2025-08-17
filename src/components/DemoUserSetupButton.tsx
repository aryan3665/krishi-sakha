import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createDemoUserIfNotExists, DEMO_CREDENTIALS } from '@/utils/demoUserSetup';

export const DemoUserSetupButton = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [creationStatus, setCreationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleCreateDemoUser = async () => {
    setIsCreating(true);
    setCreationStatus('idle');

    try {
      toast({
        title: "🔄 Setting up demo user",
        description: "Creating demo user account...",
      });

      const result = await createDemoUserIfNotExists();

      if (result.success) {
        setCreationStatus('success');
        toast({
          title: "✅ Demo User Ready",
          description: "Demo user created successfully! You can now sign in with the demo credentials.",
        });
      } else {
        setCreationStatus('error');
        console.error('Demo user creation failed:', result.error);
        toast({
          title: "❌ Demo User Setup Failed",
          description: result.error?.message || "Could not create demo user. Please check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setCreationStatus('error');
      console.error('Demo user setup error:', error);
      toast({
        title: "❌ Setup Error",
        description: "An error occurred while setting up the demo user.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getButtonContent = () => {
    if (isCreating) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Creating Demo User...
        </>
      );
    }

    switch (creationStatus) {
      case 'success':
        return (
          <>
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Demo User Created
          </>
        );
      case 'error':
        return (
          <>
            <XCircle className="h-4 w-4 mr-2 text-red-600" />
            Retry Demo Setup
          </>
        );
      default:
        return (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Create Demo User
          </>
        );
    }
  };

  const getButtonVariant = () => {
    switch (creationStatus) {
      case 'success':
        return 'default' as const;
      case 'error':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleCreateDemoUser}
        disabled={isCreating || creationStatus === 'success'}
        variant={getButtonVariant()}
        className="w-full"
      >
        {getButtonContent()}
      </Button>
      
      {creationStatus === 'success' && (
        <div className="text-xs text-green-600 bg-green-50 dark:bg-green-950 p-2 rounded">
          ✅ You can now sign in with: <code>{DEMO_CREDENTIALS.email}</code>
        </div>
      )}
      
      {creationStatus === 'error' && (
        <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
          ❌ Demo user creation failed. Try using the "Test Demo User Access" button above to diagnose the issue.
        </div>
      )}
    </div>
  );
};
