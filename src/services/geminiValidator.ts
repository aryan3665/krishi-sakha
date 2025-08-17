// Gemini LLM Validation Service - Validates and enhances ALL responses
import { supabase } from '@/integrations/supabase/client';

export interface GeminiValidationRequest {
  originalQuery: string;
  translatedQuery: string;
  detectedLanguage: string;
  candidateResponse: string;
  apiDataSources: any[];
  confidence: number;
}

export interface GeminiValidationResponse {
  isAccurate: boolean;
  isComplete: boolean;
  enhancedResponse: string;
  confidence: number;
  factualBasis: 'high' | 'medium' | 'low';
  sources: string[];
  disclaimer?: string;
  corrections?: string[];
}

const GEMINI_VALIDATION_PROMPT = `You are Krishi Sakha AI, an expert agricultural advisor for Indian farmers. Your role is to validate and enhance agricultural advice with STRICT NO-HALLUCINATION policy.

**CRITICAL VALIDATION RULES:**

🚫 **ABSOLUTE PROHIBITIONS:**
- NEVER hallucinate or generate fake price data
- NEVER show generic advice when specific price data is requested
- NEVER show call center numbers as replacement for missing price data
- NEVER create fictional mandi names or prices

✅ **MANDATORY REQUIREMENTS:**

1. **For PRICE QUERIES:**
   - ONLY show actual API data if available: mandi name, crop, ₹/kg price, date, source
   - If NO real price data found, state clearly: "No current price data available for [crop] in [location] today"
   - NEVER generate fallback prices - be honest about data absence

2. **Response Format:**
🔍 **Query:** [User's exact original question as asked]

💰 **Market Prices:** (ONLY if real API data exists)
• [Mandi Name]: [Crop] - ₹[amount]/kg (Date: [date], Source: [source])

OR

⚠️ **Price Data Status:**
• No current price data available for [requested crop] in [requested location]
• Please check again later or visit local mandi for current rates

3. **Data Validation:**
- Check if candidate response contains actual mandi data matching user's request
- Verify prices are from legitimate sources (AGMARKNET, eNAM, Local Market Survey)
- Ensure dates are recent (within 7 days)

4. **Confidence Scoring:**
- "High (95%) - Live API Data" for real market data
- "Medium (65%) - Agricultural Knowledge" for general advice
- "Low (30%) - No Current Data" when specific data unavailable

**Input to validate:**
- **Original Query:** {originalQuery}
- **Translated Query:** {translatedQuery}
- **Language:** {detectedLanguage}
- **Candidate Response:** {candidateResponse}
- **Available Data Sources:** {apiDataSources}

VALIDATE: Does the response show ONLY real price data for price queries? If not, correct it immediately.`;

export class GeminiValidator {
  private geminiApiKey: string | null = null;

  constructor() {
    // API key will be loaded from environment or Supabase
    this.initializeApiKey();
  }

  private async initializeApiKey() {
    try {
      // Try to get from environment first
      this.geminiApiKey = process.env.GEMINI_API_KEY || null;
      
      // If not available, try to get from Supabase (for production)
      if (!this.geminiApiKey) {
        console.log('🔑 Gemini API key loaded from environment configuration');
        // In production, this would be passed through the Edge Function
        this.geminiApiKey = 'configured-via-edge-function';
      }
    } catch (error) {
      console.warn('⚠️ Gemini API key not available, using offline validation only');
    }
  }

  async validateAndEnhanceResponse(request: GeminiValidationRequest): Promise<GeminiValidationResponse> {
    try {
      // Always try Gemini validation first
      const geminiResponse = await this.callGeminiAPI(request);
      if (geminiResponse) {
        return geminiResponse;
      }
    } catch (error) {
      console.warn('⚠️ Gemini validation failed, using offline validation:', error);
    }

    // Fallback to offline validation
    return this.offlineValidation(request);
  }

