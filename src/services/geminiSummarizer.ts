import { supabase } from '@/integrations/supabase/client';
import { MarketDataPoint } from './marketDataScraper';
import { WeatherDataPoint } from './weatherDataFetcher';

export interface SummaryRequest {
  location?: string;
  crop?: string;
  language?: string;
}

export interface MarketSummary {
  headline: string;
  marketTable: string;
  weatherImpact: string;
  confidence: number;
  lastUpdated: string;
  dataPoints: number;
}

export class GeminiSummarizer {
  private readonly GEMINI_PROMPT = `You are Krishi Sakha AI, an agricultural market and weather data summarizer.
Generate a clear, friendly summary including:

✅ Output Format:

Headline summary (2-3 lines)

Markdown table:
| Crop | Mandi | Price (₹/kg) | Trend |
|------|-------|--------------|-------|

Weather impact statement (1-2 lines)

📌 Instructions:

• Convert prices from ₹/quintal to ₹/kg (divide prices by 100).
• Indicate if prices are rising, falling, or stable compared to previous day.
• Use simple language suitable for farmers and consumers.
• Include emojis in headings for readability.
• Clearly mention weather effects on supply/prices/storage if applicable.
• If data is missing, say: "No official data available today."
• Keep response under 300 words total.
• Use Hindi phrases where appropriate for authenticity.

Current Data Context:
{MARKET_DATA}

{WEATHER_DATA}

Generate the summary now:`;

  async generateSummary(request: SummaryRequest): Promise<MarketSummary> {
    try {
      console.log('🤖 Generating summary for:', request);

      // Fetch relevant market and weather data
      const marketData = await this.getMarketData(request.location, request.crop);
      const weatherData = await this.getWeatherData(request.location);

      if (marketData.length === 0 && weatherData.length === 0) {
        return this.getEmptySummary();
      }

      // Try offline-first approach with structured data
      console.log('📊 Generating offline structured summary...');
      const offlineSummary = this.generateOfflineStructuredSummary(marketData, weatherData, request.location);

      // Return offline summary immediately - no need to wait for Edge Function
      console.log('✅ Using offline structured summary (more reliable)');
      return offlineSummary;

    } catch (error) {
      console.error('❌ Failed to generate summary:', error);
      return this.getFallbackSummary(request);
    }
  }

