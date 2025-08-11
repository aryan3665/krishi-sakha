import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Mic,
  Bot,
  HardDrive
} from 'lucide-react';
import { systemHealthChecker, SystemHealthStatus } from '@/services/systemHealth';

interface SystemStatusProps {
  language: string;
  compact?: boolean;
}

export const SystemStatus = ({ language, compact = false }: SystemStatusProps) => {
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async (force = false) => {
    setIsChecking(true);
    try {
      const status = await systemHealthChecker.checkSystemHealth(force);
      setHealthStatus(status);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => checkHealth(), 120000);
    return () => clearInterval(interval);
  }, []);

  if (!healthStatus) {
    return null;
  }

  const isHindi = language === 'hi';

  const getStatusIcon = (status: string, size = 'h-4 w-4') => {
    switch (status) {
      case 'healthy': return <CheckCircle className={`${size} text-green-600`} />;
      case 'limited': return <AlertTriangle className={`${size} text-yellow-600`} />;
      case 'failed': return <XCircle className={`${size} text-red-600`} />;
      default: return <AlertTriangle className={`${size} text-gray-600`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'limited': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'database': return <Database className="h-4 w-4" />;
      case 'voiceInput': return <Mic className="h-4 w-4" />;
      case 'aiService': return <Bot className="h-4 w-4" />;
      case 'dataAgents': return <Wifi className="h-4 w-4" />;
      case 'cache': return <HardDrive className="h-4 w-4" />;
      case 'connectivity': return healthStatus.components.connectivity === 'healthy' ? 
        <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const healthMessage = systemHealthChecker.getHealthMessage(healthStatus, language);
  const workarounds = systemHealthChecker.getWorkaroundSuggestions(healthStatus, language);

  // Compact view for header
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon(healthStatus.overall, 'h-3 w-3')}
        <Badge className={`text-xs ${getStatusColor(healthStatus.overall)}`}>
          {healthStatus.overall === 'healthy' ? 
            (isHindi ? 'सामान्य' : 'Online') :
            healthStatus.overall === 'degraded' ?
            (isHindi ? 'सीमित' : 'Limited') :
            (isHindi ? 'ऑफलाइन' : 'Offline')
          }
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Overall Status */}
      <Alert className={`border ${getStatusColor(healthStatus.overall).replace('bg-', 'border-').replace('text-', 'border-')}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(healthStatus.overall)}
            <span className="font-medium">{healthMessage}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => checkHealth(true)}
            disabled={isChecking}
          >
            <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Workarounds */}
        {workarounds.length > 0 && (
          <div className="mt-2 space-y-1">
            {workarounds.map((workaround, index) => (
              <AlertDescription key={index} className="text-xs">
                {workaround}
              </AlertDescription>
            ))}
          </div>
        )}
      </Alert>

      {/* Detailed Status (Expandable) */}
      {healthStatus.overall !== 'healthy' && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between text-xs">
              <span>{isHindi ? 'विस्तृत स्थिति देखें' : 'View System Details'}</span>
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {Object.entries(healthStatus.components).map(([component, status]) => (
              <div key={component} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  {getComponentIcon(component)}
                  <span className="text-sm capitalize">
                    {component === 'voiceInput' ? (isHindi ? 'आवाज़ इनपुट' : 'Voice Input') :
                     component === 'database' ? (isHindi ? 'डेटाबेस' : 'Database') :
                     component === 'aiService' ? (isHindi ? 'AI सेवा' : 'AI Service') :
                     component === 'dataAgents' ? (isHindi ? 'डेटा सेवा' : 'Data Service') :
                     component === 'cache' ? (isHindi ? 'कैश' : 'Cache') :
                     component === 'connectivity' ? (isHindi ? 'कनेक्टिविटी' : 'Connectivity') :
                     component}
                  </span>
                </div>
                {getStatusIcon(status, 'h-3 w-3')}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Messages */}
      {healthStatus.messages.length > 0 && (
        <div className="space-y-1">
          {healthStatus.messages.map((message, index) => (
            <AlertDescription key={index} className="text-xs text-muted-foreground">
              • {message}
            </AlertDescription>
          ))}
        </div>
      )}
    </div>
  );
};