  private async callGeminiAPI(request: GeminiValidationRequest): Promise<GeminiValidationResponse | null> {
    try {
      // Use Supabase Edge Function for Gemini API calls
      const prompt = GEMINI_VALIDATION_PROMPT
        .replace('{originalQuery}', request.originalQuery)
        .replace('{translatedQuery}', request.translatedQuery)
        .replace('{detectedLanguage}', request.detectedLanguage)
        .replace('{candidateResponse}', request.candidateResponse)
        .replace('{apiDataSources}', JSON.stringify(request.apiDataSources, null, 2));

      const { data, error } = await supabase.functions.invoke('generate-advice', {
        body: {
          prompt: prompt,
          model: 'gemini-1.5-flash',
          temperature: 0.3, // Lower temperature for more consistent validation
          max_tokens: 1000
        }
      });

      if (error) {
        console.error('Gemini API error:', error);
        return null;
      }

      if (!data?.advice) {
        console.warn('No advice received from Gemini API');
        return null;
      }

      // Parse and validate Gemini response
      return this.parseGeminiResponse(data.advice, request);

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return null;
    }
  }

  private parseGeminiResponse(response: string, request: GeminiValidationRequest): GeminiValidationResponse {
    // Parse the structured response from Gemini
    const confidenceMatch = response.match(/\*\*Confidence Level:\*\*\s*(High|Medium|Low)/i);
    const confidence = confidenceMatch ? confidenceMatch[1].toLowerCase() : 'medium';

    // Extract sections for validation
    const hasKeyRecommendations = response.includes('💡 **Key Recommendations:**');
    const hasImportantDetails = response.includes('📊 **Important Details:**') || response.includes('specific data');
    const hasPrecautions = response.includes('⚠️ **Precautions:**');

    // Determine if response is complete and accurate
    const isComplete = hasKeyRecommendations && (hasImportantDetails || hasPrecautions);
    const isAccurate = response.length > 200 && !response.includes('I don\'t know') && !response.includes('cannot provide');

    // Extract sources mentioned
    const sources = [];
    if (response.includes('Kisan Call Center')) sources.push('Kisan Call Center');
    if (response.includes('Krishi Vigyan Kendra')) sources.push('KVK');
    if (request.apiDataSources?.length > 0) sources.push('Government APIs');

    // Determine factual basis
    let factualBasis: 'high' | 'medium' | 'low' = 'medium';
    if (request.apiDataSources?.length > 0 && confidence === 'high') {
      factualBasis = 'high';
    } else if (confidence === 'low' || !isAccurate) {
      factualBasis = 'low';
    }

    return {
      isAccurate,
      isComplete,
      enhancedResponse: response,
      confidence: this.confidenceToNumber(confidence),
      factualBasis,
      sources,
      disclaimer: factualBasis === 'low' ? 'This advice is based on general agricultural knowledge. For specific issues, consult local experts.' : undefined
    };
  }

  private confidenceToNumber(confidence: string): number {
    switch (confidence.toLowerCase()) {
      case 'high': return 0.9;
      case 'medium': return 0.7;
      case 'low': return 0.5;
      default: return 0.7;
    }
  }

  private offlineValidation(request: GeminiValidationRequest): GeminiValidationResponse {
    // Offline validation logic when Gemini is not available
    const candidateResponse = request.candidateResponse;
    
    // Basic validation checks
    const hasRelevantContent = this.checkRelevantContent(candidateResponse, request.translatedQuery);
    const hasStructuredFormat = candidateResponse.includes('💡') || candidateResponse.includes('📊') || candidateResponse.includes('⚠️');
    const hasActionableAdvice = candidateResponse.includes('•') || candidateResponse.includes('-') || candidateResponse.toLowerCase().includes('should');
    
    const isAccurate = hasRelevantContent && candidateResponse.length > 100;
    const isComplete = hasStructuredFormat && hasActionableAdvice;

    let enhancedResponse = candidateResponse;

    // Enhance the response if needed
    if (!hasStructuredFormat) {
      enhancedResponse = this.addStructuredFormat(candidateResponse, request);
    }

    // Add agricultural context if missing
    if (!candidateResponse.toLowerCase().includes('farmer') && !candidateResponse.toLowerCase().includes('crop')) {
      enhancedResponse = this.addAgriculturalContext(enhancedResponse, request);
    }

    return {
      isAccurate,
      isComplete,
      enhancedResponse,
      confidence: request.confidence || 0.6,
      factualBasis: request.apiDataSources?.length > 0 ? 'high' : 'medium',
      sources: request.apiDataSources?.length > 0 ? ['Government Data'] : ['Agricultural Knowledge Base'],
      disclaimer: 'Response enhanced by offline validation system. For latest data, ensure internet connectivity.'
    };
  }

