// Enhanced query preprocessing with agricultural context extraction

import { LocationInfo, CropInfo, QueryContext, INDIAN_STATES, COMMON_CROPS } from '../services/dataSources';

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

  return {
    originalText,
    cleanedText,
    detectedLanguage,
    isValid,
    error: !isValid ? 'Please enter a valid farming question (minimum 3 characters with letters)' : undefined
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
