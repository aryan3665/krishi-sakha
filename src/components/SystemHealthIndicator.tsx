import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Wifi, 
  WifiOff, 
  Database, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  Activity
} from "lucide-react";
import { offlineCache } from "@/services/offlineCache";

export const SystemHealthIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [systemStatus, setSystemStatus] = useState({
    connectivity: 'good',
    dataServices: 'good',
    cache: 'good',
    overall: 'good'
  });

  useEffect(() => {
    const updateStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      // Check cache status
      const cacheStats = offlineCache.getCacheStats();
      const hasCache = cacheStats.totalResponses > 0;
      
      // Determine overall system status
      let connectivity = online ? 'good' : 'limited';
      let dataServices = online ? 'good' : 'limited';
      let cache = hasCache ? 'good' : 'warning';
      let overall = 'good';
      
      if (!online && !hasCache) {
        overall = 'limited';
      } else if (!online) {
        overall = 'warning';
      }
      
      setSystemStatus({
        connectivity,
        dataServices,
        cache,
        overall
      });
    };

    // Update on mount
    updateStatus();

    // Listen for connectivity changes
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Update periodically
    const interval = setInterval(updateStatus, 30000);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'limited': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-3 w-3" />;
      case 'warning': return <AlertCircle className="h-3 w-3" />;
      case 'limited': return <XCircle className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  if (systemStatus.overall === 'good') {
    // Only show minimal indicator when everything is working
    return (
      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Online
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Main Status */}
      <Badge className={`text-xs ${getStatusColor(systemStatus.overall)}`}>
        {getStatusIcon(systemStatus.overall)}
        <span className="ml-1">
          {systemStatus.overall === 'limited' ? 'Limited' : 
           systemStatus.overall === 'warning' ? 'Offline' : 'Online'}
        </span>
      </Badge>

      {/* Detailed Status */}
      {systemStatus.overall !== 'good' && (
        <>
          {/* Connectivity */}
          <Badge variant="outline" className={`text-xs ${getStatusColor(systemStatus.connectivity)}`}>
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          </Badge>

          {/* Cache */}
          <Badge variant="outline" className={`text-xs ${getStatusColor(systemStatus.cache)}`}>
            <Database className="h-3 w-3" />
          </Badge>
        </>
      )}
    </div>
  );
};