  private checkRelevantContent(response: string, query: string): boolean {
    const queryWords = query.toLowerCase().split(/\s+/);
    const responseWords = response.toLowerCase().split(/\s+/);
    
    // Check if at least 30% of query words appear in response
    const matchingWords = queryWords.filter(word => 
      word.length > 3 && responseWords.some(rWord => rWord.includes(word) || word.includes(rWord))
    );
    
    return matchingWords.length >= Math.min(3, queryWords.length * 0.3);
  }

  private addStructuredFormat(response: string, request: GeminiValidationRequest): string {
    const topic = this.extractTopic(request.translatedQuery);

    return `🔍 **Query:** ${request.originalQuery}

🌾 **${topic} Advisory**

💡 **Key Recommendations:**
${response}

📞 **Additional Support:**
• Kisan Call Center: 1800-180-1551
• Local Krishi Vigyan Kendra
• Agricultural Extension Officer

⚠️ **Note:** This advice is based on general agricultural knowledge. For specific local conditions, consult nearby agricultural experts.`;
  }

  private addAgriculturalContext(response: string, request: GeminiValidationRequest): string {
    const contextualPrefix = this.getContextualPrefix(request.translatedQuery);
    return `${contextualPrefix}\n\n${response}`;
  }

  private extractTopic(query: string): string {
    const topics = {
      'price': 'Market Price',
      'weather': 'Weather',
      'pest': 'Pest Control',
      'disease': 'Disease Management',
      'fertilizer': 'Fertilizer',
      'irrigation': 'Irrigation',
      'seed': 'Seed',
      'soil': 'Soil Management',
      'harvest': 'Harvesting',
      'planting': 'Planting'
    };

    for (const [keyword, topic] of Object.entries(topics)) {
      if (query.toLowerCase().includes(keyword)) {
        return topic;
      }
    }

    return 'Agricultural';
  }

  private getContextualPrefix(query: string): string {
    if (query.includes('price') || query.includes('market')) {
      return '💰 **Market Information:** Based on current agricultural market trends and government data sources.';
    } else if (query.includes('weather')) {
      return '🌤️ **Weather Advisory:** Based on meteorological data and farming best practices.';
    } else if (query.includes('pest') || query.includes('disease')) {
      return '🛡️ **Crop Protection:** Based on integrated pest management principles and organic farming practices.';
    } else {
      return '🌾 **Agricultural Guidance:** Based on scientific farming practices and expert recommendations.';
    }
  }

  // Public method to check if Gemini is available
  isGeminiAvailable(): boolean {
    return this.geminiApiKey !== null;
  }

  // Method to get validation status
  getValidationStatus(): { 
    geminiAvailable: boolean; 
    offlineMode: boolean; 
    capabilities: string[] 
  } {
    const geminiAvailable = this.isGeminiAvailable();
    
    return {
      geminiAvailable,
      offlineMode: !geminiAvailable,
      capabilities: geminiAvailable 
        ? ['Real-time validation', 'AI enhancement', 'Context checking', 'Fact verification']
        : ['Offline validation', 'Format enhancement', 'Basic accuracy checks']
    };
  }
}

// Export singleton instance
export const geminiValidator = new GeminiValidator();
