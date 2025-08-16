import { marketDataScraper } from './marketDataScraper';
import { weatherDataFetcher } from './weatherDataFetcher';
import { geminiSummarizer } from './geminiSummarizer';
import { dataScheduler } from './dataScheduler';
import { ragSystem } from './ragSystem';
import { supabase } from '@/integrations/supabase/client';
import { offlineAIService } from './offlineAIService';

export interface RealTimeQuery {
  query: string;
  location?: string;
  crop?: string;
  language?: string;
}

export interface EnhancedRAGResponse {
  answer: string;
  sources: any[];
  confidence: number;
  factualBasis: 'high' | 'medium' | 'low';
  generatedContent: string[];
  disclaimer?: string;
  realTimeData?: {
    marketData: any[];
    weatherData: any[];
    summary: any;
    dataFreshness: any;
  };
}

export class RealTimeDataIntegration {
  
  async enhanceQueryWithRealTimeData(query: RealTimeQuery): Promise<EnhancedRAGResponse> {
    console.log('🔄 Enhancing query with real-time data:', query);
    
    try {
      // Step 1: Get the base RAG response
      const baseResponse = await ragSystem.generateAdvice(query.query, query.language || 'en');

      // Step 2: Check if query needs real-time data enhancement
      const needsRealTimeData = this.shouldEnhanceWithRealTimeData(query.query, query);

      if (!needsRealTimeData) {
        console.log('📝 Query does not need real-time data enhancement');
        return baseResponse as EnhancedRAGResponse;
      }

      // Step 3: Try to fetch relevant real-time data (with fallback)
      let realTimeData;
      try {
        realTimeData = await this.fetchRelevantRealTimeData(query);
      } catch (dataError) {
        console.warn('⚠️ Real-time data fetch failed, using base response:', dataError);
        return {
          ...baseResponse,
          disclaimer: `${baseResponse.disclaimer || ''} Real-time data temporarily unavailable.`
        } as EnhancedRAGResponse;
      }

      // Step 4: Try to generate enhanced response (with fallback)
      try {
        const enhancedResponse = await this.generateEnhancedResponse(
          query,
          baseResponse,
          realTimeData
        );
        return enhancedResponse;
      } catch (enhanceError) {
        console.warn('⚠️ Response enhancement failed, returning base response with data:', enhanceError);
        return {
          ...baseResponse,
          realTimeData,
          disclaimer: `${baseResponse.disclaimer || ''} Real-time data available but enhancement temporarily unavailable.`
        } as EnhancedRAGResponse;
      }

    } catch (error) {
      console.error('❌ Failed to enhance query with real-time data:', error);

      // Ultimate fallback: try to get base RAG response
      try {
        const fallbackResponse = await ragSystem.generateAdvice(query.query, query.language || 'en');
        return {
          ...fallbackResponse,
          disclaimer: `${fallbackResponse.disclaimer || ''} Real-time data temporarily unavailable.`
        } as EnhancedRAGResponse;
      } catch (ragError) {
        console.error('❌ Even base RAG response failed:', ragError);

        // Final fallback: return manual response
        return {
          answer: `**🔍 Query:** ${query.query}\n\n❌ **Service Temporarily Unavailable**\n\nOur AI advisory service is currently experiencing technical difficulties. Please try again in a few minutes.\n\nFor immediate assistance:\n• Contact your local agricultural extension office\n• Call Kisan Call Center: 1800-180-1551\n• Visit nearest Krishi Vigyan Kendra`,
          sources: [],
          confidence: 0.1,
          factualBasis: 'low' as const,
          generatedContent: ['Manual fallback response'],
          disclaimer: 'Service temporarily unavailable. This is a fallback response.'
        };
      }
    }
  }

  private shouldEnhanceWithRealTimeData(query: string, context: RealTimeQuery): boolean {
    const queryLower = query.toLowerCase();
    
    // Keywords that indicate need for real-time data
    const realTimeKeywords = [
      // Market/Price related
      'price', 'rate', 'cost', 'market', 'mandi', 'selling',
      'भाव', 'कीमत', 'दाम', 'मंडी', 'बाजार',
      
      // Weather related  
      'weather', 'temperature', 'rain', 'rainfall', 'climate',
      'मौसम', 'बारिश', 'तापमान',
      
      // Time-sensitive queries
      'today', 'current', 'now', 'latest', 'recent',
      'आज', 'अभी', 'वर्तमान',
      
      // Trending/comparative
      'trend', 'rising', 'falling', 'increase', 'decrease',
      'बढ़', 'घट', 'ट्रेंड'
    ];
    
    const hasRealTimeKeywords = realTimeKeywords.some(keyword => 
      queryLower.includes(keyword)
    );
    
    // Also enhance if specific location or crop is mentioned
    const hasSpecificContext = context.location || context.crop;
    
    return hasRealTimeKeywords || hasSpecificContext;
  }

