import { dataScheduler } from './dataScheduler';
import { realTimeDataIntegration } from './realTimeDataIntegration';
import { marketDataScraper } from './marketDataScraper';
import { weatherDataFetcher } from './weatherDataFetcher';
import { geminiSummarizer } from './geminiSummarizer';

export class SystemInitializer {
  
  async initializeAndDemo(): Promise<void> {
    console.log('🚀 Initializing Krishi Sakha Real-Time System...');
    
    try {
      // Step 1: Initialize the data scheduler
      console.log('⏰ Starting data scheduler...');
      await dataScheduler.initialize();
      
      // Step 2: Run initial data fetch to populate database
      console.log('📡 Fetching initial data...');
      await this.performInitialDataFetch();
      
      // Step 3: Generate first summary
      console.log('🤖 Generating initial AI summary...');
      await this.generateInitialSummary();
      
      // Step 4: Test enhanced query
      console.log('🧪 Testing enhanced query system...');
      await this.testEnhancedQuery();
      
      console.log('✅ Real-time system initialization completed successfully!');
      
      // Display system status
      await this.displaySystemStatus();
      
    } catch (error) {
      console.error('❌ System initialization failed:', error);
      throw error;
    }
  }

  private async performInitialDataFetch(): Promise<void> {
    try {
      // Fetch market data
      console.log('📈 Scraping market data...');
      const marketData = await marketDataScraper.scrapeMarketData();
      console.log(`✅ Fetched ${marketData.length} market data points`);
      
      // Fetch weather data
      console.log('🌤️ Fetching weather data...');
      const weatherData = await weatherDataFetcher.fetchWeatherData();
      console.log(`✅ Fetched ${weatherData.length} weather data points`);
      
      // Small delay between operations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      throw error;
    }
  }

  private async generateInitialSummary(): Promise<void> {
    try {
      const summary = await geminiSummarizer.generateSummary({
        location: 'Delhi',
        language: 'en'
      });
      
      console.log('📄 Generated Summary:');
      console.log('Headline:', summary.headline);
      console.log('Weather Impact:', summary.weatherImpact);
      console.log('Confidence:', Math.round(summary.confidence * 100) + '%');
      console.log('Data Points:', summary.dataPoints);
      
    } catch (error) {
      console.error('Failed to generate initial summary:', error);
      throw error;
    }
  }

  private async testEnhancedQuery(): Promise<void> {
    try {
      const testQueries = [
        {
          query: 'What are onion prices in Delhi today?',
          location: 'Delhi',
          crop: 'Onion'
        },
        {
          query: 'How is the weather affecting potato prices?',
          crop: 'Potato'
        },
        {
          query: 'Show me current market trends for vegetables',
        }
      ];

      for (const testQuery of testQueries) {
        console.log(`\n🧪 Testing query: "${testQuery.query}"`);
        
        const response = await realTimeDataIntegration.enhanceQueryWithRealTimeData({
          ...testQuery,
          language: 'en'
        });
        
        console.log('Response confidence:', Math.round(response.confidence * 100) + '%');
        console.log('Factual basis:', response.factualBasis);
        console.log('Real-time data points:', response.realTimeData ? 
          (response.realTimeData.marketData?.length || 0) + (response.realTimeData.weatherData?.length || 0) : 0);
        console.log('Answer preview:', response.answer.substring(0, 150) + '...');
      }
      
    } catch (error) {
      console.error('Failed to test enhanced queries:', error);
      throw error;
    }
  }

  private async displaySystemStatus(): Promise<void> {
    try {
      const status = await realTimeDataIntegration.getSystemStatus();
      
      console.log('\n📊 SYSTEM STATUS REPORT:');
      console.log('========================');
      console.log('Scheduler Running:', status.scheduler.isRunning ? '✅' : '❌');
      console.log('Last Market Update:', status.scheduler.lastMarketUpdate ? 
        new Date(status.scheduler.lastMarketUpdate).toLocaleString() : 'Never');
      console.log('Last Weather Update:', status.scheduler.lastWeatherUpdate ? 
        new Date(status.scheduler.lastWeatherUpdate).toLocaleString() : 'Never');
      console.log('Market Data Age:', status.dataFreshness.marketDataAge, 'minutes');
      console.log('Weather Data Age:', status.dataFreshness.weatherDataAge, 'minutes');
      console.log('System Errors:', status.scheduler.errors.length);
      
      if (status.scheduler.errors.length > 0) {
        console.log('\nRecent Errors:');
        status.scheduler.errors.slice(-3).forEach((error: string, index: number) => {
          console.log(`${index + 1}. ${error}`);
        });
      }
      
      console.log('\n🎯 NEXT STEPS:');
      console.log('1. Visit the Real-Time Data Dashboard in the app');
      console.log('2. Test queries with location and crop filters');
      console.log('3. Monitor data freshness and system performance');
      console.log('4. Configure API keys for production data sources');
      
    } catch (error) {
      console.error('Failed to display system status:', error);
    }
  }

  // Utility methods for testing

  async quickDataFetch(): Promise<{
    marketCount: number;
    weatherCount: number;
    summaryGenerated: boolean;
  }> {
    try {
      const result = await dataScheduler.manualFetchAll();
      return {
        marketCount: result.marketData?.length || 0,
        weatherCount: result.weatherData?.length || 0,
        summaryGenerated: !!result.summary
      };
    } catch (error) {
      console.error('Quick data fetch failed:', error);
      return { marketCount: 0, weatherCount: 0, summaryGenerated: false };
    }
  }

  async getQuickStatus(): Promise<string> {
    try {
      const status = await realTimeDataIntegration.getSystemStatus();
      return `System ${status.scheduler.isRunning ? 'Running' : 'Stopped'} | ` +
             `Market: ${status.dataFreshness.marketDataAge}m old | ` +
             `Weather: ${status.dataFreshness.weatherDataAge}m old`;
    } catch (error) {
      return 'Status unavailable';
    }
  }

  async testSpecificQuery(query: string, location?: string, crop?: string): Promise<string> {
    try {
      const response = await realTimeDataIntegration.enhanceQueryWithRealTimeData({
        query,
        location,
        crop,
        language: 'en'
      });
      
      return `Query processed successfully!\nConfidence: ${Math.round(response.confidence * 100)}%\nFactual Basis: ${response.factualBasis}\nReal-time Sources: ${response.sources.length}`;
    } catch (error) {
      return `Query failed: ${error}`;
    }
  }
}

// Export singleton instance
export const systemInitializer = new SystemInitializer();

// Auto-initialize when imported (with delay to avoid blocking)
// Only run in browser environment and if not disabled
if (typeof window !== 'undefined' && !import.meta.env.VITE_DISABLE_AUTO_INIT) {
  setTimeout(() => {
    systemInitializer.initializeAndDemo().catch(error => {
      console.error('Auto-initialization failed:', error);
    });
  }, 3000);
}
