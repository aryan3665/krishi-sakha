// Standardized output presentation with emoji formatting
import { getStringTranslation } from './translations';

export interface FormattedResponse {
  formattedText: string;
  sections: ResponseSection[];
  confidence: number;
  factualBasis: 'high' | 'medium' | 'low';
  metadata: ResponseMetadata;
}

export interface ResponseSection {
  type: 'header' | 'recommendations' | 'details' | 'precautions' | 'support' | 'disclaimer';
  title: string;
  content: string[];
  emoji: string;
}

export interface ResponseMetadata {
  originalQuery: string;
  detectedLanguage: string;
  processingTime?: number;
  sources: string[];
  timestamp: string;
  geminiValidated: boolean;
}

const SECTION_EMOJIS = {
  header: '🌾',
  recommendations: '💡',
  details: '📊',
  precautions: '⚠️',
  support: '📞',
  weather: '🌤️',
  market: '💰',
  pest: '🛡️',
  irrigation: '💧',
  fertilizer: '🌱',
  general: '🌾',
  disclaimer: 'ℹ️'
};

const TOPIC_KEYWORDS = {
  weather: ['weather', 'rain', 'temperature', 'climate', 'मौसम', 'बारिश', 'तापमान'],
  market: ['price', 'market', 'sell', 'buy', 'cost', 'दाम', 'कीमत', 'बाज़ार', 'मंडी'],
  pest: ['pest', 'disease', 'insect', 'bug', 'कीट', 'रोग', 'बीमारी'],
  irrigation: ['water', 'irrigation', 'drip', 'sprinkler', 'पानी', 'सिंचाई'],
  fertilizer: ['fertilizer', 'manure', 'compost', 'nutrient', 'खाद', 'उर्वरक'],
  soil: ['soil', 'land', 'fertility', 'मिट्टी', 'जमीन', 'उर्वरता']
};

export const formatStandardResponse = (
  response: string,
  metadata: ResponseMetadata,
  language: string = 'en'
): FormattedResponse => {
  
  // Detect topic for appropriate emoji and formatting
  const topic = detectTopic(metadata.originalQuery);
  
  // Parse existing structured response or create structure
  const sections = parseOrCreateSections(response, topic, language);
  
  // Generate final formatted text
  const formattedText = generateFormattedText(sections, metadata, language);
  
  return {
    formattedText,
    sections,
    confidence: calculateDisplayConfidence(metadata),
    factualBasis: metadata.sources.length > 0 ? 'high' : 'medium',
    metadata
  };
};

function detectTopic(query: string): string {
  const queryLower = query.toLowerCase();
  
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(keyword => queryLower.includes(keyword))) {
      return topic;
    }
  }
  
  return 'general';
}

function parseOrCreateSections(response: string, topic: string, language: string): ResponseSection[] {
  const sections: ResponseSection[] = [];
  
  // Check if response is already structured
  if (response.includes('💡') || response.includes('📊') || response.includes('⚠️')) {
    return parseExistingStructure(response);
  }
  
  // Create structure for unstructured response
  return createStandardStructure(response, topic, language);
}

function parseExistingStructure(response: string): ResponseSection[] {
  const sections: ResponseSection[] = [];
  const lines = response.split('\n').filter(line => line.trim());
  
  let currentSection: ResponseSection | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for section headers with emojis
    if (trimmedLine.match(/^[🌾💡📊⚠️📞🌤️💰🛡️💧🌱ℹ️]\s*\*\*.*\*\*/)) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Start new section
      const emoji = trimmedLine.charAt(0);
      const title = trimmedLine.replace(/^[🌾💡📊⚠️📞🌤️💰🛡️💧🌱ℹ️]\s*\*\*/, '').replace(/\*\*.*/, '');
      const type = getSectionType(emoji);
      
      currentSection = {
        type,
        title: title.trim(),
        content: [],
        emoji
      };
    } else if (currentSection && trimmedLine) {
      // Add content to current section
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        currentSection.content.push(trimmedLine.substring(1).trim());
      } else if (!trimmedLine.includes('**')) {
        currentSection.content.push(trimmedLine);
      }
    }
  }
  
  // Add final section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

function getSectionType(emoji: string): ResponseSection['type'] {
  const emojiMap: { [key: string]: ResponseSection['type'] } = {
    '🌾': 'header',
    '💡': 'recommendations',
    '📊': 'details',
    '⚠️': 'precautions',
    '📞': 'support',
    'ℹ️': 'disclaimer'
  };
  
  return emojiMap[emoji] || 'recommendations';
}

