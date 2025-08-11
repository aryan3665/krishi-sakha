import { RetrievedData } from './dataRetrieval';
import { RAGResponse } from './ragSystem';

export interface CachedResponse {
  id: string;
  query: string;
  language: string;
  response: RAGResponse;
  timestamp: Date;
  location?: {
    state: string;
    district: string;
  };
  expiryDate: Date;
}

export interface OfflineDataset {
  type: 'weather' | 'market' | 'advisory' | 'soil' | 'scheme';
  data: any;
  lastUpdated: Date;
  location?: string;
  expiryDate: Date;
}

class OfflineCacheService {
  private storageKey = 'krishi_sakha_cache';
  private datasetKey = 'krishi_sakha_datasets';
  private maxCacheSize = 100; // Maximum number of cached responses
  private maxDatasetAge = 24 * 60 * 60 * 1000; // 24 hours for datasets

  // Check if browser supports IndexedDB for large offline storage
  private supportsIndexedDB(): boolean {
    return 'indexedDB' in window;
  }

  // Get connection status
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Cache a query response
  cacheResponse(query: string, language: string, response: RAGResponse, location?: { state: string; district: string }): void {
    try {
      const cached: CachedResponse = {
        id: this.generateId(query, language),
        query: query.toLowerCase().trim(),
        language,
        response,
        timestamp: new Date(),
        location,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };

      const existingCache = this.getCachedResponses();
      
      // Remove existing entry if it exists
      const filteredCache = existingCache.filter(item => item.id !== cached.id);
      
      // Add new entry at the beginning
      filteredCache.unshift(cached);
      
      // Limit cache size
      if (filteredCache.length > this.maxCacheSize) {
        filteredCache.splice(this.maxCacheSize);
      }

      this.saveCachedResponses(filteredCache);
    } catch (error) {
      console.warn('Failed to cache response:', error);
    }
  }

  // Retrieve cached response
  getCachedResponse(query: string, language: string): CachedResponse | null {
    try {
      const id = this.generateId(query, language);
      const cache = this.getCachedResponses();
      
      const found = cache.find(item => item.id === id);
      
      if (found && new Date(found.expiryDate) > new Date()) {
        return found;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to retrieve cached response:', error);
      return null;
    }
  }

  // Cache dataset for offline use
  cacheDataset(type: string, data: any, location?: string): void {
    try {
      const dataset: OfflineDataset = {
        type: type as any,
        data,
        lastUpdated: new Date(),
        location,
        expiryDate: new Date(Date.now() + this.maxDatasetAge)
      };

      const datasets = this.getCachedDatasets();
      const key = `${type}_${location || 'general'}`;
      datasets[key] = dataset;

      this.saveCachedDatasets(datasets);
    } catch (error) {
      console.warn('Failed to cache dataset:', error);
    }
  }

  // Retrieve cached dataset
  getCachedDataset(type: string, location?: string): OfflineDataset | null {
    try {
      const datasets = this.getCachedDatasets();
      const key = `${type}_${location || 'general'}`;
      const dataset = datasets[key];

      if (dataset && new Date(dataset.expiryDate) > new Date()) {
        return dataset;
      }

      return null;
    } catch (error) {
      console.warn('Failed to retrieve cached dataset:', error);
      return null;
    }
  }

  // Get offline fallback response
  getOfflineFallback(query: string, language: string): RAGResponse | null {
    const cached = this.getCachedResponse(query, language);
    if (cached) {
      return {
        ...cached.response,
        disclaimer: `Offline response from ${cached.timestamp.toLocaleDateString()}. Connect to internet for latest information.`
      };
    }

    // Try to find similar cached responses
    const cache = this.getCachedResponses();
    const queryWords = query.toLowerCase().split(' ');
    
    for (const item of cache) {
      const itemWords = item.query.split(' ');
      const commonWords = queryWords.filter(word => itemWords.includes(word));
      
      if (commonWords.length >= Math.min(3, queryWords.length * 0.6)) {
        return {
          ...item.response,
          answer: `Based on similar offline query: ${item.response.answer}`,
          disclaimer: `Offline response based on similar query from ${item.timestamp.toLocaleDateString()}. May not be exact match.`
        };
      }
    }

    return null;
  }

  // Get cache statistics
  getCacheStats(): {
    totalResponses: number;
    totalDatasets: number;
    oldestResponse: Date | null;
    newestResponse: Date | null;
    cacheSize: string;
    isOnline: boolean;
  } {
    const responses = this.getCachedResponses();
    const datasets = Object.keys(this.getCachedDatasets()).length;
    
    const timestamps = responses.map(r => new Date(r.timestamp));
    const oldest = timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : null;
    const newest = timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : null;
    
    // Estimate cache size
    const cacheData = localStorage.getItem(this.storageKey) || '';
    const datasetData = localStorage.getItem(this.datasetKey) || '';
    const totalSize = cacheData.length + datasetData.length;
    const sizeKB = (totalSize / 1024).toFixed(2);

    return {
      totalResponses: responses.length,
      totalDatasets: datasets,
      oldestResponse: oldest,
      newestResponse: newest,
      cacheSize: `${sizeKB} KB`,
      isOnline: this.isOnline()
    };
  }

  // Clear expired cache entries
  cleanupCache(): void {
    try {
      const now = new Date();
      
      // Clean responses
      const responses = this.getCachedResponses();
      const validResponses = responses.filter(item => new Date(item.expiryDate) > now);
      this.saveCachedResponses(validResponses);
      
      // Clean datasets
      const datasets = this.getCachedDatasets();
      const validDatasets: { [key: string]: OfflineDataset } = {};
      
      Object.entries(datasets).forEach(([key, dataset]) => {
        if (new Date(dataset.expiryDate) > now) {
          validDatasets[key] = dataset;
        }
      });
      
      this.saveCachedDatasets(validDatasets);
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }

  // Clear all cache
  clearCache(): void {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.datasetKey);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  // Generate unique ID for cache entries
  private generateId(query: string, language: string): string {
    const text = `${query.toLowerCase().trim()}_${language}`;
    return btoa(text).replace(/[^a-zA-Z0-9]/g, '');
  }

  // Load cached responses from storage
  private getCachedResponses(): CachedResponse[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Failed to load cached responses:', error);
      return [];
    }
  }

  // Save cached responses to storage
  private saveCachedResponses(responses: CachedResponse[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(responses));
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        // Storage quota exceeded, remove oldest entries
        const reduced = responses.slice(0, Math.floor(responses.length * 0.8));
        this.saveCachedResponses(reduced);
      } else {
        console.warn('Failed to save cached responses:', error);
      }
    }
  }

  // Load cached datasets from storage
  private getCachedDatasets(): { [key: string]: OfflineDataset } {
    try {
      const data = localStorage.getItem(this.datasetKey);
      if (!data) return {};
      
      return JSON.parse(data) || {};
    } catch (error) {
      console.warn('Failed to load cached datasets:', error);
      return {};
    }
  }

  // Save cached datasets to storage
  private saveCachedDatasets(datasets: { [key: string]: OfflineDataset }): void {
    try {
      localStorage.setItem(this.datasetKey, JSON.stringify(datasets));
    } catch (error) {
      console.warn('Failed to save cached datasets:', error);
    }
  }
}

export const offlineCache = new OfflineCacheService();

// Set up automatic cache cleanup on app load
if (typeof window !== 'undefined') {
  // Clean cache on startup
  setTimeout(() => {
    offlineCache.cleanupCache();
  }, 1000);

  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('Back online - cache will be updated with fresh data');
  });

  window.addEventListener('offline', () => {
    console.log('Offline mode - using cached data');
  });
}
