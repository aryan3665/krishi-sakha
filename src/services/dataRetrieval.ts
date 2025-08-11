import { DataSource, LocationInfo, CropInfo, QueryContext } from './dataSources';

export interface RetrievedData {
  source: string;
  type: string;
  data: any;
  confidence: number;
  timestamp: Date;
  location?: LocationInfo;
  metadata: {
    freshness: 'fresh' | 'cached' | 'stale';
    cacheTime?: Date;
    reliability: 'high' | 'medium' | 'low';
  };
}

export class DataRetrievalAgent {
  private cache: Map<string, { data: RetrievedData; expiry: Date }> = new Map();
  private cacheDuration = {
    weather: 1 * 60 * 60 * 1000, // 1 hour
    market: 24 * 60 * 60 * 1000, // 24 hours
    advisory: 24 * 60 * 60 * 1000, // 24 hours
    soil: 7 * 24 * 60 * 60 * 1000, // 7 days
    scheme: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  async retrieveWeatherData(location: LocationInfo): Promise<RetrievedData[]> {
    const cacheKey = `weather_${location.state}_${location.district}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return [cached];

    const results: RetrievedData[] = [];

    try {
      // Mock weather data - in production, replace with actual API calls
      const weatherData = {
        temperature: Math.round(25 + Math.random() * 15),
        humidity: Math.round(60 + Math.random() * 30),
        rainfall: Math.round(Math.random() * 50),
        forecast: [
          { day: 'Today', temp: 28, condition: 'Partly Cloudy', rain: 10 },
          { day: 'Tomorrow', temp: 30, condition: 'Sunny', rain: 0 },
          { day: 'Day 3', temp: 26, condition: 'Light Rain', rain: 25 }
        ],
        windSpeed: Math.round(5 + Math.random() * 15),
        uvIndex: Math.round(3 + Math.random() * 7)
      };

      const result: RetrievedData = {
        source: 'Indian Meteorological Department',
        type: 'weather',
        data: weatherData,
        confidence: 0.9,
        timestamp: new Date(),
        location,
        metadata: {
          freshness: 'fresh',
          reliability: 'high'
        }
      };

      this.setCache(cacheKey, result, 'weather');
      results.push(result);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }

    return results;
  }

  async retrieveMarketData(location: LocationInfo, crop?: CropInfo): Promise<RetrievedData[]> {
    const cacheKey = `market_${location.state}_${crop?.name || 'general'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return [cached];

    const results: RetrievedData[] = [];

    try {
      // Always attempt to get the requested crop data first
      let requestedCropData = null;
      let availableCrops: string[] = [];
      let missingDataNote = null;

      if (crop?.name) {
        // Simulate checking if data is available for the requested crop
        const hasRequestedCropData = this.isDataAvailableForCrop(crop.name, location);

        if (hasRequestedCropData) {
          // Add requested crop to available crops
          availableCrops = [crop.name];

          // Add related crops
          const cropType = this.getCropCategory(crop.name);
          const relatedCrops = this.getRelatedCrops(crop.name, cropType);
          availableCrops.push(...relatedCrops.slice(0, 2));
        } else {
          // Requested crop data not available - note this with transparent message
          missingDataNote = `Market price data for ${crop.name.toLowerCase()} in ${location.district}, ${location.state} is currently unavailable. Please check back later or consult local mandi sources.`;

          // Show alternative crops based on category - more relevant than just major crops
          const cropType = this.getCropCategory(crop.name);
          if (cropType === 'vegetables') {
            availableCrops = ['Onion', 'Potato', 'Tomato']; // Common vegetables
          } else if (cropType === 'pulses') {
            availableCrops = ['Gram', 'Lentil', 'Moong'];
          } else if (cropType === 'oilseeds') {
            availableCrops = ['Groundnut', 'Mustard', 'Sunflower'];
          } else {
            // Default to major staples
            availableCrops = ['Rice', 'Wheat', 'Maize'];
          }
        }
      } else {
        // General query - show major crops
        availableCrops = ['Rice', 'Wheat', 'Maize', 'Onion', 'Potato'];
      }

      // Generate price data for available crops
      const priceData = availableCrops.map(cropName => {
        const basePrice = this.getBasePriceForCrop(cropName);
        const variation = 0.8 + Math.random() * 0.4; // ±20% variation

        const minPrice = Math.round(basePrice * variation * 0.9);
        const maxPrice = Math.round(basePrice * variation * 1.15);
        const modalPrice = Math.round(basePrice * variation);

        return {
          crop: cropName,
          variety: this.getVarietyForCrop(cropName),
          minPrice,
          maxPrice,
          modalPrice,
          unit: this.getUnitForCrop(cropName),
          market: `${location.district} APMC`,
          trend: Math.random() > 0.5 ? 'increasing' : ['stable', 'decreasing'][Math.floor(Math.random() * 2)],
          dataAvailable: true
        };
      });

      const marketData = {
        location: `${location.district}, ${location.state}`,
        date: new Date().toISOString().split('T')[0],
        requestedCrop: crop?.name,
        requestedCropDataAvailable: crop?.name ? !missingDataNote : true,
        missingDataNote,
        prices: priceData,
        trend: Math.random() > 0.5 ? 'increasing' : 'stable',
        lastUpdated: new Date(),
        dataSource: 'AGMARKNET',
        coverage: missingDataNote ? 'partial' : 'complete'
      };

      const result: RetrievedData = {
        source: 'AGMARKNET Market Data',
        type: 'market',
        data: marketData,
        confidence: missingDataNote ? 0.7 : 0.9, // Lower confidence if requested data missing
        timestamp: new Date(),
        location,
        metadata: {
          freshness: 'fresh',
          reliability: missingDataNote ? 'partial' : 'high'
        }
      };

      this.setCache(cacheKey, result, 'market');
      results.push(result);
    } catch (error) {
      console.error('Error fetching market data:', error);

      // Even on error, provide fallback data structure
      const fallbackResult: RetrievedData = {
        source: 'Market Data (Limited)',
        type: 'market',
        data: {
          location: `${location.district}, ${location.state}`,
          requestedCrop: crop?.name,
          missingDataNote: 'Market data temporarily unavailable. Please try again later.',
          prices: [],
          coverage: 'unavailable'
        },
        confidence: 0.3,
        timestamp: new Date(),
        location,
        metadata: {
          freshness: 'stale',
          reliability: 'low'
        }
      };
      results.push(fallbackResult);
    }

    return results;
  }

  private isDataAvailableForCrop(cropName: string, location: LocationInfo): boolean {
    // Simulate data availability - in real implementation, this would check actual API
    // For demo purposes, make some crops occasionally "unavailable" to demonstrate transparent handling
    const cropLower = cropName.toLowerCase();

    // Make certain vegetables occasionally "unavailable" to demonstrate the feature
    const sometimesUnavailable = ['potato', 'tomato', 'brinjal', 'okra', 'carrot', 'cabbage', 'cauliflower'];
    const rarelyAvailable = ['asparagus', 'lettuce', 'spinach', 'kale']; // Specialty vegetables

    if (rarelyAvailable.includes(cropLower)) {
      return Math.random() > 0.7; // 70% chance of being unavailable
    }

    if (sometimesUnavailable.includes(cropLower)) {
      return Math.random() > 0.4; // 40% chance of being unavailable
    }

    // Major staple crops are usually available
    const majorCrops = ['rice', 'wheat', 'maize', 'onion'];
    if (majorCrops.includes(cropLower)) {
      return Math.random() > 0.05; // 5% chance of being unavailable
    }

    // Other crops
    return Math.random() > 0.2; // 20% chance of being unavailable
  }

  private getCropCategory(cropName: string): string {
    const cropLower = cropName.toLowerCase();
    if (['rice', 'wheat', 'maize', 'bajra', 'jowar'].includes(cropLower)) return 'cereals';
    if (['onion', 'potato', 'tomato', 'brinjal', 'okra', 'cabbage'].includes(cropLower)) return 'vegetables';
    if (['groundnut', 'mustard', 'sunflower', 'soybean'].includes(cropLower)) return 'oilseeds';
    if (['gram', 'lentil', 'pea', 'moong', 'urad'].includes(cropLower)) return 'pulses';
    if (['cotton', 'sugarcane', 'jute'].includes(cropLower)) return 'cash_crops';
    return 'others';
  }

  private getRelatedCrops(cropName: string, category: string): string[] {
    const relatedCrops: { [key: string]: string[] } = {
      cereals: ['Rice', 'Wheat', 'Maize', 'Bajra', 'Jowar'],
      vegetables: ['Onion', 'Potato', 'Tomato', 'Brinjal', 'Okra', 'Cabbage', 'Cauliflower'],
      oilseeds: ['Groundnut', 'Mustard', 'Sunflower', 'Soybean'],
      pulses: ['Gram', 'Lentil', 'Pea', 'Moong', 'Urad'],
      cash_crops: ['Cotton', 'Sugarcane', 'Jute'],
      others: ['Rice', 'Wheat', 'Onion']
    };

    return (relatedCrops[category] || relatedCrops.others).filter(c => c !== cropName);
  }

  private getBasePriceForCrop(cropName: string): number {
    const basePrices: { [key: string]: number } = {
      // Cereals (per quintal)
      'Rice': 2000, 'Wheat': 2100, 'Maize': 1800, 'Bajra': 1700, 'Jowar': 1600,
      // Vegetables (per quintal)
      'Onion': 1200, 'Potato': 1000, 'Tomato': 1500, 'Brinjal': 1300, 'Okra': 2000,
      'Cabbage': 800, 'Cauliflower': 1200, 'Carrot': 1400, 'Radish': 900,
      'Cucumber': 1100, 'Bottle gourd': 1000, 'Ridge gourd': 1300, 'Bitter gourd': 1800,
      // Pulses (per quintal)
      'Gram': 4500, 'Lentil': 5000, 'Pea': 3500, 'Moong': 6000, 'Urad': 5500,
      // Oilseeds (per quintal)
      'Groundnut': 5000, 'Mustard': 4200, 'Sunflower': 5200, 'Soybean': 3800,
      // Cash crops
      'Cotton': 5500, 'Sugarcane': 280, // Sugarcane per ton, others per quintal
      // Spices
      'Turmeric': 7000, 'Ginger': 6000, 'Garlic': 8000, 'Chilli': 12000
    };

    return basePrices[cropName] || 2000; // Default price
  }

  private getVarietyForCrop(cropName: string): string {
    const varieties: { [key: string]: string } = {
      'Rice': 'Basmati/Common',
      'Wheat': 'HD-2967/PBW-343',
      'Onion': 'Nashik Red/Bellary',
      'Potato': 'Jyoti/Kufri Badshah',
      'Tomato': 'Hybrid/Desi',
      'Cotton': 'Shankar-6/RCH-134',
      'Sugarcane': 'Co-86032/Co-0238'
    };

    return varieties[cropName] || 'Mixed/Grade A';
  }

  private getUnitForCrop(cropName: string): string {
    if (cropName === 'Sugarcane') return 'per ton';
    return 'per quintal';
  }

  async retrieveAdvisoryData(location: LocationInfo, crop?: CropInfo): Promise<RetrievedData[]> {
    const cacheKey = `advisory_${location.state}_${crop?.name || 'general'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return [cached];

    const results: RetrievedData[] = [];

    try {
      // Mock advisory data - in production, replace with actual API calls
      const advisories = [
        {
          title: 'Weather-based Advisory',
          content: `Current weather conditions are favorable for ${crop?.name || 'major crops'}. Expected light rainfall in next 3 days.`,
          priority: 'medium',
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          source: 'Krishi Vigyan Kendra'
        },
        {
          title: 'Pest Management',
          content: 'Monitor for early signs of bollworm in cotton crops. Use integrated pest management practices.',
          priority: 'high',
          validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          source: 'State Agricultural Department'
        },
        {
          title: 'Fertilizer Recommendation',
          content: 'Apply balanced NPK fertilizer based on soil test results. Recommended dose: 120:60:40 NPK per hectare.',
          priority: 'medium',
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          source: 'Soil Health Card Program'
        }
      ];

      const result: RetrievedData = {
        source: 'Agricultural Advisory Services',
        type: 'advisory',
        data: { advisories, location: `${location.district}, ${location.state}` },
        confidence: 0.8,
        timestamp: new Date(),
        location,
        metadata: {
          freshness: 'fresh',
          reliability: 'high'
        }
      };

      this.setCache(cacheKey, result, 'advisory');
      results.push(result);
    } catch (error) {
      console.error('Error fetching advisory data:', error);
    }

    return results;
  }

  async retrieveSoilData(location: LocationInfo): Promise<RetrievedData[]> {
    const cacheKey = `soil_${location.state}_${location.district}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return [cached];

    const results: RetrievedData[] = [];

    try {
      // Mock soil data - in production, replace with actual API calls
      const soilData = {
        pH: (6.5 + Math.random() * 2).toFixed(1),
        organicCarbon: (0.3 + Math.random() * 0.5).toFixed(2),
        nitrogen: Math.random() > 0.5 ? 'Low' : 'Medium',
        phosphorus: Math.random() > 0.5 ? 'Medium' : 'High',
        potassium: Math.random() > 0.5 ? 'High' : 'Medium',
        soilType: ['Alluvial', 'Red', 'Black', 'Laterite'][Math.floor(Math.random() * 4)],
        recommendations: [
          'Apply 2-3 tonnes of well decomposed FYM per hectare',
          'Maintain soil pH between 6.0-7.5 for optimal crop growth',
          'Regular soil testing every 3 years is recommended'
        ],
        testDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        district: location.district,
        state: location.state
      };

      const result: RetrievedData = {
        source: 'Soil Health Card Program',
        type: 'soil',
        data: soilData,
        confidence: 0.85,
        timestamp: new Date(),
        location,
        metadata: {
          freshness: 'cached',
          cacheTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          reliability: 'high'
        }
      };

      this.setCache(cacheKey, result, 'soil');
      results.push(result);
    } catch (error) {
      console.error('Error fetching soil data:', error);
    }

    return results;
  }

  async retrieveSchemeData(location: LocationInfo): Promise<RetrievedData[]> {
    const cacheKey = `schemes_${location.state}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return [cached];

    const results: RetrievedData[] = [];

    try {
      // Mock scheme data - in production, replace with actual API calls
      const schemes = [
        {
          name: 'PM-KISAN',
          description: 'Income support to farmer families',
          eligibility: 'Small and marginal farmers with landholding up to 2 hectares',
          benefit: '₹6,000 per year in three installments',
          applicationProcess: 'Online through PM-KISAN portal or Common Service Centers',
          status: 'Active',
          deadline: '31st March 2025'
        },
        {
          name: 'Pradhan Mantri Fasal Bima Yojana',
          description: 'Crop insurance scheme',
          eligibility: 'All farmers growing notified crops',
          benefit: 'Insurance coverage against crop loss',
          applicationProcess: 'Through banks, insurance companies, or online portal',
          status: 'Active',
          deadline: 'Before sowing season'
        },
        {
          name: 'Soil Health Card Scheme',
          description: 'Free soil testing and nutrient recommendations',
          eligibility: 'All farmers',
          benefit: 'Free soil analysis and fertilizer recommendations',
          applicationProcess: 'Contact local Krishi Vigyan Kendra or Agriculture Department',
          status: 'Active',
          deadline: 'Ongoing'
        }
      ];

      const result: RetrievedData = {
        source: 'Government Scheme Database',
        type: 'scheme',
        data: { schemes, state: location.state },
        confidence: 0.9,
        timestamp: new Date(),
        location,
        metadata: {
          freshness: 'fresh',
          reliability: 'high'
        }
      };

      this.setCache(cacheKey, result, 'scheme');
      results.push(result);
    } catch (error) {
      console.error('Error fetching scheme data:', error);
    }

    return results;
  }

  private getFromCache(key: string): RetrievedData | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > new Date()) {
      return {
        ...cached.data,
        metadata: {
          ...cached.data.metadata,
          freshness: 'cached',
          cacheTime: cached.data.timestamp
        }
      };
    }
    return null;
  }

  private setCache(key: string, data: RetrievedData, type: keyof typeof this.cacheDuration): void {
    const expiry = new Date(Date.now() + this.cacheDuration[type]);
    this.cache.set(key, { data, expiry });
  }

  async retrieveAllRelevantData(context: QueryContext): Promise<RetrievedData[]> {
    const results: RetrievedData[] = [];

    // Use default location if none provided
    const location = context.location || { state: 'General', district: 'General' };

    try {
      // **ALWAYS ATTEMPT ALL DATA SOURCES** - as per requirements
      console.log('🔍 Attempting to retrieve data from all sources...');

      // 1. Always get weather data
      try {
        const weatherData = await this.retrieveWeatherData(location);
        results.push(...weatherData);
        console.log('✅ Weather data retrieved');
      } catch (error) {
        console.warn('⚠️ Weather data failed:', error);
      }

      // 2. Always get market data (essential for price queries)
      try {
        const marketData = await this.retrieveMarketData(location, context.crop);
        results.push(...marketData);
        console.log('✅ Market data retrieved');
      } catch (error) {
        console.warn('⚠️ Market data failed:', error);
      }

      // 3. Always get advisory data
      try {
        const advisoryData = await this.retrieveAdvisoryData(location, context.crop);
        results.push(...advisoryData);
        console.log('✅ Advisory data retrieved');
      } catch (error) {
        console.warn('⚠️ Advisory data failed:', error);
      }

      // 4. Get soil data (prioritize if query is about soil/fertilizers)
      if (context.queryType.includes('soil') || context.queryType.includes('fertilizer') ||
          context.queryType.includes('general')) {
        try {
          const soilData = await this.retrieveSoilData(location);
          results.push(...soilData);
          console.log('✅ Soil data retrieved');
        } catch (error) {
          console.warn('⚠️ Soil data failed:', error);
        }
      }

      // 5. Get scheme data (prioritize if query is about schemes/subsidies)
      if (context.queryType.includes('scheme') || context.queryType.includes('subsidy') ||
          context.queryType.includes('general')) {
        try {
          const schemeData = await this.retrieveSchemeData(location);
          results.push(...schemeData);
          console.log('✅ Scheme data retrieved');
        } catch (error) {
          console.warn('⚠️ Scheme data failed:', error);
        }
      }

      console.log(`📊 Total data sources retrieved: ${results.length}`);
    } catch (error) {
      console.error('❌ Error in retrieveAllRelevantData:', error);
    }

    return results;
  }
}

export const dataAgent = new DataRetrievalAgent();
