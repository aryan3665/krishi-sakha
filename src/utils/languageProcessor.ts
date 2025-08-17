// Enhanced language processing with translation capabilities
import { getStringTranslation } from './translations';

export interface LanguageProcessingResult {
  originalQuery: string;
  translatedQuery: string;
  detectedLanguage: string;
  confidence: number;
  isTranslationRequired: boolean;
  supportedSTT: boolean;
}

// Enhanced language detection with better accuracy
const LANGUAGE_PATTERNS = {
  'hi': {
    script: /[\u0900-\u097F]/,
    keywords: /\b(कैसे|क्या|कहाँ|कब|क्यों|कि|की|का|के|में|से|पर|और|या|हैं?|है|कर|करने|करना|फसल|खेत|किसान|खाद|पानी|बीज|पौधे?|जमीन|मिट्टी|उर्वरक|कीट|रोग|बारिश|मौसम|सरकार|योजना|मंडी|दाम|कीमत|बाज़ार)\b/g,
    romanized: /\b(kaise|kya|kahan|kab|kyun|fasal|khet|kisan|khad|pani|beej|paudhe?|jameen|mitti|urvarak|keet|rog|barish|mausam|sarkar|yojana|mandi|daam|keemat|bazaar)\b/gi
  },
  'bn': {
    script: /[\u0980-\u09FF]/,
    keywords: /\b(কিভাবে|কি|কোথায়|কখন|কেন|এর|এই|সেই|এবং|বা|আছে|আর|করার|করতে|ফসল|খেত|কিসান|সার|পানি|বীজ|গাছ|জমি|মাটি|সার|পোকা|রোগ|বৃষ্টি|আবহাওয়া|সরকার|প্রকল্প|বাজার|দাম|মূল্য)\b/g
  },
  'ta': {
    script: /[\u0B80-\u0BFF]/,
    keywords: /\b(எப்படி|என்ன|எங்கே|எப்போது|ஏன்|இன்|இந்த|அந்த|மற்றும்|அல்லது|உள்ளது|செய்ய|செய்வது|பயிர்|வயல்|விவசாயி|உரம்|தண்ணீர்|விதை|செடி|நிலம்|மண்|உரம்|பூச்சி|நோய்|மழை|வானிலை|அரசு|திட்டம்|சந்தை|விலை)\b/g
  },
  'te': {
    script: /[\u0C00-\u0C7F]/,
    keywords: /\b(ఎలా|ఏమి|ఎక్కడ|ఎప్పుడు|ఎందుకు|యొక్క|ఈ|ఆ|మరియు|లేదా|ఉంది|చేయడం|చేయటానికి|పంట|పొలం|���ైతు|ఎరువు|నీరు|విత్తనం|మొక్క|భూమి|మట్టి|ఎరువు|కీటకం|వ్యాధి|వర్షం|వాతావరణం|ప్రభుత్వం|పథకం|మార్కెట్|ధర|విలువ)\b/g
  },
  'mr': {
    script: /[\u0900-\u097F]/,
    keywords: /\b(कसे|काय|कुठे|केव्हा|का|चे|या|हा|आणि|किंवा|आहे|करणे|करायचे|पीक|शेत|शेतकरी|खत|पाणी|बियाणे|झाड|जमीन|माती|खत|कीटक|रोग|पाऊस|हवामान|सरकार|योजना|बाजार|दर|किंमत)\b/g
  },
  'gu': {
    script: /[\u0A80-\u0AFF]/,
    keywords: /\b(કેવી રીતે|શું|ક્યાં|ક્યારે|શા માટે|ના|આ|તે|અને|અથવા|છે|કરવું|કરવા માટે|પાક|ખેત|ખેડૂત|ખાતર|પાણી|બીજ|છોડ|જમીન|માટી|ખાતર|જીવાત|રોગ|વરસાદ|હવામાન|સરકાર|યોજના|બજાર|ભાવ|કિંમત)\b/g
  },
  'pa': {
    script: /[\u0A00-\u0A7F]/,
    keywords: /\b(ਕਿਵੇਂ|ਕੀ|ਕਿੱਥੇ|ਕਦੋਂ|ਕਿਉਂ|ਦਾ|ਇਹ|ਉਹ|ਅਤੇ|ਜਾਂ|ਹੈ|ਕਰਨਾ|ਕਰਨ ਲਈ|ਫਸਲ|ਖੇਤ|ਕਿਸਾਨ|ਖਾਦ|ਪਾਣੀ|ਬੀਜ|ਪੌਧਾ|ਜ਼ਮੀਨ|ਮਿੱਟੀ|ਖਾਦ|ਕੀੜਾ|ਰੋਗ|ਬਾਰਿਸ਼|ਮੌਸਮ|ਸਰਕਾਰ|ਯੋਜਨਾ|ਮੰਡੀ|ਰੇਟ|ਕੀਮਤ)\b/g
  },
  'en': {
    script: /^[a-zA-Z0-9\s.,!?'-]+$/,
    keywords: /\b(how|what|where|when|why|the|this|that|and|or|is|are|do|doing|crop|farm|farmer|fertilizer|water|seed|plant|land|soil|pest|disease|rain|weather|government|scheme|market|price|cost)\b/gi
  }
};

// Simple translation mappings for common agricultural terms
const TRANSLATION_MAPPINGS = {
  // Hindi to English
  'hi': {
    'कैसे': 'how',
    'क्या': 'what', 
    'कहाँ': 'where',
    'कब': 'when',
    'क्यों': 'why',
    'फसल': 'crop',
    'खेत': 'farm',
    'किसान': 'farmer',
    'खाद': 'fertilizer',
    'पानी': 'water',
    'बीज': 'seed',
    'पौधे': 'plant',
    'जमीन': 'land',
    'मिट्टी': 'soil',
    'उर्वरक': 'fertilizer',
    'कीट': 'pest',
    'रोग': 'disease',
    'बारिश': 'rain',
    '��ौसम': 'weather',
    'सरकार': 'government',
    'योजना': 'scheme',
    'मंडी': 'market',
    'दाम': 'price',
    'कीमत': 'price',
    'बाज़ार': 'market',
    'गेहूं': 'wheat',
    'चावल': 'rice',
    'कपास': 'cotton',
    'मक्का': 'maize',
    'आलू': 'potato',
    'प्याज': 'onion',
    'टमाटर': 'tomato'
  },
  // Bengali to English
  'bn': {
    'কিভাবে': 'how',
    'কি': 'what',
    'কোথায়': 'where', 
    'কখন': 'when',
    'কেন': 'why',
    'ফসল': 'crop',
    'খেত': 'farm',
    'কিসান': 'farmer',
    'সার': 'fertilizer',
    'পানি': 'water',
    'বীজ': 'seed',
    'গাছ': 'plant',
    'জমি': 'land',
    'মাটি': 'soil',
    'পোকা': 'pest',
    'রোগ': 'disease',
    'বৃষ্টি': 'rain',
    'আবহাওয়া': 'weather',
    'সরকার': 'government',
    'প্রকল্প': 'scheme',
    'বাজার': 'market',
    'দাম': 'price',
    'গম': 'wheat',
    'ধান': 'rice',
    'তুলা': 'cotton'
  },
  // Add more languages as needed
  'ta': {
    'எப்படி': 'how',
    'என்ன': 'what',
    'எங்கே': 'where',
    'எப்போது': 'when',
    'ஏன்': 'why',
    'பயிர்': 'crop',
    'வயல்': 'farm',
    'விவசாயி': 'farmer',
    'உரம்': 'fertilizer',
    'தண்ணீர்': 'water',
    'விதை': 'seed',
    'செடி': 'plant',
    'நிலம்': 'land',
    'மண்': 'soil',
    'கோதுமை': 'wheat',
    'அரிசி': 'rice',
    'பருத்தி': 'cotton'
  }
};

export const detectLanguage = (text: string): { language: string; confidence: number; supportedSTT: boolean } => {
  const cleanText = text.trim().toLowerCase();
  const results: { language: string; score: number }[] = [];

  // Check each language pattern
  for (const [langCode, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    let score = 0;
    
    // Script detection (strong indicator)
    if (patterns.script.test(text)) {
      score += 40;
    }
    
    // Keyword matching
    const keywordMatches = (text.match(patterns.keywords) || []).length;
    score += keywordMatches * 5;
    
    // Romanized keywords for Hindi
    if (langCode === 'hi' && patterns.romanized) {
      const romanizedMatches = (text.match(patterns.romanized) || []).length;
      score += romanizedMatches * 3;
    }
    
    results.push({ language: langCode, score });
  }

  // Sort by score and get the best match
  results.sort((a, b) => b.score - a.score);
  const bestMatch = results[0];
  
  // Default to English if no clear match
  const detectedLanguage = bestMatch.score > 5 ? bestMatch.language : 'en';
  const confidence = Math.min(bestMatch.score / 50, 1.0); // Normalize to 0-1
  
  // Languages with good STT support
  const supportedSTTLanguages = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'pa'];
  const supportedSTT = supportedSTTLanguages.includes(detectedLanguage);

  return {
    language: detectedLanguage,
    confidence,
    supportedSTT
  };
};

export const translateToEnglish = (text: string, sourceLanguage: string): string => {
  // If already English, return as is
  if (sourceLanguage === 'en') {
    return text;
  }

  // Get translation mappings for the source language
  const mappings = TRANSLATION_MAPPINGS[sourceLanguage as keyof typeof TRANSLATION_MAPPINGS];
  if (!mappings) {
    return text; // Return original if no mappings available
  }

  let translatedText = text;
  
  // Replace words using the mapping
  for (const [sourceWord, englishWord] of Object.entries(mappings)) {
    const regex = new RegExp(`\\b${sourceWord}\\b`, 'gi');
    translatedText = translatedText.replace(regex, englishWord);
  }

  return translatedText;
};

export const processLanguageQuery = (query: string): LanguageProcessingResult => {
  const originalQuery = query.trim();
  
  // Detect language
  const { language, confidence, supportedSTT } = detectLanguage(originalQuery);
  
  // Translate to English if needed
  const translatedQuery = translateToEnglish(originalQuery, language);
  const isTranslationRequired = language !== 'en';

  return {
    originalQuery,
    translatedQuery,
    detectedLanguage: language,
    confidence,
    isTranslationRequired,
    supportedSTT
  };
};

// Voice Recognition with multilingual support
export const startVoiceRecognition = (
  language: string,
  onResult: (text: string) => void,
  onError: (error: string) => void,
  onEnd: () => void
): SpeechRecognition | null => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    onError('Speech recognition not supported in this browser');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  // Map our language codes to browser language codes
  const browserLanguageCodes = {
    'en': 'en-IN',  // English (India)
    'hi': 'hi-IN',  // Hindi
    'bn': 'bn-IN',  // Bengali
    'ta': 'ta-IN',  // Tamil
    'te': 'te-IN',  // Telugu
    'mr': 'mr-IN',  // Marathi
    'gu': 'gu-IN',  // Gujarati
    'pa': 'pa-IN'   // Punjabi
  };

  recognition.lang = browserLanguageCodes[language as keyof typeof browserLanguageCodes] || 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event) => {
    let errorMessage = 'Voice recognition failed';
    
    switch (event.error) {
      case 'network':
        errorMessage = 'Network error. Check your internet connection.';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone access denied. Please allow microphone permissions.';
        break;
      case 'no-speech':
        errorMessage = 'No speech detected. Please try speaking again.';
        break;
      case 'audio-capture':
        errorMessage = 'No microphone found. Please check your audio setup.';
        break;
      case 'service-not-allowed':
        errorMessage = 'Speech recognition service not available.';
        break;
      default:
        errorMessage = `Voice recognition error: ${event.error}`;
    }
    
    onError(errorMessage);
  };

  recognition.onend = onEnd;

  try {
    recognition.start();
    return recognition;
  } catch (error) {
    onError('Failed to start voice recognition');
    return null;
  }
};

