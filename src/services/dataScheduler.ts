import { marketDataScraper } from './marketDataScraper';
import { weatherDataFetcher } from './weatherDataFetcher';
import { geminiSummarizer } from './geminiSummarizer';
import { supabase } from '@/integrations/supabase/client';

export interface SchedulerStatus {
  lastMarketUpdate: string | null;
  lastWeatherUpdate: string | null;
  lastSummaryUpdate: string | null;
  isRunning: boolean;
  nextScheduledRun: string | null;
  errors: string[];
}

export interface SchedulerConfig {
  marketDataInterval: number; // in minutes
  weatherDataInterval: number; // in minutes
  summaryInterval: number; // in minutes
  autoStart: boolean;
}

export class DataScheduler {
  private marketInterval: NodeJS.Timeout | null = null;
  private weatherInterval: NodeJS.Timeout | null = null;
  private summaryInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private status: SchedulerStatus = {
    lastMarketUpdate: null,
    lastWeatherUpdate: null,
    lastSummaryUpdate: null,
    isRunning: false,
    nextScheduledRun: null,
    errors: []
  };

  private config: SchedulerConfig = {
    marketDataInterval: 60, // 1 hour
    weatherDataInterval: 30, // 30 minutes
    summaryInterval: 120, // 2 hours
    autoStart: true
  };

  constructor(config?: Partial<SchedulerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    if (this.config.autoStart) {
      this.initialize();
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ Data scheduler already initialized');
      return;
    }

    console.log('🚀 Initializing Krishi Sakha data scheduler...');
    
    try {
      // Run initial data fetch
      await this.runInitialDataFetch();
      
      // Start scheduled intervals
      this.startScheduledTasks();
      
      this.isInitialized = true;
      this.status.isRunning = true;
      this.status.nextScheduledRun = this.getNextRunTime();
      
      console.log('✅ Data scheduler initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize data scheduler:', error);
      this.status.errors.push(`Initialization failed: ${error}`);
    }
  }

  private async runInitialDataFetch(): Promise<void> {
    console.log('🔄 Running initial data fetch...');
    
    try {
      // Fetch market data
      console.log('📈 Fetching initial market data...');
      await marketDataScraper.scrapeMarketData();
      this.status.lastMarketUpdate = new Date().toISOString();
      
      // Small delay between operations
      await this.delay(2000);
      
      // Fetch weather data
      console.log('🌤️ Fetching initial weather data...');
      await weatherDataFetcher.fetchWeatherData();
      this.status.lastWeatherUpdate = new Date().toISOString();
      
      // Small delay before summary
      await this.delay(2000);
      
      // Generate initial summary
      console.log('📄 Generating initial summary...');
      await geminiSummarizer.generateSummary({});
      this.status.lastSummaryUpdate = new Date().toISOString();
      
      console.log('✅ Initial data fetch completed');
    } catch (error) {
      console.error('❌ Initial data fetch failed:', error);
      this.status.errors.push(`Initial fetch failed: ${error}`);
    }
  }

  private startScheduledTasks(): void {
    console.log('⏰ Starting scheduled tasks...');
    
    // Schedule market data updates
    this.marketInterval = setInterval(async () => {
      await this.fetchMarketDataSafely();
    }, this.config.marketDataInterval * 60 * 1000);
    
    // Schedule weather data updates
    this.weatherInterval = setInterval(async () => {
      await this.fetchWeatherDataSafely();
    }, this.config.weatherDataInterval * 60 * 1000);
    
    // Schedule summary generation
    this.summaryInterval = setInterval(async () => {
      await this.generateSummarySafely();
    }, this.config.summaryInterval * 60 * 1000);
    
    console.log(`📅 Scheduled tasks started:
    - Market data: every ${this.config.marketDataInterval} minutes
    - Weather data: every ${this.config.weatherDataInterval} minutes  
    - Summary generation: every ${this.config.summaryInterval} minutes`);
  }

  private async fetchMarketDataSafely(): Promise<void> {
    try {
      console.log('🔄 Scheduled market data fetch starting...');
      const data = await marketDataScraper.scrapeMarketData();
      this.status.lastMarketUpdate = new Date().toISOString();
      console.log(`✅ Market data fetch completed - ${data.length} records`);
    } catch (error) {
      console.error('❌ Scheduled market data fetch failed:', error);
      this.status.errors.push(`Market fetch failed: ${error}`);
      this.limitErrorHistory();
    }
  }

  private async fetchWeatherDataSafely(): Promise<void> {
    try {
      console.log('🔄 Scheduled weather data fetch starting...');
      const data = await weatherDataFetcher.fetchWeatherData();
      this.status.lastWeatherUpdate = new Date().toISOString();
      console.log(`�� Weather data fetch completed - ${data.length} records`);
    } catch (error) {
      console.error('❌ Scheduled weather data fetch failed:', error);
      this.status.errors.push(`Weather fetch failed: ${error}`);
      this.limitErrorHistory();
    }
  }

  private async generateSummarySafely(): Promise<void> {
    try {
      console.log('🔄 Scheduled summary generation starting...');
      await geminiSummarizer.generateSummary({});
      this.status.lastSummaryUpdate = new Date().toISOString();
      console.log('✅ Summary generation completed');
    } catch (error) {
      console.error('❌ Scheduled summary generation failed:', error);
      this.status.errors.push(`Summary generation failed: ${error}`);
      this.limitErrorHistory();
    }
  }

