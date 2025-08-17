export interface DemoQuestion {
  patterns: string[];
  answer: string;
  language: 'en' | 'hi';
  category: 'weather' | 'market' | 'farming' | 'government';
  confidence: number;
}

export const DEMO_QUESTIONS: DemoQuestion[] = [
  // English Questions
  {
    patterns: [
      'what is the weather forecast for pune tomorrow',
      'weather forecast pune tomorrow',
      'pune weather tomorrow',
      'tomorrow weather pune',
      'pune tomorrow weather forecast'
    ],
    answer: 'Tomorrow in Pune: Partly cloudy, max 31°C, min 24°C, with a 40% chance of light rain.',
    language: 'en',
    category: 'weather',
    confidence: 0.95
  },
  {
    patterns: [
      'what is today\'s wholesale price of potatoes in delhi mandi',
      'wholesale price potatoes delhi mandi',
      'potato price delhi mandi today',
      'delhi mandi potato price',
      'potatoes price delhi wholesale'
    ],
    answer: 'The average wholesale price of potatoes in Delhi\'s Azadpur mandi is around ₹18–22 per kg.',
    language: 'en',
    category: 'market',
    confidence: 0.95
  },

  // Additional practical farming question
  {
    patterns: [
      'when should i plant tomatoes',
      'best time to plant tomatoes',
      'tomato planting season',
      'tomato cultivation timing',
      'when to sow tomato seeds'
    ],
    answer: 'The best time to plant tomatoes is during the rabi season (October-November) or summer season (January-February), depending on your region. Ensure soil temperature is above 15°C for optimal germination.',
    language: 'en',
    category: 'farming',
    confidence: 0.95
  },

  // Hindi Questions
  {
    patterns: [
      'धान की अच्छी पैदावार के लिए कौन-सी खाद डालनी चाहिए',
      'धान के लिए कौन सी खाद डालें',
      'धान की खाद कौन सी डालनी चाहिए',
      'धान में कौन सी खाद डालें',
      'धान की पैदावार के लिए खाद'
    ],
    answer: 'धान के लिए यूरिया, डीएपी और पोटाश का संतुलित प्रयोग करें। साथ ही, गोबर की खाद या कम्पोस्ट डालना मिट्टी की उर्वरता बढ़ाता है।',
    language: 'hi',
    category: 'farming',
    confidence: 0.95
  },
  {
    patterns: [
      'प्रधानमंत्री किसान सम्मान निधि योजना का लाभ कैसे लिया जा सकता है',
      'किसान सम्मान निधि योजना कैसे लें',
      'पीएम किसान योजना का लाभ कैसे लें',
      'प्रधानमंत्री किसान योजना कैसे मिलेगी',
      'किसान सम्मान निधि कैसे मिलेगी'
    ],
    answer: 'किसान भाई pmkisan.gov.in वेबसाइट या नजदीकी CSC केंद्र पर जाकर आधार और बैंक खाता विवरण दर्ज करके योजना का लाभ ले सकते हैं।',
    language: 'hi',
    category: 'government',
    confidence: 0.95
  }
];

export class DemoQuestionHandler {
  /**
   * Normalizes text for better matching
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,?!;:]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/'/g, '') // Remove apostrophes
      .replace(/[०-९]/g, (match) => String.fromCharCode(match.charCodeAt(0) - '०'.charCodeAt(0) + '0'.charCodeAt(0))); // Convert Devanagari numbers to ASCII
  }

  /**
   * Calculates similarity score between two strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const normalized1 = this.normalizeText(str1);
    const normalized2 = this.normalizeText(str2);

    // Exact match
    if (normalized1 === normalized2) {
      return 1.0;
    }

    // Check if one contains the other
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return 0.9;
    }

    // Word-based similarity
    const words1 = normalized1.split(' ');
    const words2 = normalized2.split(' ');
    
    const commonWords = words1.filter(word => 
      words2.some(w2 => w2.includes(word) || word.includes(w2))
    );

    const similarity = (commonWords.length * 2) / (words1.length + words2.length);
    
    // Boost similarity for key terms
    const keyTerms = ['weather', 'price', 'mandi', 'धान', 'खाद', 'योजना', 'कि���ान'];
    const hasKeyTerms = keyTerms.some(term => 
      normalized1.includes(term) && normalized2.includes(term)
    );
    
    return hasKeyTerms ? Math.min(1.0, similarity + 0.1) : similarity;
  }

  /**
   * Finds the best matching demo question for a given query
   */
  public findMatchingQuestion(query: string): { question: DemoQuestion; similarity: number } | null {
    let bestMatch: { question: DemoQuestion; similarity: number } | null = null;

    for (const demoQuestion of DEMO_QUESTIONS) {
      for (const pattern of demoQuestion.patterns) {
        const similarity = this.calculateSimilarity(query, pattern);
        
        if (similarity >= 0.7 && (!bestMatch || similarity > bestMatch.similarity)) {
          bestMatch = { question: demoQuestion, similarity };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Gets a demo response for a query if it matches any predefined questions
   */
  public getDemoResponse(query: string): {
    answer: string;
    confidence: number;
    category: string;
    language: string;
    isDemo: true;
  } | null {
    const match = this.findMatchingQuestion(query);
    
    if (!match || match.similarity < 0.7) {
      return null;
    }

    return {
      answer: match.question.answer,
      confidence: match.question.confidence * match.similarity,
      category: match.question.category,
      language: match.question.language,
      isDemo: true
    };
  }

  /**
   * Gets all available demo questions for display
   */
  public getAllDemoQuestions(): DemoQuestion[] {
    return DEMO_QUESTIONS;
  }

  /**
   * Gets demo questions by language
   */
  public getDemoQuestionsByLanguage(language: 'en' | 'hi'): DemoQuestion[] {
    return DEMO_QUESTIONS.filter(q => q.language === language);
  }

  /**
   * Gets demo questions by category
   */
  public getDemoQuestionsByCategory(category: string): DemoQuestion[] {
    return DEMO_QUESTIONS.filter(q => q.category === category);
  }
}

// Export singleton instance
export const demoQuestionHandler = new DemoQuestionHandler();
