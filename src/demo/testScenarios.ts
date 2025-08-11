export interface TestScenario {
  id: string;
  title: string;
  description: string;
  query: string;
  language: string;
  expectedDataSources: string[];
  expectedTopics: string[];
  difficulty: 'simple' | 'medium' | 'complex';
  category: 'weather' | 'market' | 'advisory' | 'soil' | 'scheme' | 'multi-domain';
}

export const DEMO_SCENARIOS: TestScenario[] = [
  // Simple Weather Queries
  {
    id: 'weather_en_1',
    title: 'Basic Weather Query (English)',
    description: 'Simple weather inquiry to test basic data retrieval',
    query: 'What is the weather forecast for farming in Punjab this week?',
    language: 'en',
    expectedDataSources: ['weather'],
    expectedTopics: ['weather', 'forecast'],
    difficulty: 'simple',
    category: 'weather'
  },
  {
    id: 'weather_hi_1',
    title: 'Weather Query (Hindi)',
    description: 'Hindi language weather query to test language processing',
    query: 'इस सप्���ाह खेती के लिए मौसम कैसा रहेगा?',
    language: 'hi',
    expectedDataSources: ['weather'],
    expectedTopics: ['weather'],
    difficulty: 'simple',
    category: 'weather'
  },

  // Market Price Queries
  {
    id: 'market_en_1',
    title: 'Market Price Query (English)',
    description: 'Basic market price inquiry',
    query: 'What are the current wheat prices in Haryana mandis?',
    language: 'en',
    expectedDataSources: ['market'],
    expectedTopics: ['market', 'price'],
    difficulty: 'simple',
    category: 'market'
  },
  {
    id: 'market_hi_1',
    title: 'Market Price Query (Hindi)',
    description: 'Hindi market price query with location',
    query: 'उत्तर प्रदेश में धान के दाम क्या चल रहे हैं?',
    language: 'hi',
    expectedDataSources: ['market'],
    expectedTopics: ['market', 'price'],
    difficulty: 'simple',
    category: 'market'
  },

  // Agricultural Advisory
  {
    id: 'advisory_en_1',
    title: 'Crop Advisory (English)',
    description: 'General farming advice request',
    query: 'What should I do to protect my cotton crop from pests in Gujarat?',
    language: 'en',
    expectedDataSources: ['advisory', 'weather'],
    expectedTopics: ['advisory', 'pest'],
    difficulty: 'medium',
    category: 'advisory'
  },
  {
    id: 'advisory_hi_1',
    title: 'Crop Advisory (Hindi)',
    description: 'Hindi farming advice with specific crop',
    query: 'टमाटर की फसल में पत्ती मुरझाने की समस्या का समाधान क्या है?',
    language: 'hi',
    expectedDataSources: ['advisory'],
    expectedTopics: ['advisory', 'disease'],
    difficulty: 'medium',
    category: 'advisory'
  },

  // Soil and Fertilizer
  {
    id: 'soil_en_1',
    title: 'Soil Health Query (English)',
    description: 'Soil testing and fertilizer recommendation',
    query: 'What fertilizer should I use for rice cultivation in West Bengal based on soil conditions?',
    language: 'en',
    expectedDataSources: ['soil', 'advisory'],
    expectedTopics: ['soil', 'fertilizer'],
    difficulty: 'medium',
    category: 'soil'
  },

  // Government Schemes
  {
    id: 'scheme_en_1',
    title: 'Government Scheme Query (English)',
    description: 'Information about agricultural schemes',
    query: 'What government schemes are available for small farmers in Rajasthan?',
    language: 'en',
    expectedDataSources: ['scheme'],
    expectedTopics: ['scheme', 'subsidy'],
    difficulty: 'medium',
    category: 'scheme'
  },
  {
    id: 'scheme_hi_1',
    title: 'Government Scheme Query (Hindi)',
    description: 'Hindi query about PM-KISAN scheme',
    query: 'पीएम किसान योजना का लाभ कैसे उठाएं?',
    language: 'hi',
    expectedDataSources: ['scheme'],
    expectedTopics: ['scheme'],
    difficulty: 'medium',
    category: 'scheme'
  },

  // Multi-domain Complex Queries
  {
    id: 'multi_en_1',
    title: 'Multi-domain Query (English)',
    description: 'Complex query requiring multiple data sources',
    query: 'Given the current weather and market prices, should I harvest my wheat crop in Punjab now or wait for better conditions?',
    language: 'en',
    expectedDataSources: ['weather', 'market', 'advisory'],
    expectedTopics: ['weather', 'market', 'advisory'],
    difficulty: 'complex',
    category: 'multi-domain'
  },
  {
    id: 'multi_en_2',
    title: 'Investment Decision (English)',
    description: 'Complex investment and planning query',
    query: 'I have 5 acres in Maharashtra. Considering soil health, weather patterns, and market trends, what crops should I plant this kharif season?',
    language: 'en',
    expectedDataSources: ['soil', 'weather', 'market', 'advisory'],
    expectedTopics: ['soil', 'weather', 'market', 'advisory'],
    difficulty: 'complex',
    category: 'multi-domain'
  },
  {
    id: 'multi_hi_1',
    title: 'Multi-domain Query (Hindi)',
    description: 'Complex Hindi query with multiple aspects',
    query: 'मध्य प्रदेश में सोयाबीन की खेती के लिए मौसम, मिट्टी की जांच और बाजार भाव देखकर सुझाव दें।',
    language: 'hi',
    expectedDataSources: ['weather', 'soil', 'market', 'advisory'],
    expectedTopics: ['weather', 'soil', 'market', 'advisory'],
    difficulty: 'complex',
    category: 'multi-domain'
  },

  // Missing Data Handling Scenarios
  {
    id: 'missing_en_1',
    title: 'Unavailable Vegetable Prices (English)',
    description: 'Test transparent missing data handling for vegetables',
    query: 'Show me potato prices in Punjab',
    language: 'en',
    expectedDataSources: ['market'],
    expectedTopics: ['market', 'price'],
    difficulty: 'simple',
    category: 'market'
  },
  {
    id: 'missing_en_2',
    title: 'Specialty Crop Query (English)',
    description: 'Test handling of uncommon crop price requests',
    query: 'What are lettuce farming rates in Kerala?',
    language: 'en',
    expectedDataSources: ['market'],
    expectedTopics: ['market', 'price'],
    difficulty: 'simple',
    category: 'market'
  },
  {
    id: 'missing_hi_1',
    title: 'Unavailable Crop Data (Hindi)',
    description: 'Test Hindi missing data transparency',
    query: 'महाराष्ट्र में टमाटर के भाव क्या हैं?',
    language: 'hi',
    expectedDataSources: ['market'],
    expectedTopics: ['market', 'price'],
    difficulty: 'simple',
    category: 'market'
  },
  {
    id: 'missing_en_3',
    title: 'Insufficient Context Query (English)',
    description: 'Test suggested questions for vague queries',
    query: 'Tell me about farming',
    language: 'en',
    expectedDataSources: [],
    expectedTopics: ['general'],
    difficulty: 'simple',
    category: 'advisory'
  },
  {
    id: 'missing_hi_2',
    title: 'General Help Request (Hindi)',
    description: 'Test Hindi suggested questions generation',
    query: 'मुझे खेती की मदद चाहिए',
    language: 'hi',
    expectedDataSources: [],
    expectedTopics: ['general'],
    difficulty: 'simple',
    category: 'advisory'
  },

  // Edge Cases and Challenging Queries
  {
    id: 'edge_en_1',
    title: 'Vague Query (English)',
    description: 'Test handling of ambiguous queries',
    query: 'My crops are not doing well. What should I do?',
    language: 'en',
    expectedDataSources: ['advisory'],
    expectedTopics: ['advisory', 'general'],
    difficulty: 'medium',
    category: 'advisory'
  },
  {
    id: 'edge_en_2',
    title: 'Location-less Query (English)',
    description: 'Query without specific location information',
    query: 'What is the best time to plant maize?',
    language: 'en',
    expectedDataSources: ['advisory'],
    expectedTopics: ['advisory'],
    difficulty: 'simple',
    category: 'advisory'
  },
  {
    id: 'edge_hi_1',
    title: 'Hinglish Query',
    description: 'Mixed Hindi-English query',
    query: 'Meri wheat crop mein fungal attack ho gaya hai, kya treatment karu?',
    language: 'hi',
    expectedDataSources: ['advisory'],
    expectedTopics: ['advisory', 'disease'],
    difficulty: 'medium',
    category: 'advisory'
  },

  // Seasonal and Time-sensitive Queries
  {
    id: 'seasonal_en_1',
    title: 'Seasonal Planning (English)',
    description: 'Query about seasonal crop planning',
    query: 'What crops should I prepare for the upcoming rabi season in Bihar?',
    language: 'en',
    expectedDataSources: ['advisory', 'weather', 'market'],
    expectedTopics: ['advisory', 'seasonal'],
    difficulty: 'medium',
    category: 'advisory'
  },
  {
    id: 'seasonal_hi_1',
    title: 'Seasonal Advisory (Hindi)',
    description: 'Hindi seasonal farming advice',
    query: 'खरीफ सीजन की तैयारी के लिए क्या करना चाहिए?',
    language: 'hi',
    expectedDataSources: ['advisory', 'weather'],
    expectedTopics: ['advisory', 'seasonal'],
    difficulty: 'medium',
    category: 'advisory'
  }
];

export const getScenariosByCategory = (category: string): TestScenario[] => {
  return DEMO_SCENARIOS.filter(scenario => scenario.category === category);
};

export const getScenariosByLanguage = (language: string): TestScenario[] => {
  return DEMO_SCENARIOS.filter(scenario => scenario.language === language);
};

export const getScenariosByDifficulty = (difficulty: string): TestScenario[] => {
  return DEMO_SCENARIOS.filter(scenario => scenario.difficulty === difficulty);
};

export const DEMO_METRICS = {
  totalScenarios: DEMO_SCENARIOS.length,
  byCategory: {
    weather: getScenariosByCategory('weather').length,
    market: getScenariosByCategory('market').length,
    advisory: getScenariosByCategory('advisory').length,
    soil: getScenariosByCategory('soil').length,
    scheme: getScenariosByCategory('scheme').length,
    'multi-domain': getScenariosByCategory('multi-domain').length
  },
  byLanguage: {
    english: getScenariosByLanguage('en').length,
    hindi: getScenariosByLanguage('hi').length
  },
  byDifficulty: {
    simple: getScenariosByDifficulty('simple').length,
    medium: getScenariosByDifficulty('medium').length,
    complex: getScenariosByDifficulty('complex').length
  }
};