  private async fetchRelevantRealTimeData(query: RealTimeQuery): Promise<any> {
    console.log('📡 Fetching relevant real-time data...');
    
    try {
      // Check data freshness first
      const freshness = await dataScheduler.getDataFreshness();
      
      // If data is stale (older than configured intervals), fetch fresh data
      const needsFreshData = 
        freshness.marketDataAge > 120 || // 2 hours
        freshness.weatherDataAge > 60;   // 1 hour
      
      if (needsFreshData) {
        console.log('🔄 Data is stale, fetching fresh data...');
        await dataScheduler.manualFetchAll();
      }
      
      // Fetch relevant data based on query context
      const [marketData, weatherData] = await Promise.all([
        marketDataScraper.getLatestMarketData(query.location, query.crop),
        weatherDataFetcher.getLatestWeatherData(query.location)
      ]);
      
      // Generate contextual summary
      const summary = await geminiSummarizer.generateSummary({
        location: query.location,
        crop: query.crop,
        language: query.language
      });
      
      return {
        marketData: marketData.slice(0, 10), // Limit to most relevant
        weatherData: weatherData.slice(0, 5),
        summary,
        dataFreshness: await dataScheduler.getDataFreshness()
      };
      
    } catch (error) {
      console.error('❌ Failed to fetch real-time data:', error);
      return {
        marketData: [],
        weatherData: [],
        summary: null,
        dataFreshness: null
      };
    }
  }

  private async generateEnhancedResponse(
    query: RealTimeQuery,
    baseResponse: any,
    realTimeData: any
  ): Promise<EnhancedRAGResponse> {
    
    try {
      // Create enhanced prompt that combines base response with real-time data
      const enhancedPrompt = this.createEnhancedPrompt(query, baseResponse, realTimeData);
      
      // Generate enhanced response using the existing LLM
      const enhancedAnswer = await this.callEnhancedLLM(enhancedPrompt);
      
      // Calculate new confidence based on real-time data availability
      const enhancedConfidence = this.calculateEnhancedConfidence(
        baseResponse.confidence,
        realTimeData
      );
      
      return {
        answer: enhancedAnswer,
        sources: [...baseResponse.sources, ...this.createRealTimeDataSources(realTimeData)],
        confidence: enhancedConfidence,
        factualBasis: this.determineFactualBasis(realTimeData),
        generatedContent: baseResponse.generatedContent,
        disclaimer: this.createEnhancedDisclaimer(realTimeData),
        realTimeData
      };
      
    } catch (error) {
      console.error('❌ Failed to generate enhanced response:', error);
      
      // Return base response with real-time data attached
      return {
        ...baseResponse,
        realTimeData,
        disclaimer: `${baseResponse.disclaimer || ''} Real-time data integration partially failed.`
      };
    }
  }

  private createEnhancedPrompt(query: RealTimeQuery, baseResponse: any, realTimeData: any): string {
    const isHindi = query.language === 'hi';
    
    let prompt = `You are Krishi Sakha AI. Enhance the following agricultural advice with current real-time data.

ORIGINAL QUERY: ${query.query}
ORIGINAL RESPONSE: ${baseResponse.answer}

CURRENT REAL-TIME DATA:

MARKET DATA:
${this.formatMarketDataForPrompt(realTimeData.marketData)}

WEATHER DATA:  
${this.formatWeatherDataForPrompt(realTimeData.weatherData)}

GEMINI SUMMARY:
${realTimeData.summary?.headline || 'No summary available'}
${realTimeData.summary?.weatherImpact || ''}

INSTRUCTIONS:
1. Enhance the original response with specific current prices and weather conditions
2. Replace any outdated information with current data
3. Keep the same helpful, farmer-friendly tone
4. Use the structured format with emojis: 🔍 Query: | 🌦 Weather | 💰 Market Prices | 📋 Advisory | 💡 Tips
5. Include confidence scores and cite sources clearly
6. Highlight what data is current (today) vs general guidance
7. Maximum 400 words
8. ${isHindi ? 'Respond in Hindi with English numbers/prices' : 'Respond in English'}

ENHANCED RESPONSE:`;

    return prompt;
  }

  private formatMarketDataForPrompt(marketData: any[]): string {
    if (!marketData || marketData.length === 0) {
      return 'No current market price data available.';
    }
    
    let formatted = '';
    marketData.slice(0, 5).forEach(item => {
      const pricePerKg = (item.price_per_quintal / 100).toFixed(1);
      formatted += `- ${item.crop} at ${item.mandi}: ₹${pricePerKg}/kg (${item.trend}) - ${item.date}\n`;
    });
    
    return formatted;
  }

  private formatWeatherDataForPrompt(weatherData: any[]): string {
    if (!weatherData || weatherData.length === 0) {
      return 'No current weather data available.';
    }
    
    let formatted = '';
    weatherData.slice(0, 3).forEach(item => {
      formatted += `- ${item.location}: ${item.temp_c}°C, ${item.condition}`;
      if (item.rainfall_mm > 0) formatted += `, ${item.rainfall_mm}mm rain`;
      formatted += ` - ${item.date}\n`;
    });
    
    return formatted;
  }

