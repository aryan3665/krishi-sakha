import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sprout, AlertCircle, CheckCircle, Settings, ArrowLeft, Sun, Leaf, BarChart3, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuthDebugger } from './AuthDebugger';
import { DemoCredentials } from './DemoCredentials';

interface AuthFormProps {
  onBackToLanding: () => void;
}

export const AuthForm = ({ onBackToLanding }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [showDebugger, setShowDebugger] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus('error');
        } else {
          console.log('Supabase connected successfully');
          setConnectionStatus('connected');
        }
      } catch (err) {
        console.error('Supabase connection test failed:', err);
        setConnectionStatus('error');
      }
    };

    testConnection();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Sign in failed",
          description: error.message || "Failed to sign in. Please check your credentials.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Signed in successfully!",
        });
      }
    } catch (err) {
      console.error('Unexpected sign in error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !fullName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, fullName);

      if (error) {
        console.error('Sign up error:', error);
        let errorMessage = error.message || "Failed to create account.";

        // Provide specific guidance for common email issues
        if (error.message?.includes('email')) {
          errorMessage = "Email service not configured. Click 'Debug' below for SMTP setup instructions.";
        } else if (error.message?.includes('User already registered')) {
          errorMessage = "This email is already registered. Try signing in instead.";
        }

        toast({
          title: "Sign up failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created successfully!",
          description: "Check your email for a confirmation link. If no email arrives, check the Debug section below.",
        });
        // Clear form on success
        setEmail('');
        setPassword('');
        setFullName('');
      }
    } catch (err) {
      console.error('Unexpected sign up error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        console.error('Google sign in error:', error);
        let errorMessage = error.message;
        let title = "Google sign in failed";

        // Provide more specific error messages
        if (error.message?.includes('popup')) {
          errorMessage = "Popup was blocked. Please allow popups and try again.";
        } else if (error.message?.includes('OAuth')) {
          errorMessage = "Google OAuth is not configured. Click 'Debug' below for setup instructions.";
        } else if (error.message?.includes('refused to connect')) {
          title = "Google OAuth Configuration Error";
          errorMessage = "The redirect URL is not authorized. Click 'Debug' below to fix this.";
        } else if (error.message?.includes('access_denied')) {
          errorMessage = "Access denied. Please try again or use email/password.";
        } else {
          errorMessage = `${error.message}. Click 'Debug' for configuration help.`;
        }

        toast({
          title,
          description: errorMessage,
          variant: "destructive",
        });
      }
      // Note: Success handling is automatic via auth state change
    } catch (err) {
      console.error('Unexpected Google sign in error:', err);
      toast({
        title: "Error",
        description: "Failed to initiate Google sign-in. Please try again or use email/password.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  // Show debugger if requested
  if (showDebugger) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-4">
        <div className="w-full max-w-4xl mx-auto space-y-4">
          <Button
            variant="outline"
            onClick={() => setShowDebugger(false)}
            className="mb-4"
          >
            ← Back to Login
          </Button>
          <AuthDebugger />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Auth Forms */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6">
            {/* Back to Landing Button */}
            <Button
              variant="ghost"
              onClick={onBackToLanding}
              className="mb-4 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>

            <Card className="border-0 shadow-2xl">
              <CardHeader className="space-y-1 text-center pb-8">
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <div className="relative">
                    <Sprout className="h-10 w-10 text-green-600" />
                    <Sun className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-pulse" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-green-800">
                    Krishi Sakha
                  </CardTitle>
                </div>
                <CardDescription className="text-green-600 text-lg">
                  Join thousands of farmers making smarter decisions
                </CardDescription>

                {/* Connection Status */}
                <div className="flex items-center justify-center space-x-2 mt-4">
                  {connectionStatus === 'checking' && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      <span className="text-xs text-gray-500">Connecting...</span>
                    </>
                  )}
                  {connectionStatus === 'connected' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600">Connected</span>
                    </>
                  )}
                  {connectionStatus === 'error' && (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-red-600">Connection Error</span>
                    </>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="space-y-4">
                    {/* Demo Credentials */}
                    <DemoCredentials
                      onCredentialsFill={(demoEmail, demoPassword) => {
                        setEmail(demoEmail);
                        setPassword(demoPassword);
                      }}
                    />

                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-12"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg font-semibold"
                        disabled={isLoading || connectionStatus !== 'connected'}
                      >
                        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Sign In
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-12"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg font-semibold"
                        disabled={isLoading || connectionStatus !== 'connected'}
                      >
                        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Create Account
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full mt-4 h-12"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || connectionStatus !== 'connected'}
                  >
                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </Button>
                </div>

                {/* Debug and Help Options */}
                <div className="mt-6 space-y-3">
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDebugger(true)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Debug Authentication Issues
                    </Button>
                  </div>

                  {connectionStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800 text-center">
                        ⚠️ Authentication service unavailable. Please check configuration.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side - Branding & Features */}
        <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-green-600 to-emerald-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20">
              <Leaf className="h-32 w-32 text-white transform rotate-12" />
            </div>
            <div className="absolute bottom-32 right-16">
              <Sun className="h-24 w-24 text-yellow-300 animate-pulse" />
            </div>
            <div className="absolute top-1/2 left-1/4">
              <Sprout className="h-20 w-20 text-white transform -rotate-12" />
            </div>
          </div>

          <div className="relative z-10 max-w-lg mx-auto text-center p-8">
            <div className="space-y-8">
              {/* Main Brand Message */}
              <div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Welcome to the Future of Farming
                </h2>
                <p className="text-xl text-green-100">
                  Join the agricultural revolution with AI-powered insights, real-time data, and expert guidance.
                </p>
              </div>

              {/* Key Features */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-white">
                  <div className="bg-white/20 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Real-time Market Data</h3>
                    <p className="text-green-100 text-sm">Live prices from AGMARKNET & eNAM</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-white">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Expert Pest Control</h3>
                    <p className="text-green-100 text-sm">Government-backed solutions</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-white">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Sun className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Weather Insights</h3>
                    <p className="text-green-100 text-sm">IMD forecasts & alerts</p>
                  </div>
                </div>
              </div>

              {/* Sample Dashboard Preview */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-4 text-center">What you'll get:</h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <p className="text-white">🌾 "Wheat prices in Punjab today?"</p>
                    <p className="text-green-200 text-xs mt-1">→ Real-time mandi rates with confidence score</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg">
                    <p className="text-white">🌧️ "Weather forecast for my crops?"</p>
                    <p className="text-green-200 text-xs mt-1">→ 7-day forecast with farming recommendations</p>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex justify-center gap-8 text-green-100 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">12+</div>
                  <div>Languages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div>Free</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div>Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
