export interface AIResponse {
  advice: string;
  explanation: string;
  confidence: number;
}

export class OfflineAIService {
  private knowledgeBase: { [key: string]: AIResponse } = {
    // Market/Price related queries
    'onion price': {
      advice: 'To get current onion prices, check local mandis, AGMARKNET portal, or contact nearby Agricultural Market Committee (APMC). Prices vary by variety, location, and season.',
      explanation: 'Onion prices fluctuate based on supply, demand, storage capacity, and weather conditions.',
      confidence: 0.8
    },
    'potato price': {
      advice: 'For potato prices, visit local mandis or check AGMARKNET. Consider storage costs and variety differences. Best selling time is typically during harvest season.',
      explanation: 'Potato prices depend on variety, storage quality, and market demand.',
      confidence: 0.8
    },
    'tomato price': {
      advice: 'Tomato prices are highly volatile. Check daily mandi rates, consider transportation costs, and sell when quality is optimal to get best prices.',
      explanation: 'Tomato prices change rapidly due to their perishable nature and seasonal production.',
      confidence: 0.8
    },
    'wheat price': {
      advice: 'Wheat prices are often supported by MSP (Minimum Support Price). Check with FCI procurement centers, local mandis, or private buyers for current rates.',
      explanation: 'Wheat has government price support, making it a relatively stable crop for pricing.',
      confidence: 0.9
    },
    'rice price': {
      advice: 'Rice prices vary by variety (Basmati, non-Basmati). Check MSP rates, mandi prices, and consider quality grades for best returns.',
      explanation: 'Rice pricing depends heavily on variety, quality, and government procurement policies.',
      confidence: 0.9
    },

    // Weather related queries
    'weather': {
      advice: 'Check IMD (India Meteorological Department) forecasts, local weather apps, or contact your nearest Krishi Vigyan Kendra for agricultural weather advisories.',
      explanation: 'Weather information is crucial for farming decisions like planting, irrigation, and harvesting.',
      confidence: 0.7
    },
    'rainfall': {
      advice: 'Monitor rainfall using rain gauges, IMD data, or weather apps. Plan irrigation accordingly and ensure proper drainage during heavy rainfall periods.',
      explanation: 'Rainfall monitoring helps in irrigation planning and crop protection.',
      confidence: 0.8
    },

    // Crop management
    'fertilizer': {
      advice: 'Use fertilizers based on soil test results. Follow recommended NPK ratios for your crop. Apply during appropriate growth stages for maximum effectiveness.',
      explanation: 'Soil testing ensures optimal fertilizer use, reducing costs and environmental impact.',
      confidence: 0.9
    },
    'irrigation': {
      advice: 'Irrigate based on crop stage, soil moisture, and weather conditions. Use efficient methods like drip or sprinkler irrigation to conserve water.',
      explanation: 'Proper irrigation timing and methods improve crop yield and water conservation.',
      confidence: 0.8
    },
    'pest control': {
      advice: 'Use Integrated Pest Management (IPM). Monitor pest levels, use biological controls first, and apply chemicals only when necessary. Consult local agricultural officers.',
      explanation: 'IPM reduces pesticide resistance and environmental impact while maintaining crop protection.',
      confidence: 0.9
    },

    // Government schemes
    'scheme': {
      advice: 'Check PM-KISAN, Pradhan Mantri Fasal Bima Yojana, and state-specific schemes. Visit nearest Common Service Center or agricultural office for applications.',
      explanation: 'Government schemes provide financial support, insurance, and subsidies for farmers.',
      confidence: 0.8
    },
    'subsidy': {
      advice: 'Agricultural subsidies are available for seeds, fertilizers, equipment, and irrigation. Contact your district agriculture office or visit Jan Aushadhi centers.',
      explanation: 'Subsidies help reduce farming costs and promote modern agricultural practices.',
      confidence: 0.8
    },

    // General farming
    'crop': {
      advice: 'Choose crops based on local climate, soil type, water availability, and market demand. Consult agricultural extension officers for crop recommendations.',
      explanation: 'Crop selection is crucial for successful farming and depends on multiple local factors.',
      confidence: 0.7
    },
    'soil': {
      advice: 'Get soil tested every 2-3 years. Test for pH, organic matter, and NPK levels. Use results to plan fertilizer application and soil improvement measures.',
      explanation: 'Soil health is fundamental to crop productivity and sustainable farming.',
      confidence: 0.9
    },

    // Default responses
    'default': {
      advice: 'For specific agricultural guidance, contact your local Krishi Vigyan Kendra, agricultural extension officer, or call the Kisan Call Center at 1800-180-1551.',
      explanation: 'Local experts can provide location-specific and crop-specific advice based on current conditions.',
      confidence: 0.6
    }
  };

  generateResponse(query: string, language: string = 'en'): AIResponse {
    const queryLower = query.toLowerCase();
    
    // Find the best matching knowledge base entry
    let bestMatch = 'default';
    let bestScore = 0;
    
    for (const [key, value] of Object.entries(this.knowledgeBase)) {
      if (key === 'default') continue;
      
      const score = this.calculateRelevanceScore(queryLower, key);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = key;
      }
    }
    
