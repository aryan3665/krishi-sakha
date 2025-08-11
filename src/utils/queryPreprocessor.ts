// Enhanced query preprocessing with agricultural context extraction

import { LocationInfo, CropInfo, QueryContext, INDIAN_STATES, COMMON_CROPS, CROP_TRANSLATIONS } from '../services/dataSources';

export interface ProcessedQuery {
  originalText: string;
  cleanedText: string;
  detectedLanguage: string;
  isValid: boolean;
  error?: string;
  extractedContext: QueryContext;
}

const agricultureTerms = {
  // Common misspellings and corrections
  'fertlizer': 'fertilizer',
  'fertliser': 'fertilizer',
  'pestcide': 'pesticide',
  'irigation': 'irrigation',
  'irigashun': 'irrigation',
  'cropp': 'crop',
  'soyl': 'soil',
  'watr': 'water',
  'pani': 'water',
  'khad': 'fertilizer',
  'keet': 'pest',
  'beej': 'seed',
  'fasal': 'crop'
};

const indianLanguageCodes = ['hin', 'ben', 'tel', 'mar', 'tam', 'guj', 'mal', 'kan', 'ori', 'pan'];

export const preprocessQuery = (query: string): ProcessedQuery => {
  const originalText = query;
  
  // Step 1: Basic text cleaning
  let cleanedText = query
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0E80-\u0EFF.,!?]/g, '') // Keep letters, numbers, spaces, and basic punctuation + Indian scripts
    .replace(/([.!?]){2,}/g, '$1') // Remove excessive punctuation
    .replace(/(.)\1{3,}/g, '$1$1') // Reduce repeated characters (more than 3) to 2
    .toLowerCase();

  // Step 2: Language detection using simple heuristics
  let detectedLanguage = 'eng'; // Default to English
  
  // Simple language detection based on script patterns
  if (/[\u0900-\u097F]/.test(cleanedText)) {
    detectedLanguage = 'hin'; // Hindi/Devanagari
  } else if (/[\u0980-\u09FF]/.test(cleanedText)) {
    detectedLanguage = 'ben'; // Bengali
  } else if (/[\u0A00-\u0A7F]/.test(cleanedText)) {
    detectedLanguage = 'guj'; // Gujarati
  } else if (/[\u0B00-\u0B7F]/.test(cleanedText)) {
    detectedLanguage = 'ori'; // Odia
  } else if (containsHinglishPattern(cleanedText)) {
    detectedLanguage = 'hin-rom'; // Hindi in Roman script
  }

  // Step 3: Handle code-mixed or transliteration
  if (detectedLanguage === 'eng' && /[\u0900-\u097F]/.test(cleanedText)) {
    // Contains Devanagari script but detected as English - likely Hindi
    detectedLanguage = 'hin';
  }

  // Step 4: Basic transliteration for Hinglish (Roman script Hindi)
  if (detectedLanguage === 'eng' && containsHinglishPattern(cleanedText)) {
    try {
      // Attempt to transliterate common Hindi words written in Roman script
      cleanedText = transliterateHinglishWords(cleanedText);
      detectedLanguage = 'hin-rom'; // Hindi in Roman script
    } catch (error) {
      console.warn('Transliteration failed:', error);
    }
  }

  // Step 5: Agriculture-specific spell corrections
  cleanedText = correctAgricultureTerms(cleanedText);

  // Step 6: Validation
  const isValid = cleanedText.length >= 3 && /[a-zA-Z\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]/.test(cleanedText);

  // Step 7: Extract agricultural context
  const extractedContext = extractQueryContext(cleanedText, detectedLanguage);

  return {
    originalText,
    cleanedText,
    detectedLanguage,
    isValid,
    error: !isValid ? 'Please enter a valid farming question (minimum 3 characters with letters)' : undefined,
    extractedContext
  };
};

const containsHinglishPattern = (text: string): boolean => {
  const hinglishPatterns = [
    /\b(kaise|kaisa|kya|kahan|kyun|kab|koi|hai|hain|kar|karne|ke|ki|ka|mein|main|se|pe|par|aur|ya|jo|jab|agar|lekin|phir)\b/i,
    /\b(pani|paani|khad|khaad|keet|kisan|fasal|bijli|barish|mitti|zameen|bagwani|pashu|gaay|bhains)\b/i
  ];
  return hinglishPatterns.some(pattern => pattern.test(text));
};

const transliterateHinglishWords = (text: string): string => {
  const hinglishToHindi = {
    'pani': 'पानी',
    'paani': 'पानी',
    'khad': 'खाद',
    'khaad': 'खाद',
    'keet': 'कीट',
    'kisan': 'किसान',
    'fasal': 'फसल',
    'mitti': 'मिट्टी',
    'zameen': 'ज़मीन',
    'gaay': 'गाय',
    'bhains': 'भैंस',
    'kaise': 'कैसे',
    'kya': 'क्या',
    'hai': 'है',
    'kar': 'कर',
    'ke': 'के',
    'ki': 'की',
    'ka': 'का',
    'mein': 'में',
    'se': 'से'
  };

  let transliterated = text;
  for (const [roman, devanagari] of Object.entries(hinglishToHindi)) {
    const regex = new RegExp(`\\b${roman}\\b`, 'gi');
    transliterated = transliterated.replace(regex, devanagari);
  }
  
  return transliterated;
};

const correctAgricultureTerms = (text: string): string => {
  let corrected = text;
  for (const [misspelled, correct] of Object.entries(agricultureTerms)) {
    const regex = new RegExp(`\\b${misspelled}\\b`, 'gi');
    corrected = corrected.replace(regex, correct);
  }
  return corrected;
};

