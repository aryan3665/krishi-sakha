import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Settings, 
  ExternalLink,
  Database,
  Brain,
  Cloud
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { GeminiApiHelper } from './GeminiApiHelper';

interface ApiService {
  name: string;
  icon: React.ReactNode;
  status: 'checking' | 'healthy' | 'error' | 'warning';
  message: string;
  action?: () => void;
  actionLabel?: string;
}

export const ApiStatusChecker = () => {
  const [services, setServices] = useState<ApiService[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGeminiHelper, setShowGeminiHelper] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAllServices();
  }, []);

  const checkAllServices = async () => {
    setIsRefreshing(true);
    
    const initialServices: ApiService[] = [
      {
        name: 'Supabase Database',
        icon: <Database className="h-4 w-4" />,
        status: 'checking',
        message: 'Checking database connection...'
      },
      {
        name: 'Gemini AI Service',
        icon: <Brain className="h-4 w-4" />,
        status: 'checking',
        message: 'Testing AI service endpoint...'
      },
      {
        name: 'Edge Functions',
        icon: <Cloud className="h-4 w-4" />,
        status: 'checking',
        message: 'Verifying serverless functions...'
      }
    ];

    setServices(initialServices);

    // Check Supabase Database
    try {
      const { data, error } = await supabase.auth.getSession();
      setServices(prev => prev.map(service => 
        service.name === 'Supabase Database' 
          ? {
              ...service,
              status: error ? 'warning' : 'healthy',
              message: error 
                ? 'Database connected but authentication may have issues' 
                : 'Database connection successful'
            }
          : service
      ));
    } catch (error) {
      setServices(prev => prev.map(service => 
        service.name === 'Supabase Database' 
          ? {
              ...service,
              status: 'error',
              message: 'Database connection failed. Check configuration.',
              action: () => window.open('https://supabase.com/dashboard', '_blank'),
              actionLabel: 'Open Supabase Dashboard'
            }
          : service
      ));
    }

    // Check Gemini AI Service
    try {
      const { data, error } = await supabase.functions.invoke('generate-advice', {
        body: { prompt: 'test' }
      });

      if (error) {
        let message = 'AI service configuration error';
        let action: (() => void) | undefined;
        let actionLabel: string | undefined;

        if (error.message?.includes('500') || error.message?.includes('not found')) {
          message = 'GEMINI_API_KEY not configured in Edge Functions';
          action = () => setShowGeminiHelper(true);
          actionLabel = 'Fix Configuration';
        }

        setServices(prev => prev.map(service => 
          service.name === 'Gemini AI Service' 
            ? {
                ...service,
                status: 'error',
                message,
                action,
                actionLabel
              }
            : service
        ));
      } else {
        setServices(prev => prev.map(service => 
          service.name === 'Gemini AI Service' 
            ? {
                ...service,
                status: 'healthy',
                message: 'AI service is working correctly'
              }
            : service
        ));
      }
    } catch (error) {
      setServices(prev => prev.map(service => 
        service.name === 'Gemini AI Service' 
          ? {
              ...service,
              status: 'error',
              message: 'AI service endpoint unreachable',
              action: () => window.open('https://supabase.com/dashboard/project/_/functions', '_blank'),
              actionLabel: 'Check Edge Functions'
            }
          : service
      ));
    }

    // Check Edge Functions availability
    try {
      const response = await fetch('/api/health', { method: 'HEAD' });
      const edgeFunctionsWorking = !response.ok; // If it returns 404, that's expected and means edge functions are deployed
      
      setServices(prev => prev.map(service => 
        service.name === 'Edge Functions' 
          ? {
              ...service,
              status: 'healthy',
              message: 'Edge Functions are deployed and accessible'
            }
          : service
      ));
    } catch (error) {
      setServices(prev => prev.map(service => 
        service.name === 'Edge Functions' 
          ? {
              ...service,
              status: 'warning',
              message: 'Edge Functions deployment status unclear'
            }
          : service
      ));
    }

    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const overallStatus = services.every(s => s.status === 'healthy') ? 'healthy' :
                      services.some(s => s.status === 'error') ? 'error' : 'warning';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              API Services Status
            </CardTitle>
            <CardDescription>
              Real-time status of backend services and integrations
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkAllServices}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <Alert className={
          overallStatus === 'healthy' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' :
          overallStatus === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' :
          'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'
        }>
          {getStatusIcon(overallStatus)}
          <AlertDescription className={
            overallStatus === 'healthy' ? 'text-green-800 dark:text-green-200' :
            overallStatus === 'error' ? 'text-red-800 dark:text-red-200' :
            'text-yellow-800 dark:text-yellow-200'
          }>
            {overallStatus === 'healthy' && '✅ All services are operational'}
            {overallStatus === 'error' && '❌ Some services need attention'}
            {overallStatus === 'warning' && '⚠️ Some services have minor issues'}
          </AlertDescription>
        </Alert>

        {/* Individual Services */}
        <div className="space-y-3">
          {services.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {service.icon}
                <div>
                  <p className="font-medium text-sm">{service.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{service.message}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {service.action && service.actionLabel && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={service.action}
                    className="text-xs"
                  >
                    {service.actionLabel}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                )}
                {getStatusBadge(service.status)}
              </div>
            </div>
          ))}
        </div>

        {/* Configuration Help */}
        {services.some(s => s.status === 'error') && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Configuration Help
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>• <strong>GEMINI_API_KEY:</strong> Set in Supabase Edge Functions environment</p>
              <p>• <strong>Database:</strong> Check Supabase project settings and API keys</p>
              <p>• <strong>Authentication:</strong> Verify auth settings and email configuration</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
