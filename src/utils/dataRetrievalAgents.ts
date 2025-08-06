// Data Retrieval Agents for Indian Agriculture Data
import { supabase } from '@/integrations/supabase/client';

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  windSpeed: number;
  rainfall?: number;
  location: string;
  date: string;
}

export interface MarketPriceData {
  commodity: string;
  price: number;
  unit: string;
  market: string;
  date: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface CropAdvisory {
  crop: string;
  activity: string;
  description: string;
  timing: string;
  region: string;
}

export interface AgriData {
  weather?: WeatherData;
  marketPrices?: MarketPriceData[];
  cropAdvisories?: CropAdvisory[];
  schemes?: any[];
  sources: string[];
}

// Extract location from query text
export const extractLocationInfo = (queryText: string): { district?: string; state?: string; crop?: string } => {
  const text = queryText.toLowerCase();
  
  // Common Indian districts and states patterns
  const districts = ['allahabad', 'prayagraj', 'lucknow', 'kanpur', 'varanasi', 'agra', 'meerut', 'patna', 'gaya', 'muzaffarpur', 'pune', 'mumbai', 'nashik', 'bangalore', 'mysore', 'hubli', 'chennai', 'coimbatore', 'madurai', 'hyderabad', 'warangal', 'visakhapatnam'];
  const states = ['uttar pradesh', 'bihar', 'maharashtra', 'karnataka', 'tamil nadu', 'telangana', 'andhra pradesh', 'punjab', 'haryana', 'rajasthan', 'madhya pradesh', 'gujarat', 'west bengal', 'odisha', 'kerala'];
  const crops = ['paddy', 'rice', 'wheat', 'maize', 'cotton', 'sugarcane', 'soybean', 'mustard', 'gram', 'arhar', 'moong', 'urad', 'groundnut', 'sunflower', 'sesame', 'potato', 'onion', 'tomato'];

  const district = districts.find(d => text.includes(d));
  const state = states.find(s => text.includes(s));
  const crop = crops.find(c => text.includes(c));

  return { district, state, crop };
};

// Weather Data Agent using OpenWeatherMap (requires API key)
export const getWeatherData = async (location: string): Promise<WeatherData | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-weather-data', {
      body: { location }
    });

    if (error || !data) {
      console.warn('Weather data not available:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Error fetching weather data:', error);
    return null;
  }
};

// Market Price Data Agent (mock data based on typical Indian agricultural markets)
export const getMarketPriceData = async (crop?: string, location?: string): Promise<MarketPriceData[]> => {
  // Mock data for demonstration - in production, this would connect to e-NAM or other market APIs
  const mockPrices: MarketPriceData[] = [
    {
      commodity: crop || 'Rice',
      price: 2800,
      unit: 'per quintal',
      market: location ? `${location} Mandi` : 'Local Mandi',
      date: new Date().toISOString().split('T')[0],
      trend: 'stable'
    },
    {
      commodity: 'Wheat',
      price: 2200,
      unit: 'per quintal',
      market: location ? `${location} Mandi` : 'Local Mandi',
      date: new Date().toISOString().split('T')[0],
      trend: 'up'
    }
  ];

  return crop ? mockPrices.filter(p => p.commodity.toLowerCase().includes(crop.toLowerCase())) : mockPrices;
};

// Crop Advisory Agent
export const getCropAdvisories = async (crop?: string, location?: string): Promise<CropAdvisory[]> => {
  const currentMonth = new Date().getMonth() + 1;
  const isKharif = currentMonth >= 6 && currentMonth <= 10;
  const isRabi = currentMonth >= 11 || currentMonth <= 3;

  const advisories: CropAdvisory[] = [];

  if (crop?.toLowerCase().includes('paddy') || crop?.toLowerCase().includes('rice')) {
    if (isKharif) {
      advisories.push({
        crop: 'Rice/Paddy',
        activity: 'Kharif Sowing',
        description: 'Ideal time for transplanting paddy seedlings. Ensure adequate water supply.',
        timing: 'June-July',
        region: location || 'General'
      });
    }
  }

  if (crop?.toLowerCase().includes('wheat')) {
    if (isRabi) {
      advisories.push({
        crop: 'Wheat',
        activity: 'Rabi Sowing',
        description: 'Optimal sowing time for wheat. Use certified seeds and balanced fertilizers.',
        timing: 'November-December',
        region: location || 'General'
      });
    }
  }

  // Add general seasonal advisory
  if (isKharif) {
    advisories.push({
      crop: 'General',
      activity: 'Kharif Season',
      description: 'Monitor weather forecasts for monsoon patterns. Ensure proper drainage in fields.',
      timing: 'June-October',
      region: location || 'General'
    });
  }

  return advisories;
};