  private async callEnhancedLLM(prompt: string): Promise<string> {
    try {
      // Use the existing Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-advice', {
        body: { prompt }
      });

      if (error) {
        console.error('Enhanced LLM call error:', error);
        // Return graceful fallback instead of throwing
        return this.generateFallbackEnhancedResponse(prompt);
      }

      return data?.advice || this.generateFallbackEnhancedResponse(prompt);
    } catch (error) {
      console.error('Enhanced LLM call failed:', error);
      return this.generateFallbackEnhancedResponse(prompt);
    }
  }

  private generateFallbackEnhancedResponse(prompt: string): string {
    // Try to extract key information from the prompt
    const queryMatch = prompt.match(/ORIGINAL QUERY:\s*([^\n]+)/i);
    const query = queryMatch ? queryMatch[1].trim() : 'Agricultural query';

    return `**🔍 Query:** ${query}

📊 **Analysis**: AI enhancement temporarily unavailable. Providing basic guidance based on general agricultural knowledge.

💡 **General Recommendations:**
• Consult local agricultural extension officers for current conditions
• Monitor weather forecasts and market trends regularly
• Follow recommended farming practices for your region
• Consider soil testing for optimal fertilizer application

⚠️ **Note**: Enhanced real-time data integration is temporarily unavailable. Basic agricultural guidance provided. Please try again later for enhanced insights with current market and weather data.`;
  }

  private calculateEnhancedConfidence(baseConfidence: number, realTimeData: any): number {
    let confidence = baseConfidence;
    
    // Boost confidence based on real-time data availability
    if (realTimeData.marketData?.length > 0) {
      confidence += 0.15; // 15% boost for current market data
    }
    
    if (realTimeData.weatherData?.length > 0) {
      confidence += 0.1; // 10% boost for current weather data
    }
    
    // Check data freshness
    if (realTimeData.dataFreshness) {
      const avgFreshness = (
        realTimeData.dataFreshness.marketDataAge + 
        realTimeData.dataFreshness.weatherDataAge
      ) / 2;
      
      if (avgFreshness < 60) { // Less than 1 hour old
        confidence += 0.1;
      }
    }
    
    return Math.min(confidence, 0.95); // Cap at 95%
  }

  private determineFactualBasis(realTimeData: any): 'high' | 'medium' | 'low' {
    const hasMarketData = realTimeData.marketData?.length > 0;
    const hasWeatherData = realTimeData.weatherData?.length > 0;
    const hasSummary = realTimeData.summary?.confidence > 0.5;
    
    if (hasMarketData && hasWeatherData && hasSummary) {
      return 'high';
    } else if (hasMarketData || hasWeatherData) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private createRealTimeDataSources(realTimeData: any): any[] {
    const sources = [];
    
    if (realTimeData.marketData?.length > 0) {
      sources.push({
        source: 'AGMARKNET Real-time Market Data',
        type: 'market',
        confidence: 0.9,
        freshness: 'fresh',
        citation: `Market prices updated ${new Date().toLocaleDateString()}`
      });
    }
    
    if (realTimeData.weatherData?.length > 0) {
      sources.push({
        source: 'Live Weather Data',
        type: 'weather', 
        confidence: 0.85,
        freshness: 'fresh',
        citation: `Weather data updated ${new Date().toLocaleDateString()}`
      });
    }
    
    return sources;
  }

  private createEnhancedDisclaimer(realTimeData: any): string {
    const marketAge = realTimeData.dataFreshness?.marketDataAge || 0;
    const weatherAge = realTimeData.dataFreshness?.weatherDataAge || 0;
    
    let disclaimer = 'Enhanced with real-time agricultural data. ';
    
    if (marketAge < 60) {
      disclaimer += 'Market prices are current. ';
    } else {
      disclaimer += `Market prices are ${Math.floor(marketAge / 60)} hours old. `;
    }
    
    if (weatherAge < 60) {
      disclaimer += 'Weather data is current.';
    } else {
      disclaimer += `Weather data is ${Math.floor(weatherAge / 60)} hours old.`;
    }
    
    return disclaimer;
  }

  // Public utility methods
  
  async getSystemStatus(): Promise<any> {
    return {
      scheduler: dataScheduler.getStatus(),
      dataFreshness: await dataScheduler.getDataFreshness(),
      timestamp: new Date().toISOString()
    };
  }

  async refreshAllData(): Promise<any> {
    console.log('🔄 Manually refreshing all real-time data...');
    return await dataScheduler.manualFetchAll();
  }

  async getQuickSummary(location?: string): Promise<string> {
    return await geminiSummarizer.generateQuickSummary(location);
  }

  async getLatestMarketPrices(location?: string, crop?: string): Promise<any[]> {
    return await marketDataScraper.getLatestMarketData(location, crop);
  }

  async getCurrentWeather(location?: string): Promise<any[]> {
    return await weatherDataFetcher.getLatestWeatherData(location);
  }
}

export const realTimeDataIntegration = new RealTimeDataIntegration();