    // Use default if no good match found
    if (bestScore < 0.3) {
      bestMatch = 'default';
    }
    
    const baseResponse = this.knowledgeBase[bestMatch];
    
    // Enhance response with query-specific information
    const enhancedResponse = this.enhanceResponse(baseResponse, query, language);
    
    return enhancedResponse;
  }

  private calculateRelevanceScore(query: string, keyword: string): number {
    let score = 0;
    
    // Exact match gets highest score
    if (query.includes(keyword)) {
      score += 1.0;
    }
    
    // Partial matches get lower scores
    const queryWords = query.split(' ');
    const keywordWords = keyword.split(' ');
    
    for (const queryWord of queryWords) {
      for (const keywordWord of keywordWords) {
        if (queryWord.includes(keywordWord) || keywordWord.includes(queryWord)) {
          score += 0.3;
        }
      }
    }
    
    // Related terms bonus
    const relatedTerms: { [key: string]: string[] } = {
      'price': ['rate', 'cost', 'mandi', 'market', 'selling', 'भाव', 'कीमत', 'दाम'],
      'weather': ['rain', 'temperature', 'climate', 'forecast', 'मौसम', 'बारिश'],
      'fertilizer': ['nutrients', 'manure', 'compost', 'urea', 'phosphate', 'खा���'],
      'pest': ['insect', 'disease', 'fungus', 'spray', 'control', 'कीट'],
      'irrigation': ['water', 'watering', 'drip', 'sprinkler', 'सिंचाई'],
      'scheme': ['yojana', 'government', 'subsidy', 'support', 'योजना']
    };
    
    for (const [mainTerm, related] of Object.entries(relatedTerms)) {
      if (keyword.includes(mainTerm)) {
        for (const relatedTerm of related) {
          if (query.includes(relatedTerm)) {
            score += 0.2;
          }
        }
      }
    }
    
    return Math.min(score, 1.0);
  }

  private enhanceResponse(baseResponse: AIResponse, query: string, language: string): AIResponse {
    const isHindi = language === 'hi' || language.toLowerCase().includes('hindi');
    
    let enhancedAdvice = baseResponse.advice;
    let enhancedExplanation = baseResponse.explanation;
    
    // Add query-specific enhancement
    if (query.toLowerCase().includes('today') || query.toLowerCase().includes('current')) {
      enhancedAdvice = `**Current Status**: ${enhancedAdvice}`;
    }
    
    // Add location-specific note if location mentioned
    const locationMatch = query.match(/(Delhi|Mumbai|Chennai|Kolkata|Bangalore|Hyderabad|Pune|Ahmedabad|Punjab|Haryana|UP|Maharashtra|Gujarat|Karnataka|Tamil Nadu|Andhra Pradesh|West Bengal)/i);
    if (locationMatch) {
      const location = locationMatch[1];
      enhancedAdvice += `\n\n**For ${location}**: Contact local agricultural department for region-specific guidance.`;
    }
    
    // Add seasonal advice if month mentioned
    const currentMonth = new Date().getMonth() + 1;
    const seasonalAdvice = this.getSeasonalAdvice(currentMonth);
    if (seasonalAdvice) {
      enhancedAdvice += `\n\n**Seasonal Note**: ${seasonalAdvice}`;
    }
    
    // Translate basic responses to Hindi if requested
    if (isHindi) {
      enhancedAdvice = this.addHindiGuidance(enhancedAdvice);
    }
    
    return {
      advice: enhancedAdvice,
      explanation: enhancedExplanation,
      confidence: Math.max(baseResponse.confidence - 0.1, 0.5) // Slightly lower confidence for offline
    };
  }

  private getSeasonalAdvice(month: number): string | null {
    if (month >= 6 && month <= 9) {
      return 'Kharif season: Focus on monsoon crops like rice, cotton, sugarcane.';
    } else if (month >= 10 && month <= 3) {
      return 'Rabi season: Good time for wheat, barley, gram, and mustard.';
    } else if (month >= 4 && month <= 5) {
      return 'Zaid season: Consider summer crops like fodder, vegetables with irrigation.';
    }
    return null;
  }

  private addHindiGuidance(advice: string): string {
    return advice + '\n\n**सहायता**: अधिक जानकारी के लिए अपने स्थानीय कृषि कार्यालय या किसान कॉल सेंटर (1800-180-1551) से संपर्क करें।';
  }

  formatStructuredResponse(response: AIResponse, query: string): string {
    return `**🔍 Query:** ${query}

${response.advice}

**💡 Additional Information:**
${response.explanation}

**📞 Support:** For personalized advice, contact Kisan Call Center: 1800-180-1551

_Confidence: ${Math.round(response.confidence * 100)}% (Offline Knowledge Base)_`;
  }
}

export const offlineAIService = new OfflineAIService();
