import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Wifi, 
  WifiOff, 
  Database, 
  Trash2, 
  RefreshCw,
  Download,
  HardDrive,
  Clock,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { offlineCache } from "@/services/offlineCache";
import { useToast } from "@/hooks/use-toast";

export const OfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheStats, setCacheStats] = useState(offlineCache.getCacheStats());
  const { toast } = useToast();

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      setCacheStats(offlineCache.getCacheStats());
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Update cache stats periodically
    const interval = setInterval(() => {
      setCacheStats(offlineCache.getCacheStats());
    }, 5000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const handleClearCache = () => {
    offlineCache.clearCache();
    setCacheStats(offlineCache.getCacheStats());
    toast({
      title: "Cache cleared",
      description: "All offline data has been removed.",
    });
  };

  const handleCleanupCache = () => {
    offlineCache.cleanupCache();
    setCacheStats(offlineCache.getCacheStats());
    toast({
      title: "Cache cleaned",
      description: "Expired cache entries have been removed.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="h-5 w-5 text-green-600" />
              <span>Online</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Connected
              </Badge>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 text-red-600" />
              <span>Offline</span>
              <Badge variant="outline" className="text-red-600 border-red-600">
                No Connection
              </Badge>
            </>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status Description */}
        <div className={`p-3 rounded-lg border ${isOnline ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-start gap-2">
            {isOnline ? (
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            )}
            <div className="text-sm">
              {isOnline ? (
                <p className="text-green-800">
                  You're online and can access real-time agricultural data. Your queries will be answered with the latest information.
                </p>
              ) : (
                <p className="text-yellow-800">
                  You're offline. Krishi Sakha will use cached data to answer your questions. Responses may not include the latest information.
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Cache Statistics */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Offline Cache
          </h4>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <HardDrive className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Cached Responses:</span>
              </div>
              <p className="font-medium">{cacheStats.totalResponses}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Cache Size:</span>
              </div>
              <p className="font-medium">{cacheStats.cacheSize}</p>
            </div>
            
            {cacheStats.newestResponse && (
              <div className="space-y-1 col-span-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Latest Cache:</span>
                </div>
                <p className="font-medium text-xs">
                  {cacheStats.newestResponse.toLocaleDateString()} at {cacheStats.newestResponse.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          {/* Cache Management Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanupCache}
              className="flex-1"
              disabled={cacheStats.totalResponses === 0}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Cleanup
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              className="flex-1 text-destructive hover:text-destructive"
              disabled={cacheStats.totalResponses === 0}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Offline Capabilities */}
        <Separator />
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Offline Features</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• View previously asked questions and answers</li>
            <li>• Access basic agricultural guidance</li>
            <li>• Browse cached weather and market data</li>
            <li>• Get general farming recommendations</li>
          </ul>
          
          {!isOnline && (
            <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200 mt-2">
              💡 For the most accurate and up-to-date advice, connect to the internet when possible.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