  private limitErrorHistory(): void {
    // Keep only last 10 errors to prevent memory issues
    if (this.status.errors.length > 10) {
      this.status.errors = this.status.errors.slice(-10);
    }
  }

  private getNextRunTime(): string {
    const nextRun = new Date();
    nextRun.setMinutes(nextRun.getMinutes() + Math.min(
      this.config.marketDataInterval,
      this.config.weatherDataInterval,
      this.config.summaryInterval
    ));
    return nextRun.toISOString();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods
  
  async manualFetchAll(): Promise<{
    marketData: any[];
    weatherData: any[];
    summary: any;
  }> {
    console.log('🔄 Manual data fetch requested...');
    
    try {
      const [marketData, weatherData] = await Promise.all([
        marketDataScraper.scrapeMarketData(),
        weatherDataFetcher.fetchWeatherData()
      ]);
      
      // Generate summary after data is fetched
      await this.delay(1000);
      const summary = await geminiSummarizer.generateSummary({});
      
      // Update status
      const now = new Date().toISOString();
      this.status.lastMarketUpdate = now;
      this.status.lastWeatherUpdate = now;
      this.status.lastSummaryUpdate = now;
      
      console.log('✅ Manual data fetch completed');
      
      return { marketData, weatherData, summary };
    } catch (error) {
      console.error('❌ Manual data fetch failed:', error);
      this.status.errors.push(`Manual fetch failed: ${error}`);
      throw error;
    }
  }

  async manualFetchMarketData(): Promise<any[]> {
    console.log('🔄 Manual market data fetch requested...');
    try {
      const data = await marketDataScraper.scrapeMarketData();
      this.status.lastMarketUpdate = new Date().toISOString();
      return data;
    } catch (error) {
      this.status.errors.push(`Manual market fetch failed: ${error}`);
      throw error;
    }
  }

  async manualFetchWeatherData(): Promise<any[]> {
    console.log('🔄 Manual weather data fetch requested...');
    try {
      const data = await weatherDataFetcher.fetchWeatherData();
      this.status.lastWeatherUpdate = new Date().toISOString();
      return data;
    } catch (error) {
      this.status.errors.push(`Manual weather fetch failed: ${error}`);
      throw error;
    }
  }

  async generateSummary(location?: string, crop?: string): Promise<any> {
    console.log('🔄 Manual summary generation requested...');
    try {
      const summary = await geminiSummarizer.generateSummary({ location, crop });
      this.status.lastSummaryUpdate = new Date().toISOString();
      return summary;
    } catch (error) {
      this.status.errors.push(`Manual summary generation failed: ${error}`);
      throw error;
    }
  }

  getStatus(): SchedulerStatus {
    return {
      ...this.status,
      nextScheduledRun: this.getNextRunTime()
    };
  }

  updateConfig(newConfig: Partial<SchedulerConfig>): void {
    console.log('🔧 Updating scheduler configuration...');
    
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    // If intervals changed, restart scheduled tasks
    if (
      newConfig.marketDataInterval !== undefined ||
      newConfig.weatherDataInterval !== undefined ||
      newConfig.summaryInterval !== undefined
    ) {
      this.stopScheduledTasks();
      this.startScheduledTasks();
      console.log('✅ Scheduler configuration updated and tasks restarted');
    }
  }

  start(): void {
    if (!this.isInitialized) {
      this.initialize();
    } else if (!this.status.isRunning) {
      this.startScheduledTasks();
      this.status.isRunning = true;
      console.log('✅ Data scheduler started');
    }
  }

  stop(): void {
    this.stopScheduledTasks();
    this.status.isRunning = false;
    console.log('⏹️ Data scheduler stopped');
  }

  private stopScheduledTasks(): void {
    if (this.marketInterval) {
      clearInterval(this.marketInterval);
      this.marketInterval = null;
    }
    
    if (this.weatherInterval) {
      clearInterval(this.weatherInterval);
      this.weatherInterval = null;
    }
    
    if (this.summaryInterval) {
      clearInterval(this.summaryInterval);
      this.summaryInterval = null;
    }
  }

  destroy(): void {
    this.stopScheduledTasks();
    this.isInitialized = false;
    this.status.isRunning = false;
    console.log('🗑️ Data scheduler destroyed');
  }

  // Utility method to check data freshness
  async getDataFreshness(): Promise<{
    marketDataAge: number; // in minutes
    weatherDataAge: number; // in minutes
    summaryAge: number; // in minutes
  }> {
    const now = new Date();
    
    const marketAge = this.status.lastMarketUpdate 
      ? Math.floor((now.getTime() - new Date(this.status.lastMarketUpdate).getTime()) / (1000 * 60))
      : Infinity;
      
    const weatherAge = this.status.lastWeatherUpdate
      ? Math.floor((now.getTime() - new Date(this.status.lastWeatherUpdate).getTime()) / (1000 * 60))
      : Infinity;
      
    const summaryAge = this.status.lastSummaryUpdate
      ? Math.floor((now.getTime() - new Date(this.status.lastSummaryUpdate).getTime()) / (1000 * 60))
      : Infinity;

    return {
      marketDataAge: marketAge,
      weatherDataAge: weatherAge,
      summaryAge: summaryAge
    };
  }
}

// Create and export a singleton instance
export const dataScheduler = new DataScheduler({
  marketDataInterval: 60, // 1 hour for market data
  weatherDataInterval: 30, // 30 minutes for weather
  summaryInterval: 120, // 2 hours for summaries
  autoStart: true
});