const extractQueryContext = (text: string, language: string): QueryContext => {
  const context: QueryContext = {
    queryType: [],
    language,
    timestamp: new Date()
  };

  // Extract location information
  context.location = extractLocation(text);

  // Extract crop information
  context.crop = extractCrop(text);

  // Classify query type
  context.queryType = classifyQuery(text);

  return context;
};

const extractLocation = (text: string): LocationInfo | undefined => {
  const words = text.toLowerCase().split(/\s+/);

  // Check for Indian states
  for (const state of INDIAN_STATES) {
    const stateLower = state.toLowerCase();
    if (words.some(word => word.includes(stateLower) || stateLower.includes(word))) {
      return { state, district: 'General' };
    }
  }

  // Check for common district patterns
  const districtPatterns = [
    /in\s+(\w+)\s+district/i,
    /(\w+)\s+district/i,
    /from\s+(\w+)/i
  ];

  for (const pattern of districtPatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        state: 'General',
        district: match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase()
      };
    }
  }

  // Check for pin code patterns
  const pinMatch = text.match(/\b\d{6}\b/);
  if (pinMatch) {
    return {
      state: 'General',
      district: 'General',
      pincode: pinMatch[0]
    };
  }

  return undefined;
};

const extractCrop = (text: string): CropInfo | undefined => {
  const words = text.toLowerCase().split(/\s+/);
  const originalText = text;

  // First check for Hindi crop names
  for (const [hindiName, englishName] of Object.entries(CROP_TRANSLATIONS)) {
    if (text.includes(hindiName) || words.some(word => word.includes(hindiName.toLowerCase()))) {
      return createCropInfo(englishName, originalText);
    }
  }

  // Then check for English crops with better matching
  for (const crop of COMMON_CROPS) {
    const cropLower = crop.toLowerCase();
    const cropWords = cropLower.split(' ');

    // Exact match first
    if (words.includes(cropLower)) {
      return createCropInfo(crop, originalText);
    }

    // Partial match - check if all words of crop name are present
    if (cropWords.length > 1) {
      const allWordsPresent = cropWords.every(cropWord =>
        words.some(word => word.includes(cropWord) || cropWord.includes(word))
      );
      if (allWordsPresent) {
        return createCropInfo(crop, originalText);
      }
    } else {
      // Single word crop - check for partial matches
      if (words.some(word => {
        // Exact match
        if (word === cropLower) return true;
        // Word contains crop name (minimum 3 chars)
        if (cropLower.length >= 3 && word.includes(cropLower)) return true;
        // Crop name contains word (minimum 3 chars)
        if (word.length >= 3 && cropLower.includes(word)) return true;
        return false;
      })) {
        return createCropInfo(crop, originalText);
      }
    }
  }

  return undefined;
};

const createCropInfo = (cropName: string, originalText: string): CropInfo => {
  // Determine season based on crop and current month
  const currentMonth = new Date().getMonth();
  const cropLower = cropName.toLowerCase();
  let season: 'kharif' | 'rabi' | 'zaid' | 'perennial' = 'perennial';

  // Kharif crops (June-October)
  if (['rice', 'maize', 'cotton', 'sugarcane', 'bajra', 'jowar', 'soybean', 'groundnut'].includes(cropLower)) {
    season = currentMonth >= 5 && currentMonth <= 9 ? 'kharif' : 'rabi';
  }
  // Rabi crops (November-April)
  else if (['wheat', 'gram', 'mustard', 'barley', 'pea', 'lentil'].includes(cropLower)) {
    season = 'rabi';
  }
  // Zaid crops (March-June)
  else if (['sunflower', 'cucumber', 'watermelon'].includes(cropLower) && currentMonth >= 2 && currentMonth <= 5) {
    season = 'zaid';
  }
  // Vegetables are generally perennial or seasonal
  else if (['onion', 'potato', 'tomato', 'brinjal', 'okra', 'cabbage', 'cauliflower', 'carrot'].includes(cropLower)) {
    season = 'perennial'; // Most vegetables can be grown year-round with proper care
  }

  // Extract growth stage if mentioned
  const stagePatterns = {
    'sowing': /sow|seed|plant|बुआई|बीज|plantation/i,
    'growing': /grow|growth|विकास|development/i,
    'flowering': /flower|bloom|फूल|flowering/i,
    'harvesting': /harvest|cut|कटाई|reap/i
  };

  let stage: 'sowing' | 'growing' | 'flowering' | 'harvesting' | undefined;
  for (const [stageName, pattern] of Object.entries(stagePatterns)) {
    if (pattern.test(originalText)) {
      stage = stageName as any;
      break;
    }
  }

  return {
    name: cropName,
    season,
    stage
  };
};

const classifyQuery = (text: string): string[] => {
  const queryTypes: string[] = [];

  const patterns = {
    weather: /weather|temperature|rain|humidity|wind|climate|मौसम|बारिश|तापमान/i,
    market: /price|market|sell|buy|mandi|rate|cost|दाम|मार्केट|मंडी|कीमत/i,
    advisory: /advice|recommend|suggest|problem|disease|pest|सलाह|सुझाव|बीमारी|कीट/i,
    soil: /soil|fertility|nutrient|ph|organic|मिट्टी|उर्वरता|पोषक/i,
    fertilizer: /fertilizer|manure|compost|urea|npk|खाद|उर्वरक/i,
    irrigation: /water|irrigation|drip|sprinkler|पानी|सिंचाई/i,
    scheme: /scheme|subsidy|government|yojana|योजना|सब्सिडी|सरकार/i,
    general: /how|what|when|where|कैसे|क्या|कब|कहाँ/i
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      queryTypes.push(type);
    }
  }

  if (queryTypes.length === 0) {
    queryTypes.push('general');
  }

  return queryTypes;
};