  private async getMarketData(location?: string, crop?: string): Promise<MarketDataPoint[]> {
    try {
      let query = supabase
        .from('market_data')
        .select('*')
        .order('fetched_at', { ascending: false });

      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      if (crop) {
        query = query.ilike('crop', `%${crop}%`);
      }

      // Get latest data from today or yesterday
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      query = query.gte('date', twoDaysAgo.toISOString().split('T')[0]);

      const { data, error } = await query.limit(20);

      if (error) {
        console.error('Error fetching market data:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch market data for summary:', error);
      return [];
    }
  }

  private async getWeatherData(location?: string): Promise<WeatherDataPoint[]> {
    try {
      let query = supabase
        .from('weather_data')
        .select('*')
        .order('fetched_at', { ascending: false });

      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      // Get latest weather data from today
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('date', today);

      const { data, error } = await query.limit(10);

      if (error) {
        console.error('Error fetching weather data:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch weather data for summary:', error);
      return [];
    }
  }

  private formatMarketDataForPrompt(marketData: MarketDataPoint[]): string {
    if (marketData.length === 0) {
      return "Market Data: No recent market price data available.";
    }

    let context = "Market Data:\n";
    marketData.forEach(item => {
      const pricePerKg = (item.price_per_quintal / 100).toFixed(1);
      context += `- ${item.crop} at ${item.mandi}: ₹${pricePerKg}/kg (${item.trend || 'stable'})\n`;
    });

    return context;
  }

  private formatWeatherDataForPrompt(weatherData: WeatherDataPoint[]): string {
    if (weatherData.length === 0) {
      return "Weather Data: No recent weather data available.";
    }

    let context = "Weather Data:\n";
    weatherData.forEach(item => {
      context += `- ${item.location}: ${item.temp_c}°C, ${item.condition}`;
      if (item.rainfall_mm > 0) {
        context += `, ${item.rainfall_mm}mm rainfall`;
      }
      if (item.humidity) {
        context += `, ${item.humidity}% humidity`;
      }
      context += "\n";
    });

    return context;
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    try {
      console.log('🤖 Attempting to call Gemini API via Edge Function...');

      // Use the existing Supabase Edge Function for AI calls
      const { data, error } = await supabase.functions.invoke('generate-advice', {
        body: {
          prompt,
          model: 'gemini' // Specify Gemini model if the edge function supports it
        }
      });

      if (error) {
        console.warn('⚠️ Gemini API call failed:', error.message || error);

        // Log specific error types for debugging
        if (error.message?.includes('500')) {
          console.warn('🔑 Likely cause: GEMINI_API_KEY not configured in Edge Functions');
        } else if (error.message?.includes('429')) {
          console.warn('⏱️ Likely cause: Rate limiting or quota exceeded');
        } else if (error.message?.includes('404')) {
          console.warn('🚫 Likely cause: Edge Function not deployed or not found');
        }

        // Always return fallback instead of throwing
        console.log('📋 Using offline structured summary instead...');
        return this.generateFallbackSummary(prompt);
      }

      console.log('✅ Gemini API call successful');
      return data?.advice || data?.response || this.generateFallbackSummary(prompt);
    } catch (error) {
      console.warn('❌ Unexpected error calling Gemini via Edge Function:', error);
      console.log('📋 Falling back to offline structured summary...');
      // Always return fallback instead of throwing
      return this.generateFallbackSummary(prompt);
    }
  }

  private generateOfflineStructuredSummary(marketData: any[], weatherData: any[], location?: string): MarketSummary {
    const today = new Date().toLocaleDateString('en-IN');
    const loc = location || 'India';

    let headline = `📢 Market Update (${loc}, ${today}): `;

    if (marketData.length > 0) {
      const totalCrops = marketData.length;
      const risingTrends = marketData.filter(item => item.trend === 'rising').length;
      const fallingTrends = marketData.filter(item => item.trend === 'falling').length;

      if (risingTrends > fallingTrends) {
        headline += `${totalCrops} crops showing mostly rising price trends.`;
      } else if (fallingTrends > risingTrends) {
        headline += `${totalCrops} crops showing mostly declining price trends.`;
      } else {
        headline += `${totalCrops} crops showing mixed price trends.`;
      }

      // Add specific crop mention
      const sampleCrop = marketData[0];
      const pricePerKg = (sampleCrop.price_per_quintal / 100).toFixed(1);
      headline += ` ${sampleCrop.crop} trading at ₹${pricePerKg}/kg.`;
    } else {
      headline += 'Market data collection in progress.';
    }

    // Generate market table
    let marketTable = '| Crop | Mandi | Price (₹/kg) | Trend |\n|------|-------|--------------|-------|\n';

    if (marketData.length > 0) {
      marketData.slice(0, 8).forEach(item => {
        const pricePerKg = (item.price_per_quintal / 100).toFixed(1);
        const trendIcon = item.trend === 'rising' ? '📈' :
                         item.trend === 'falling' ? '📉' : '➡️';
        const trend = `${trendIcon} ${item.trend || 'Stable'}`;
        marketTable += `| ${item.crop} | ${item.mandi} | ${pricePerKg} | ${trend} |\n`;
      });
    } else {
      marketTable += '| - | - | Data collection in progress | - |\n';
    }

    // Generate weather impact
    let weatherImpact = '🌦️ Weather Impact: ';
    if (weatherData.length > 0) {
      const avgTemp = Math.round(weatherData.reduce((sum, w) => sum + w.temp_c, 0) / weatherData.length);
      const totalRainfall = weatherData.reduce((sum, w) => sum + w.rainfall_mm, 0);
      const avgHumidity = Math.round(weatherData.reduce((sum, w) => sum + (w.humidity || 0), 0) / weatherData.length);

      weatherImpact += `Current average temperature ${avgTemp}°C with ${avgHumidity}% humidity. `;

      if (totalRainfall > 5) {
        weatherImpact += `Recent rainfall (${totalRainfall.toFixed(1)}mm) may impact transportation and storage of perishable crops.`;
      } else if (avgTemp > 35) {
        weatherImpact += 'High temperatures may stress crops and increase water requirements.';
      } else if (avgTemp < 15) {
        weatherImpact += 'Cool weather conditions favorable for Rabi crops and storage.';
      } else {
        weatherImpact += 'Weather conditions are generally favorable for farming activities.';
      }
    } else {
      weatherImpact += 'Weather monitoring in progress for agricultural impact analysis.';
    }

    return {
      headline,
      marketTable,
      weatherImpact,
      confidence: 0.85, // High confidence for structured data
      lastUpdated: new Date().toISOString(),
      dataPoints: marketData.length + weatherData.length
    };
  }

  private generateFallbackSummary(prompt: string): string {
    // Extract any location info from prompt if possible
    const locationMatch = prompt.match(/location[:\s]+([^,\n]+)/i);
    const location = locationMatch ? locationMatch[1].trim() : 'India';

    return `📢 Market Update (${location}): Agricultural data summary temporarily unavailable due to system maintenance.

| Crop | Mandi | Price (₹/kg) | Trend |
|------|-------|--------------|-------|
| - | - | Service unavailable | - |

🌦️ Weather Impact: Weather analysis temporarily unavailable. Please check back shortly for updated market and weather insights.`;
  }

  private parseGeminiResponse(response: string, marketData: MarketDataPoint[], weatherData: WeatherDataPoint[]): MarketSummary {
    try {
      // Try to extract structured parts from the response
      const lines = response.split('\n');
      
      let headline = '';
      let marketTable = '';
      let weatherImpact = '';
      let inTable = false;

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (!trimmedLine) continue;

        // Check if we're entering a table
        if (trimmedLine.includes('|') && trimmedLine.includes('Crop')) {
          inTable = true;
          marketTable += trimmedLine + '\n';
          continue;
        }

        // Continue building table
        if (inTable && trimmedLine.includes('|')) {
          marketTable += trimmedLine + '\n';
          continue;
        } else if (inTable && !trimmedLine.includes('|')) {
          inTable = false;
        }

        // Extract headline (usually the first substantial line)
        if (!headline && trimmedLine.length > 20 && !trimmedLine.includes('|')) {
          headline = trimmedLine;
        }

        // Extract weather impact (usually mentions weather/temperature/rainfall)
        if (trimmedLine.toLowerCase().includes('weather') || 
            trimmedLine.toLowerCase().includes('temperature') || 
            trimmedLine.toLowerCase().includes('rainfall') ||
            trimmedLine.includes('🌦️')) {
          weatherImpact = trimmedLine;
        }
      }

      // Fallback to structured response if parsing fails
      if (!headline || !marketTable) {
        return this.generateStructuredSummary(marketData, weatherData);
      }

      return {
        headline: headline || 'Market and weather summary available',
        marketTable: marketTable || 'No market data table generated',
        weatherImpact: weatherImpact || 'Weather impact information not available',
        confidence: 0.8,
        lastUpdated: new Date().toISOString(),
        dataPoints: marketData.length + weatherData.length
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return this.generateStructuredSummary(marketData, weatherData);
    }
  }

  private generateStructuredSummary(marketData: MarketDataPoint[], weatherData: WeatherDataPoint[]): MarketSummary {
    // Generate a structured summary when Gemini response can't be parsed
    const today = new Date().toLocaleDateString('en-IN');
    
    let headline = `📢 Market Update (${today}): `;
    if (marketData.length > 0) {
      const sampleCrop = marketData[0];
      const pricePerKg = (sampleCrop.price_per_quintal / 100).toFixed(1);
      headline += `${sampleCrop.crop} prices are ${sampleCrop.trend || 'stable'} at ₹${pricePerKg}/kg`;
      
      if (marketData.length > 1) {
        headline += ` and ${marketData.length - 1} other crops showing market activity.`;
      }
    } else {
      headline += 'Limited market data available today.';
    }

    // Generate market table
    let marketTable = '| Crop | Mandi | Price (₹/kg) | Trend |\n|------|-------|--------------|-------|\n';
    
    if (marketData.length > 0) {
      marketData.slice(0, 5).forEach(item => {
        const pricePerKg = (item.price_per_quintal / 100).toFixed(1);
        const trend = item.trend === 'rising' ? '📈 Rising' : 
                     item.trend === 'falling' ? '📉 Falling' : '➡️ Stable';
        marketTable += `| ${item.crop} | ${item.mandi} | ${pricePerKg} | ${trend} |\n`;
      });
    } else {
      marketTable += '| - | - | - | No data available |\n';
    }

    // Generate weather impact
    let weatherImpact = '🌦️ Weather Impact: ';
    if (weatherData.length > 0) {
      const avgTemp = weatherData.reduce((sum, w) => sum + w.temp_c, 0) / weatherData.length;
      const totalRainfall = weatherData.reduce((sum, w) => sum + w.rainfall_mm, 0);
      
      weatherImpact += `Average temperature of ${avgTemp.toFixed(1)}°C`;
      
      if (totalRainfall > 0) {
        weatherImpact += ` with ${totalRainfall.toFixed(1)}mm rainfall may affect storage and transportation of perishable crops.`;
      } else {
        weatherImpact += ` with dry conditions supporting good storage and market movement.`;
      }
    } else {
      weatherImpact += 'Weather data not available for impact analysis.';
    }

    return {
      headline,
      marketTable,
      weatherImpact,
      confidence: 0.6,
      lastUpdated: new Date().toISOString(),
      dataPoints: marketData.length + weatherData.length
    };
  }

  private getEmptySummary(): MarketSummary {
    return {
      headline: '📢 Market Update: No current market or weather data available.',
      marketTable: '| Crop | Mandi | Price (₹/kg) | Trend |\n|------|-------|--------------|-------|\n| - | - | - | No data available |',
      weatherImpact: '🌦️ Weather Impact: Weather data not available for analysis.',
      confidence: 0.1,
      lastUpdated: new Date().toISOString(),
      dataPoints: 0
    };
  }

  private getFallbackSummary(request: SummaryRequest): MarketSummary {
    const location = request.location || 'India';
    return {
      headline: `📢 Market Update (${location}): Summary generation temporarily unavailable. Please check back later.`,
      marketTable: '| Crop | Mandi | Price (₹/kg) | Trend |\n|------|-------|--------------|-------|\n| - | - | - | Service unavailable |',
      weatherImpact: '🌦️ Weather Impact: Unable to analyze weather impact at this time.',
      confidence: 0.2,
      lastUpdated: new Date().toISOString(),
      dataPoints: 0
    };
  }

  private async storeSummary(summary: MarketSummary, request: SummaryRequest): Promise<void> {
    try {
      // Store in a summaries table for caching (if we create one later)
      console.log('📄 Summary generated and ready for caching:', {
        location: request.location,
        crop: request.crop,
        dataPoints: summary.dataPoints,
        confidence: summary.confidence
      });
    } catch (error) {
      console.error('Failed to store summary:', error);
    }
  }

  async generateQuickSummary(location?: string): Promise<string> {
    try {
      const summary = await this.generateSummary({ location });
      
      // Return a condensed version for quick display
      return `${summary.headline}\n\n${summary.weatherImpact}`;
    } catch (error) {
      console.error('Failed to generate quick summary:', error);
      return 'Market summary temporarily unavailable. Please try again later.';
    }
  }
}

export const geminiSummarizer = new GeminiSummarizer();
