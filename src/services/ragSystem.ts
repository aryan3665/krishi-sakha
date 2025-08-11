import { supabase } from '@/integrations/supabase/client';
import { dataAgent, RetrievedData } from './dataRetrieval';
import { preprocessQuery } from '@/utils/queryPreprocessor';
import { QueryContext } from './dataSources';
import { offlineCache } from './offlineCache';

export interface RAGResponse {
  answer: string;
  sources: SourceReference[];
  confidence: number;
  factualBasis: 'high' | 'medium' | 'low';
  generatedContent: string[];
  disclaimer?: string;
}

export interface SourceReference {
  source: string;
  type: string;
  data: any;
  confidence: number;
  freshness: 'fresh' | 'cached' | 'stale';
  citation: string;
}

export class RetrievalAugmentedGeneration {
  private maxRetries = 3;
  private systemHealth = {
    apiStatus: true,
    cacheStatus: true,
    languageProcessing: true,
    demoMode: true
  };

  async generateAdvice(query: string, language: string): Promise<RAGResponse> {
    // Step 0: System Health Check
    await this.checkSystemHealth();

    try {
      // Check for cached response first
      const cached = offlineCache.getCachedResponse(query, language);
      if (cached) {
        console.log('Using cached response');
        return this.formatFarmerFriendlyResponse({
          ...cached.response,
          disclaimer: `📅 Cached response from ${cached.timestamp.toLocaleDateString()}. ${cached.response.disclaimer || ''}`
        }, cached.response.sources, language);
      }

      // Check if online for fresh data
      if (!offlineCache.isOnline()) {
        const offlineResponse = offlineCache.getOfflineFallback(query, language);
        if (offlineResponse) {
          return this.formatFarmerFriendlyResponse(offlineResponse, offlineResponse.sources, language);
        }

        // Return basic offline response if no cache available
        return this.getBasicOfflineResponse(query, language);
      }

      // Step 1: Preprocess and extract context
      const processed = preprocessQuery(query);
      if (!processed.isValid) {
        return this.getFallbackAdvisory(query, language, 'Invalid query format');
      }

      // Step 2: Retrieve relevant data with retries
      const retrievedData = await this.retrieveDataWithRetries(processed.extractedContext);

      // Step 3: Always ensure we have some data (use fallback if needed)
      if (retrievedData.length === 0) {
        return this.getFallbackAdvisory(query, language, 'No data sources available');
      }

      // Step 4: Create source references
      const sources = this.createSourceReferences(retrievedData);

      // Step 5: Build factual context for LLM
      const factualContext = this.buildFactualContext(retrievedData, processed.extractedContext);

      // Step 6: Generate grounded response
      const llmPrompt = this.constructFarmerFriendlyPrompt(processed.cleanedText, factualContext, language, processed.extractedContext);
      const answer = await this.callLLM(llmPrompt);

      // Step 7: Format response attractively
      const response: RAGResponse = {
        answer: answer,
        sources,
        confidence: this.calculateConfidence(retrievedData),
        factualBasis: this.assessFactualBasis(retrievedData),
        generatedContent: [],
        disclaimer: this.getSystemHealthDisclaimer()
      };

      const formattedResponse = this.formatFarmerFriendlyResponse(response, sources, language);

      // Cache the response for offline use
      offlineCache.cacheResponse(
        query,
        language,
        formattedResponse,
        processed.extractedContext.location ? {
          state: processed.extractedContext.location.state,
          district: processed.extractedContext.location.district
        } : undefined
      );

      return formattedResponse;
    } catch (error) {
      console.error('RAG generation error:', error);

      // Never fail completely - always provide fallback
      return this.getFallbackAdvisory(query, language, 'System temporarily unavailable');
    }
  }

