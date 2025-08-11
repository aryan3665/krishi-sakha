export interface DataSource {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  apiKey?: string;
  type: 'weather' | 'advisory' | 'market' | 'soil' | 'scheme' | 'general';
  region: 'national' | 'state' | 'district';
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  dataFormat: 'json' | 'xml' | 'csv';
  isActive: boolean;
}

export const DATA_SOURCES: DataSource[] = [
  {
    id: 'imd_weather',
    name: 'Indian Meteorological Department',
    description: 'Real-time weather data and forecasts from IMD',
    baseUrl: 'https://city.imd.gov.in/citywx/city_weather_test.php',
    type: 'weather',
    region: 'national',
    updateFrequency: 'hourly',
    dataFormat: 'json',
    isActive: true
  },
  {
    id: 'openweather',
    name: 'OpenWeatherMap',
    description: 'Global weather data with Indian city support',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY,
    type: 'weather',
    region: 'national',
    updateFrequency: 'hourly',
    dataFormat: 'json',
    isActive: true
  },
  {
    id: 'agmarknet',
    name: 'AGMARKNET - Market Prices',
    description: 'Real-time mandi prices from agricultural markets',
    baseUrl: 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
    type: 'market',
    region: 'national',
    updateFrequency: 'daily',
    dataFormat: 'json',
    isActive: true
  },
  {
    id: 'kisan_call_center',
    name: 'Kisan Call Center Advisories',
    description: 'Agricultural advisories and expert recommendations',
    baseUrl: 'https://api.data.gov.in/resource/kisan-advisories',
    type: 'advisory',
    region: 'national',
    updateFrequency: 'daily',
    dataFormat: 'json',
    isActive: true
  },
  {
    id: 'soil_health',
    name: 'Soil Health Card Data',
    description: 'Soil testing and nutrient information by district',
    baseUrl: 'https://api.data.gov.in/resource/soil-health-data',
    type: 'soil',
    region: 'district',
    updateFrequency: 'weekly',
    dataFormat: 'json',
    isActive: true
  },
  {
    id: 'pmkisan',
    name: 'PM-KISAN Scheme Info',
    description: 'Government scheme information and eligibility',
    baseUrl: 'https://api.data.gov.in/resource/pmkisan-schemes',
    type: 'scheme',
    region: 'national',
    updateFrequency: 'weekly',
    dataFormat: 'json',
    isActive: true
  },
  {
    id: 'krishi_vigyan',
    name: 'Krishi Vigyan Kendra Data',
    description: 'Agricultural research and extension services',
    baseUrl: 'https://api.data.gov.in/resource/kvk-data',
    type: 'advisory',
    region: 'district',
    updateFrequency: 'daily',
    dataFormat: 'json',
    isActive: true
  }
];

export interface LocationInfo {
  state: string;
  district: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface CropInfo {
  name: string;
  variety?: string;
  season: 'kharif' | 'rabi' | 'zaid' | 'perennial';
  stage?: 'sowing' | 'growing' | 'flowering' | 'harvesting';
}

export interface QueryContext {
  location?: LocationInfo;
  crop?: CropInfo;
  queryType: string[];
  language: string;
  timestamp: Date;
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Puducherry', 'Jammu and Kashmir', 'Ladakh'
];

export const COMMON_CROPS = [
  // Cereals
  'Rice', 'Wheat', 'Maize', 'Bajra', 'Jowar', 'Ragi', 'Barley',
  // Cash crops
  'Sugarcane', 'Cotton', 'Jute', 'Tea', 'Coffee', 'Tobacco',
  // Oilseeds
  'Groundnut', 'Mustard', 'Sunflower', 'Soybean', 'Sesame', 'Safflower',
  // Pulses
  'Gram', 'Lentil', 'Pea', 'Black gram', 'Green gram', 'Arhar', 'Moong', 'Urad', 'Chana',
  // Vegetables
  'Onion', 'Potato', 'Tomato', 'Chilli', 'Brinjal', 'Okra', 'Cabbage', 'Cauliflower',
  'Carrot', 'Radish', 'Beetroot', 'Cucumber', 'Bottle gourd', 'Ridge gourd', 'Bitter gourd',
  'Pumpkin', 'Bean', 'Spinach', 'Coriander', 'Mint', 'Capsicum', 'Lady finger',
  // Spices
  'Turmeric', 'Ginger', 'Garlic', 'Cumin', 'Fenugreek', 'Cardamom', 'Black pepper',
  // Fruits
  'Coconut', 'Mango', 'Banana', 'Apple', 'Orange', 'Grapes', 'Pomegranate'
];

// Hindi-English crop mappings for better extraction
export const CROP_TRANSLATIONS: { [key: string]: string } = {
  // Hindi to English
  'धान': 'Rice', 'चावल': 'Rice', 'गेहूं': 'Wheat', 'मक्का': 'Maize',
  'गन्ना': 'Sugarcane', 'कपास': 'Cotton', 'सोयाबीन': 'Soybean',
  'प्य��ज': 'Onion', 'आलू': 'Potato', 'टमाटर': 'Tomato',
  'बैंगन': 'Brinjal', 'भिंडी': 'Okra', 'गोभी': 'Cauliflower',
  'गाजर': 'Carrot', 'मूली': 'Radish', 'खीरा': 'Cucumber',
  'लौकी': 'Bottle gourd', 'तुरई': 'Ridge gourd', 'करेला': 'Bitter gourd',
  'हल्दी': 'Turmeric', 'अदरक': 'Ginger', 'लहसुन': 'Garlic',
  'मिर्च': 'Chilli', 'धनिया': 'Coriander', 'पुदीना': 'Mint',
  // Common variations
  'आम': 'Mango', 'केला': 'Banana', 'संतरा': 'Orange', 'अंगूर': 'Grapes'
};