function createStandardStructure(response: string, topic: string, language: string): ResponseSection[] {
  const sections: ResponseSection[] = [];
  
  // Extract key points from unstructured response
  const sentences = response.split(/[.।!?]+/).filter(s => s.trim().length > 10);
  const recommendations: string[] = [];
  const details: string[] = [];
  const precautions: string[] = [];
  
  // Categorize sentences
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.includes('should') || trimmed.includes('recommended') || trimmed.includes('चाहिए') || trimmed.includes('करें')) {
      recommendations.push(trimmed);
    } else if (trimmed.includes('avoid') || trimmed.includes('don\'t') || trimmed.includes('नहीं') || trimmed.includes('बचें')) {
      precautions.push(trimmed);
    } else if (trimmed.length > 20) {
      details.push(trimmed);
    }
  }
  
  // Create header section
  const topicEmoji = SECTION_EMOJIS[topic as keyof typeof SECTION_EMOJIS] || SECTION_EMOJIS.general;
  const topicTitle = getTopicTitle(topic, language);
  
  sections.push({
    type: 'header',
    title: `${topicTitle} Advisory`,
    content: [],
    emoji: topicEmoji
  });
  
  // Add recommendations section
  if (recommendations.length > 0) {
    sections.push({
      type: 'recommendations',
      title: getStringTranslation(language, 'keyRecommendations') || 'Key Recommendations',
      content: recommendations,
      emoji: '💡'
    });
  }
  
  // Add details section
  if (details.length > 0) {
    sections.push({
      type: 'details',
      title: getStringTranslation(language, 'importantDetails') || 'Important Details',
      content: details,
      emoji: '📊'
    });
  }
  
  // Add precautions section
  if (precautions.length > 0) {
    sections.push({
      type: 'precautions',
      title: getStringTranslation(language, 'precautions') || 'Precautions',
      content: precautions,
      emoji: '⚠️'
    });
  }
  
  // Always add support section
  sections.push({
    type: 'support',
    title: getStringTranslation(language, 'additionalSupport') || 'Additional Support',
    content: [
      'Kisan Call Center: 1800-180-1551',
      'Local Krishi Vigyan Kendra',
      'Agricultural Extension Officer'
    ],
    emoji: '📞'
  });
  
  return sections;
}

function getTopicTitle(topic: string, language: string): string {
  const titles: { [key: string]: { [lang: string]: string } } = {
    weather: {
      en: 'Weather',
      hi: 'मौसम',
      bn: 'আবহাওয়া'
    },
    market: {
      en: 'Market Price',
      hi: 'बाज़ार दाम',
      bn: 'বাজারের দাম'
    },
    pest: {
      en: 'Pest Control',
      hi: 'कीट नियंत्रण',
      bn: 'পোকা নিয়ন্ত্রণ'
    },
    irrigation: {
      en: 'Irrigation',
      hi: 'सिंचाई',
      bn: 'সেচ'
    },
    fertilizer: {
      en: 'Fertilizer',
      hi: 'उर्वरक',
      bn: 'সার'
    },
    general: {
      en: 'Agricultural',
      hi: 'कृषि',
      bn: 'কৃষি'
    }
  };
  
  return titles[topic]?.[language] || titles[topic]?.en || titles.general.en;
}

function generateFormattedText(sections: ResponseSection[], metadata: ResponseMetadata, language: string): string {
  let formatted = '';
  
  for (const section of sections) {
    // Add section header
    formatted += `${section.emoji} **${section.title}**\n\n`;
    
    // Add section content
    if (section.content.length > 0) {
      for (const item of section.content) {
        formatted += `• ${item}\n`;
      }
      formatted += '\n';
    }
  }
  
  // Add metadata footer
  formatted += generateMetadataFooter(metadata, language);
  
  return formatted.trim();
}

function generateMetadataFooter(metadata: ResponseMetadata, language: string): string {
  const timestamp = new Date(metadata.timestamp).toLocaleString();
  const confidenceText = metadata.geminiValidated ? 'Gemini AI Validated' : 'AI Generated';
  
  let footer = `---\n`;
  footer += `📝 **Original Query:** ${metadata.originalQuery}\n`;
  footer += `🗣️ **Language:** ${metadata.detectedLanguage.toUpperCase()}\n`;
  footer += `✅ **Quality:** ${confidenceText}\n`;
  
  if (metadata.sources.length > 0) {
    footer += `📚 **Sources:** ${metadata.sources.join(', ')}\n`;
  }
  
  footer += `🕒 **Generated:** ${timestamp}\n`;
  
  return footer;
}

function calculateDisplayConfidence(metadata: ResponseMetadata): number {
  let confidence = 0.7; // Base confidence
  
  // Boost for Gemini validation
  if (metadata.geminiValidated) confidence += 0.2;
  
  // Boost for multiple sources
  if (metadata.sources.length > 1) confidence += 0.1;
  
  // Boost for government sources
  if (metadata.sources.some(s => s.includes('Government') || s.includes('API'))) {
    confidence += 0.1;
  }
  
  return Math.min(confidence, 1.0);
}

// Export utility functions for external use
export const formatQueryDisplay = (originalQuery: string, translatedQuery: string | null, detectedLanguage: string): string => {
  if (!translatedQuery || originalQuery === translatedQuery) {
    return `📝 **${detectedLanguage.toUpperCase()}:** ${originalQuery}`;
  }
  
  return `📝 **${detectedLanguage.toUpperCase()}:** ${originalQuery}\n🔄 **Translated:** ${translatedQuery}`;
};

export const formatConfidenceDisplay = (confidence: number, factualBasis: string): string => {
  const confidencePercent = Math.round(confidence * 100);
  const confidenceEmoji = confidence >= 0.8 ? '🟢' : confidence >= 0.6 ? '🟡' : '🔴';
  const basisEmoji = factualBasis === 'high' ? '📊' : factualBasis === 'medium' ? '📈' : '📉';
  
  return `${confidenceEmoji} **Confidence:** ${confidencePercent}% ${basisEmoji} **Basis:** ${factualBasis}`;
};