  private async retrieveDataWithRetries(context: QueryContext): Promise<RetrievedData[]> {
    let retrievedData: RetrievedData[] = [];
    let attempts = 0;

    while (attempts < this.maxRetries && retrievedData.length === 0) {
      try {
        retrievedData = await dataAgent.retrieveAllRelevantData(context);
        if (retrievedData.length > 0) break;
      } catch (error) {
        console.warn(`Data retrieval attempt ${attempts + 1} failed:`, error);
      }
      attempts++;

      // Small delay before retry
      if (attempts < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // If still no data, try cached data
    if (retrievedData.length === 0) {
      retrievedData = this.getCachedFallbackData(context);
    }

    return retrievedData;
  }

  private getCachedFallbackData(context: QueryContext): RetrievedData[] {
    // Return basic fallback data structure
    const fallbackData: RetrievedData[] = [];

    if (context.location) {
      fallbackData.push({
        source: 'Last Known Data',
        type: 'weather',
        data: {
          temperature: 28,
          humidity: 65,
          condition: 'Partly Cloudy',
          advisory: 'Check local conditions'
        },
        confidence: 0.3,
        timestamp: new Date(),
        location: context.location,
        metadata: {
          freshness: 'stale',
          reliability: 'low'
        }
      });
    }

    return fallbackData;
  }

  private getBasicOfflineResponse(query: string, language: string): RAGResponse {
    const basicAdvice = language === 'hi' ?
      'इंटरनेट कनेक्शन नहीं है। कृपया स्थानीय कृषि विशेषज्ञ से सलाह लें।' :
      'No internet connection available. Please consult with local agricultural experts for specific advice based on your soil, climate, and crop conditions.';

    return {
      answer: basicAdvice,
      sources: [],
      confidence: 0.3,
      factualBasis: 'low',
      generatedContent: ['General offline advice'],
      disclaimer: 'This is a basic offline response. Connect to internet for detailed, data-driven advice.'
    };
  }

  private createSourceReferences(retrievedData: RetrievedData[]): SourceReference[] {
    return retrievedData.map(data => ({
      source: data.source,
      type: data.type,
      data: data.data,
      confidence: data.confidence,
      freshness: data.metadata.freshness,
      citation: this.generateCitation(data)
    }));
  }

  private generateCitation(data: RetrievedData): string {
    const date = data.timestamp.toLocaleDateString();
    const location = data.location ? ` for ${data.location.district}, ${data.location.state}` : '';
    return `${data.source} (${date})${location}`;
  }

  private buildFactualContext(retrievedData: RetrievedData[], context: QueryContext): string {
    let factualContext = "CURRENT VERIFIED DATA:\n\n";

    for (const data of retrievedData) {
      factualContext += `## ${data.type.toUpperCase()} DATA - ${data.source}\n`;
      factualContext += `Confidence: ${(data.confidence * 100).toFixed(0)}%\n`;
      factualContext += `Freshness: ${data.metadata.freshness}\n`;
      
      if (data.location) {
        factualContext += `Location: ${data.location.district}, ${data.location.state}\n`;
      }

      switch (data.type) {
        case 'weather':
          const weather = data.data;
          factualContext += `Temperature: ${weather.temperature}°C\n`;
          factualContext += `Humidity: ${weather.humidity}%\n`;
          factualContext += `Rainfall: ${weather.rainfall}mm\n`;
          factualContext += `Wind Speed: ${weather.windSpeed} km/h\n`;
          if (weather.forecast) {
            factualContext += "3-day forecast:\n";
            weather.forecast.forEach((day: any) => {
              factualContext += `  ${day.day}: ${day.temp}°C, ${day.condition}, Rain: ${day.rain}%\n`;
            });
          }
          break;

        case 'market':
          const market = data.data;
          factualContext += `Market: ${market.location}\n`;
          factualContext += `Date: ${market.date}\n`;
          market.prices.forEach((price: any) => {
            factualContext += `${price.crop}: ₹${price.minPrice}-${price.maxPrice} (Modal: ₹${price.modalPrice}) ${price.unit}\n`;
          });
          factualContext += `Price Trend: ${market.trend}\n`;
          break;

        case 'advisory':
          const advisory = data.data;
          factualContext += `Location: ${advisory.location}\n`;
          advisory.advisories.forEach((adv: any, index: number) => {
            factualContext += `Advisory ${index + 1}: ${adv.title}\n`;
            factualContext += `Content: ${adv.content}\n`;
            factualContext += `Priority: ${adv.priority}\n`;
            factualContext += `Source: ${adv.source}\n`;
          });
          break;

        case 'soil':
          const soil = data.data;
          factualContext += `Soil Type: ${soil.soilType}\n`;
          factualContext += `pH: ${soil.pH}\n`;
          factualContext += `Organic Carbon: ${soil.organicCarbon}%\n`;
          factualContext += `Nitrogen: ${soil.nitrogen}\n`;
          factualContext += `Phosphorus: ${soil.phosphorus}\n`;
          factualContext += `Potassium: ${soil.potassium}\n`;
          factualContext += "Recommendations:\n";
          soil.recommendations.forEach((rec: string) => {
            factualContext += `  - ${rec}\n`;
          });
          break;

        case 'scheme':
          const schemes = data.data;
          factualContext += `State: ${schemes.state}\n`;
          schemes.schemes.forEach((scheme: any) => {
            factualContext += `Scheme: ${scheme.name}\n`;
            factualContext += `Description: ${scheme.description}\n`;
            factualContext += `Eligibility: ${scheme.eligibility}\n`;
            factualContext += `Benefit: ${scheme.benefit}\n`;
            factualContext += `Application: ${scheme.applicationProcess}\n`;
          });
          break;
      }
      factualContext += "\n";
    }

    return factualContext;
  }

  private constructPrompt(query: string, factualContext: string, language: string): string {
    const languageInstruction = language === 'en' ? 
      'Respond in clear, simple English suitable for farmers.' :
      `Respond in ${language} language, using simple terms that farmers can understand.`;

    return `You are Krishi Sakha, an expert agricultural advisor for Indian farmers. Use the verified data provided below to answer the farmer's question accurately and helpfully.

${factualContext}

FARMER'S QUESTION: ${query}

INSTRUCTIONS:
1. Use ONLY the verified data provided above to support your answer
2. ${languageInstruction}
3. Be specific and practical in your recommendations
4. If the data doesn't fully address the question, clearly state what information is verified vs. general knowledge
5. Always mention data sources when citing specific facts
6. Provide actionable advice where possible
7. If location-specific data is available, prioritize it over general information
8. Format your response clearly with bullet points or numbered lists when appropriate

RESPONSE:`;
  }

  private async callLLM(prompt: string): Promise<string> {
    try {
      // Call Supabase Edge Function for AI generation
      const { data, error } = await supabase.functions.invoke('generate-advice', {
        body: { prompt }
      });

      if (error) {
        console.error('LLM call error:', error);
        return 'I apologize, but I cannot provide advice at the moment. Please try again later.';
      }

      return data.advice || 'Unable to generate response.';
    } catch (error) {
      console.error('Error calling LLM:', error);
      return 'I apologize, but I cannot provide advice at the moment. Please try again later.';
    }
  }

  private analyzeResponse(answer: string, sources: SourceReference[]): {
    answer: string;
    confidence: number;
    factualBasis: 'high' | 'medium' | 'low';
    generatedContent: string[];
    disclaimer?: string;
  } {
    const verifiedSources = sources.filter(s => s.freshness === 'fresh' && s.confidence > 0.7);
    const totalSources = sources.length;
    
    let factualBasis: 'high' | 'medium' | 'low';
    let confidence: number;
    let disclaimer: string | undefined;

    if (verifiedSources.length >= 2 && totalSources >= 2) {
      factualBasis = 'high';
      confidence = 0.9;
    } else if (verifiedSources.length >= 1 || totalSources >= 1) {
      factualBasis = 'medium';
      confidence = 0.7;
      disclaimer = 'This advice is based on available data, but please verify locally for your specific conditions.';
    } else {
      factualBasis = 'low';
      confidence = 0.5;
      disclaimer = 'This response is based on general agricultural knowledge. Please consult local experts for location-specific advice.';
    }

    // Identify potentially generated content
    const generatedContent: string[] = [];
    const commonGenerativePatterns = [
      /generally speaking/i,
      /in most cases/i,
      /typically/i,
      /usually/i,
      /it is recommended/i
    ];

    const sentences = answer.split(/[.!?]+/);
    sentences.forEach(sentence => {
      if (commonGenerativePatterns.some(pattern => pattern.test(sentence))) {
        generatedContent.push(sentence.trim());
      }
    });

    return {
      answer,
      confidence,
      factualBasis,
      generatedContent,
      disclaimer
    };
  }
}

export const ragSystem = new RetrievalAugmentedGeneration();
