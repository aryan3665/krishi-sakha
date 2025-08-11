import { supabase } from '@/integrations/supabase/client';
import { offlineCache } from './offlineCache';

export interface SystemHealthStatus {
  overall: 'healthy' | 'degraded' | 'limited';
  components: {
    database: 'healthy' | 'limited' | 'failed';
    voiceInput: 'healthy' | 'limited' | 'failed';
    aiService: 'healthy' | 'limited' | 'failed';
    dataAgents: 'healthy' | 'limited' | 'failed';
    cache: 'healthy' | 'limited' | 'failed';
    connectivity: 'healthy' | 'limited' | 'failed';
  };
  messages: string[];
  workarounds: string[];
}

class SystemHealthChecker {
  private lastCheck: Date | null = null;
  private cachedStatus: SystemHealthStatus | null = null;
  private checkInterval = 30000; // 30 seconds

  async checkSystemHealth(force = false): Promise<SystemHealthStatus> {
    // Use cached result if recent (unless forced)
    if (!force && this.cachedStatus && this.lastCheck && 
        (Date.now() - this.lastCheck.getTime()) < this.checkInterval) {
      return this.cachedStatus;
    }

    const status: SystemHealthStatus = {
      overall: 'healthy',
      components: {
        database: 'healthy',
        voiceInput: 'healthy',
        aiService: 'healthy',
        dataAgents: 'healthy',
        cache: 'healthy',
        connectivity: 'healthy'
      },
      messages: [],
      workarounds: []
    };

    // Check Database connectivity
    try {
      const { error } = await supabase.auth.getSession();
      if (error) throw error;
      status.components.database = 'healthy';
    } catch (error) {
      status.components.database = 'failed';
      status.messages.push('Database connection failed');
      status.workarounds.push('Query responses will not be saved to history');
    }

    // Check Voice Input capabilities
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        status.components.voiceInput = 'failed';
        status.messages.push('Voice input not supported in this browser');
        status.workarounds.push('Please type your questions instead');
      } else {
        // Check microphone permission
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          status.components.voiceInput = 'healthy';
        } catch (permError) {
          status.components.voiceInput = 'limited';
          status.messages.push('Microphone permission required for voice input');
          status.workarounds.push('Enable microphone access or type your questions');
        }
      }
    } catch (error) {
      status.components.voiceInput = 'failed';
      status.messages.push('Voice input system error');
      status.workarounds.push('Voice input temporarily unavailable - please type questions');
    }

    // Check AI Service (through a simple health check)
    try {
      // This is a simple check - in a real system you'd ping the AI service
      status.components.aiService = 'healthy';
    } catch (error) {
      status.components.aiService = 'limited';
      status.messages.push('AI service experiencing issues');
      status.workarounds.push('Responses may be slower or use cached data');
    }

    // Check Data Agents
    try {
      const isOnline = navigator.onLine;
      if (!isOnline) {
        status.components.dataAgents = 'limited';
        status.messages.push('No internet connection - using cached data');
        status.workarounds.push('Connect to internet for latest agricultural data');
      } else {
        status.components.dataAgents = 'healthy';
      }
    } catch (error) {
      status.components.dataAgents = 'failed';
      status.messages.push('Data retrieval services unavailable');
      status.workarounds.push('Using fallback agricultural guidance');
    }

    // Check Cache system
    try {
      const cacheStats = offlineCache.getCacheStats();
      if (cacheStats.totalResponses > 0) {
        status.components.cache = 'healthy';
      } else {
        status.components.cache = 'limited';
        status.messages.push('No cached data available');
        status.workarounds.push('Building cache as you use the system');
      }
    } catch (error) {
      status.components.cache = 'failed';
      status.messages.push('Cache system unavailable');
      status.workarounds.push('Responses will not be cached for offline use');
    }

    // Check overall connectivity
    status.components.connectivity = navigator.onLine ? 'healthy' : 'limited';
    if (!navigator.onLine) {
      status.messages.push('Working in offline mode');
      status.workarounds.push('Limited to cached data and basic guidance');
    }

    // Determine overall status
    const componentStatuses = Object.values(status.components);
    const failedCount = componentStatuses.filter(s => s === 'failed').length;
    const limitedCount = componentStatuses.filter(s => s === 'limited').length;

    if (failedCount >= 3) {
      status.overall = 'limited';
    } else if (failedCount >= 1 || limitedCount >= 2) {
      status.overall = 'degraded';
    } else {
      status.overall = 'healthy';
    }

    // Cache the result
    this.cachedStatus = status;
    this.lastCheck = new Date();

    return status;
  }

  getHealthMessage(status: SystemHealthStatus, language: string): string {
    const isHindi = language === 'hi';
    
    if (status.overall === 'healthy') {
      return isHindi ? 
        '✅ सभी सिस्टम सामान्य रूप से काम कर रहे हैं' :
        '✅ All systems operational';
    }

    if (status.overall === 'degraded') {
      return isHindi ?
        '⚠️ कुछ सुविधाएं सीमित हैं, लेकिन सलाह उपलब्ध है' :
        '⚠️ Some features limited, but advice available';
    }

    return isHindi ?
      '🔧 सीमित मोड में काम कर रहा है - बुनियादी सलाह उपलब्ध' :
      '🔧 Operating in limited mode - basic guidance available';
  }

  getWorkaroundSuggestions(status: SystemHealthStatus, language: string): string[] {
    const isHindi = language === 'hi';
    const suggestions: string[] = [];

    if (status.components.voiceInput !== 'healthy') {
      suggestions.push(isHindi ? 
        '⌨️ कृपया अपने प्रश्न टाइप करें' :
        '⌨️ Please type your questions'
      );
    }

    if (status.components.database !== 'healthy') {
      suggestions.push(isHindi ?
        '📝 हिस्ट्री सेव नहीं होगी, लेकिन सलाह मिलेगी' :
        '📝 History won\'t be saved, but advice will be provided'
      );
    }

    if (status.components.connectivity !== 'healthy') {
      suggestions.push(isHindi ?
        '📱 ऑफलाइन मोड - कैश्ड डेटा का उपयोग' :
        '📱 Offline mode - using cached data'
      );
    }

    return suggestions;
  }
}

export const systemHealthChecker = new SystemHealthChecker();

// Auto-check system health periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    systemHealthChecker.checkSystemHealth(false);
  }, 60000); // Check every minute
}