// Government Schemes Data Agent
export const getGovernmentSchemes = async (crop?: string): Promise<any[]> => {
  // Mock data for major schemes - in production, this would fetch from government APIs
  const schemes = [
    {
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      description: 'Crop insurance scheme to protect farmers against crop losses',
      eligibility: 'All farmers including sharecroppers and tenant farmers',
      link: 'https://pmfby.gov.in/'
    },
    {
      name: 'PM-KISAN',
      description: 'Direct income support of ₹6000 per year to eligible farmer families',
      eligibility: 'Small and marginal farmer families',
      link: 'https://pmkisan.gov.in/'
    },
    {
      name: 'Kisan Credit Card (KCC)',
      description: 'Flexible credit facility for farmers at concessional rates',
      eligibility: 'All farmers including tenant farmers and oral lessees',
      link: 'https://www.india.gov.in/spotlight/kisan-credit-card-kcc'
    }
  ];

  return schemes;
};

// Main data aggregation function
export const aggregateAgriData = async (queryText: string): Promise<AgriData> => {
  const locationInfo = extractLocationInfo(queryText);
  const sources: string[] = [];

  try {
    // Fetch data from multiple sources in parallel
    const [weatherData, marketPrices, cropAdvisories, schemes] = await Promise.allSettled([
      getWeatherData(locationInfo.district || locationInfo.state || 'India'),
      getMarketPriceData(locationInfo.crop, locationInfo.district),
      getCropAdvisories(locationInfo.crop, locationInfo.district),
      getGovernmentSchemes(locationInfo.crop)
    ]);

    const result: AgriData = { sources };

    if (weatherData.status === 'fulfilled' && weatherData.value) {
      result.weather = weatherData.value;
      sources.push('Weather: OpenWeatherMap API');
    }

    if (marketPrices.status === 'fulfilled') {
      result.marketPrices = marketPrices.value;
      sources.push('Market Prices: Agricultural Market Data');
    }

    if (cropAdvisories.status === 'fulfilled') {
      result.cropAdvisories = cropAdvisories.value;
      sources.push('Crop Advisories: Agricultural Calendar');
    }

    if (schemes.status === 'fulfilled') {
      result.schemes = schemes.value;
      sources.push('Government Schemes: Ministry of Agriculture');
    }

    return result;
  } catch (error) {
    console.error('Error aggregating agricultural data:', error);
    return { sources: ['Error fetching external data'] };
  }
};

// Format data for AI prompt
export const formatDataForPrompt = (data: AgriData): string => {
  let formattedData = '\n\nRELEVANT AGRICULTURAL DATA:\n';

  if (data.weather) {
    formattedData += `\nWEATHER INFORMATION:\n`;
    formattedData += `- Location: ${data.weather.location}\n`;
    formattedData += `- Temperature: ${data.weather.temperature}°C\n`;
    formattedData += `- Humidity: ${data.weather.humidity}%\n`;
    formattedData += `- Conditions: ${data.weather.description}\n`;
    formattedData += `- Wind Speed: ${data.weather.windSpeed} km/h\n`;
    if (data.weather.rainfall) {
      formattedData += `- Rainfall: ${data.weather.rainfall} mm\n`;
    }
  }

  if (data.marketPrices && data.marketPrices.length > 0) {
    formattedData += `\nMARKET PRICES:\n`;
    data.marketPrices.forEach(price => {
      formattedData += `- ${price.commodity}: ₹${price.price} ${price.unit} at ${price.market} (${price.trend})\n`;
    });
  }

  if (data.cropAdvisories && data.cropAdvisories.length > 0) {
    formattedData += `\nCROP ADVISORIES:\n`;
    data.cropAdvisories.forEach(advisory => {
      formattedData += `- ${advisory.crop}: ${advisory.activity} - ${advisory.description} (${advisory.timing})\n`;
    });
  }

  if (data.schemes && data.schemes.length > 0) {
    formattedData += `\nRELEVANT GOVERNMENT SCHEMES:\n`;
    data.schemes.forEach(scheme => {
      formattedData += `- ${scheme.name}: ${scheme.description}\n`;
    });
  }

  if (data.sources.length > 0) {
    formattedData += `\nDATA SOURCES: ${data.sources.join(', ')}\n`;
  }

  return formattedData;
};