// Enhanced STT error handling
export const getSTTErrorMessage = (language: string, error: string): string => {
  const messages = {
    'network': {
      'hi': '🙏 नेटवर्क की समस्या है। कृपया अपना इंटरनेट कनेक्शन जांचें।',
      'bn': '🙏 নেটওয়ার্ক সমস্যা। দয়া করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।',
      'en': '🙏 Network issue. Please check your internet connection.'
    },
    'not-allowed': {
      'hi': '🙏 माइक्रोफोन की अनुमति चाहिए। कृपया माइक्रोफोन का उपयोग करने दें।',
      'bn': '🙏 মাইক্রোফোন অনুমতি প্রয়োজন। দয়া করে মাইক্রোফোন ব্যবহারের অনুমতি দিন।',
      'en': '🙏 Microphone permission needed. Please allow microphone access.'
    },
    'no-speech': {
      'hi': '🙏 आपकी आवाज़ सुनाई नहीं दी। कृপया फिर से बोलने की कोशिश करें।',
      'bn': '🙏 আপনার কণ্ঠস্বর শোনা যায়নি। দয়া করে আবার বলার চেষ্টা করুন।',
      'en': '🙏 Sorry, I couldn\'t understand your voice input. Please try again or type your query.'
    },
    'general': {
      'hi': '🙏 आवाज़ पहचानने में समस्या हुई। कृपया दोबारा कोशिश करें या टाइप करें।',
      'bn': '🙏 কণ্ঠস্বর চিনতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন বা টাইপ করুন।',
      'en': '🙏 Sorry, I couldn\'t understand your voice input. Please try again or type your query.'
    }
  };

  const errorType = error.includes('network') ? 'network' :
                   error.includes('not-allowed') ? 'not-allowed' :
                   error.includes('no-speech') ? 'no-speech' : 'general';

  const messageMap = messages[errorType as keyof typeof messages];
  return messageMap[language as keyof typeof messageMap] || messageMap.en;
};

// Declare global types for browser APIs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
