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
      // Mock market data - in production, replace with actual API calls
      const crops = crop ? [crop.name] : ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane'];
      const marketData = {
        location: `${location.district}, ${location.state}`,
        date: new Date().toISOString().split('T')[0],
        prices: crops.map(cropName => ({
          crop: cropName,
          variety: 'Grade A',
          minPrice: Math.round(1500 + Math.random() * 1000),
          maxPrice: Math.round(2000 + Math.random() * 1500),
          modalPrice: Math.round(1750 + Math.random() * 1250),
          unit: 'per quintal',
          market: `${location.district} APMC`
        })),
        trend: Math.random() > 0.5 ? 'increasing' : 'stable',
        lastUpdated: new Date()
      };

      const result: RetrievedData = {
        source: 'AGMARKNET',
        type: 'market',
        data: marketData,
        confidence: 0.85,
        timestamp: new Date(),
        location,
        metadata: {
          freshness: 'fresh',
          reliability: 'high'
        }
      };

      this.setCache(cacheKey, result, 'market');
      results.push(result);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }

    return results;
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

    if (context.location) {
      // Always get weather data
      const weatherData = await this.retrieveWeatherData(context.location);
      results.push(...weatherData);

      // Get market data if crop is specified or if query is about prices
      if (context.crop || context.queryType.includes('market') || context.queryType.includes('price')) {
        const marketData = await this.retrieveMarketData(context.location, context.crop);
        results.push(...marketData);
      }

      // Get advisory data
      const advisoryData = await this.retrieveAdvisoryData(context.location, context.crop);
      results.push(...advisoryData);

      // Get soil data if query is about soil or fertilizers
      if (context.queryType.includes('soil') || context.queryType.includes('fertilizer')) {
        const soilData = await this.retrieveSoilData(context.location);
        results.push(...soilData);
      }

      // Get scheme data if query is about government schemes or subsidies
      if (context.queryType.includes('scheme') || context.queryType.includes('subsidy')) {
        const schemeData = await this.retrieveSchemeData(context.location);
        results.push(...schemeData);
      }
    }

    return results;
  }
}

export const dataAgent = new DataRetrievalAgent();
