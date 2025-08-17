import { supabase } from '@/integrations/supabase/client';

export interface WeatherDataPoint {
  date: string;
  location: string;
  temp_c: number;
  humidity?: number;
  rainfall_mm: number;
  wind_speed_kmh?: number;
  condition: string;
  source: string;
}

export interface OpenWeatherResponse {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
  rain?: {
    '1h': number;
  };
}

export class WeatherDataFetcher {
  private readonly OPENWEATHER_API = 'https://api.openweathermap.org/data/2.5/weather';
  private readonly API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo';
  
  // Major agricultural cities in India
  private readonly MAJOR_CITIES = [
    { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
    { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
    { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
    { name: 'Pune', lat: 18.5204, lon: 73.8567 },
    { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
    { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
    { name: 'Lucknow', lat: 26.8467, lon: 80.9462 },
    { name: 'Chandigarh', lat: 30.7333, lon: 76.7794 },
    { name: 'Bhopal', lat: 23.2599, lon: 77.4126 },
    { name: 'Patna', lat: 25.5941, lon: 85.1376 },
    { name: 'Kochi', lat: 9.9312, lon: 76.2673 },
    { name: 'Indore', lat: 22.7196, lon: 75.8577 },
  ];

  async fetchWeatherData(): Promise<WeatherDataPoint[]> {
    console.log('🌤️ Starting weather data fetching...');
    const weatherData: WeatherDataPoint[] = [];

    try {
      // If no API key or demo mode, generate mock data
      if (this.API_KEY === 'demo' || !this.API_KEY) {
        console.log('⚠️ No OpenWeather API key found, generating mock weather data');
        const mockData = this.generateMockWeatherData();
        weatherData.push(...mockData);
      } else {
        // Fetch real weather data for major cities
        for (const city of this.MAJOR_CITIES.slice(0, 5)) { // Limit to avoid rate limits
          try {
            const data = await this.fetchCityWeather(city);
            if (data) weatherData.push(data);
            
            // Small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            console.warn(`Failed to fetch weather for ${city.name}:`, error);
          }
        }
      }

      // Store in database
      if (weatherData.length > 0) {
        await this.storeWeatherData(weatherData);
        console.log(`✅ Stored ${weatherData.length} weather data points`);
      }

      return weatherData;
    } catch (error) {
      console.error('❌ Weather data fetching failed:', error);
      throw error;
    }
  }

  private async fetchCityWeather(city: { name: string; lat: number; lon: number }): Promise<WeatherDataPoint | null> {
    try {
      const url = `${this.OPENWEATHER_API}?lat=${city.lat}&lon=${city.lon}&appid=${this.API_KEY}&units=metric`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OpenWeatherResponse = await response.json();
      
      return {
        date: new Date().toISOString().split('T')[0],
        location: `${city.name}, India`,
        temp_c: Math.round(data.main.temp * 10) / 10,
        humidity: data.main.humidity,
        rainfall_mm: data.rain?.['1h'] || 0,
        wind_speed_kmh: Math.round(data.wind.speed * 3.6 * 10) / 10, // Convert m/s to km/h
        condition: data.weather[0].description,
        source: 'OpenWeatherMap'
      };
    } catch (error) {
      console.error(`Failed to fetch weather for ${city.name}:`, error);
      return null;
    }
  }

  private generateMockWeatherData(): WeatherDataPoint[] {
    const today = new Date().toISOString().split('T')[0];
    const data: WeatherDataPoint[] = [];

    // Generate realistic weather data for major cities
    this.MAJOR_CITIES.forEach(city => {
      const baseTemp = this.getBaseTemperatureForCity(city.name);
      const tempVariation = -5 + Math.random() * 10; // ±5°C variation
      const temp = Math.round((baseTemp + tempVariation) * 10) / 10;

      // Generate realistic humidity (40-90%)
      const humidity = Math.round(40 + Math.random() * 50);

      // Generate rainfall (0-20mm, with 70% chance of no rain)
      const rainfall = Math.random() < 0.7 ? 0 : Math.round(Math.random() * 20 * 10) / 10;

      // Generate wind speed (5-25 km/h)
      const windSpeed = Math.round((5 + Math.random() * 20) * 10) / 10;

      // Generate weather condition based on rainfall
      const conditions = rainfall > 0 
        ? ['light rain', 'moderate rain', 'scattered thunderstorms']
        : ['clear sky', 'few clouds', 'scattered clouds', 'partly cloudy'];
      
      const condition = conditions[Math.floor(Math.random() * conditions.length)];

      data.push({
        date: today,
        location: `${city.name}, India`,
        temp_c: temp,
        humidity,
        rainfall_mm: rainfall,
        wind_speed_kmh: windSpeed,
        condition,
        source: 'IMD Mausam (Mock)'
      });
    });

    return data;
  }

  private getBaseTemperatureForCity(cityName: string): number {
    // Base temperatures for different cities (seasonal averages)
    const baseTemperatures: { [key: string]: number } = {
      'Delhi': 28,
      'Mumbai': 30,
      'Chennai': 32,
      'Kolkata': 29,
      'Bangalore': 25,
      'Hyderabad': 30,
      'Pune': 27,
      'Ahmedabad': 31,
      'Jaipur': 29,
      'Lucknow': 28,
      'Chandigarh': 26,
      'Bhopal': 28,
      'Patna': 30,
      'Kochi': 29,
      'Indore': 27,
    };

    return baseTemperatures[cityName] || 28;
  }

  private async storeWeatherData(data: WeatherDataPoint[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('weather_data')
        .insert(data);

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to store weather data:', error);
      throw error;
    }
  }

  async getLatestWeatherData(location?: string): Promise<WeatherDataPoint[]> {
    try {
      let query = supabase
        .from('weather_data')
        .select('*')
        .order('fetched_at', { ascending: false })
        .limit(20);

      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      return [];
    }
  }

  async getWeatherHistory(location: string, days: number = 7): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('weather_data')
        .select('date, location, temp_c, humidity, rainfall_mm, condition')
        .ilike('location', `%${location}%`)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch weather history:', error);
      return [];
    }
  }

  async fetchIMDWeatherData(): Promise<WeatherDataPoint[]> {
    // This would be the real implementation for IMD API
    // For now, returning mock data until API access is configured
    console.log('📡 Attempting to fetch from IMD Mausam API...');
    
    try {
      // Mock IMD API call - replace with actual implementation when API keys are available
      const imdEndpoint = 'https://city.imd.gov.in/citywx/city_weather_test.php';
      
      // For demo purposes, we'll use mock data
      console.log('⚠️ IMD API requires authentication, using mock data');
      return this.generateMockWeatherData();
    } catch (error) {
      console.log('⚠️ Falling back to mock weather data due to API error:', error);
      return this.generateMockWeatherData();
    }
  }

  async getWeatherSummary(location?: string): Promise<{
    avgTemp: number;
    totalRainfall: number;
    avgHumidity: number;
    dominantCondition: string;
    dataPoints: number;
  }> {
    try {
      const weatherData = await this.getLatestWeatherData(location);
      
      if (weatherData.length === 0) {
        return {
          avgTemp: 0,
          totalRainfall: 0,
          avgHumidity: 0,
          dominantCondition: 'No data',
          dataPoints: 0
        };
      }

      const avgTemp = Math.round(
        weatherData.reduce((sum, item) => sum + item.temp_c, 0) / weatherData.length * 10
      ) / 10;

      const totalRainfall = Math.round(
        weatherData.reduce((sum, item) => sum + item.rainfall_mm, 0) * 10
      ) / 10;

      const avgHumidity = Math.round(
        weatherData.reduce((sum, item) => sum + (item.humidity || 0), 0) / weatherData.length
      );

      // Find most common weather condition
      const conditionCounts: { [key: string]: number } = {};
      weatherData.forEach(item => {
        conditionCounts[item.condition] = (conditionCounts[item.condition] || 0) + 1;
      });

      const dominantCondition = Object.entries(conditionCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Variable';

      return {
        avgTemp,
        totalRainfall,
        avgHumidity,
        dominantCondition,
        dataPoints: weatherData.length
      };
    } catch (error) {
      console.error('Failed to generate weather summary:', error);
      return {
        avgTemp: 0,
        totalRainfall: 0,
        avgHumidity: 0,
        dominantCondition: 'Error',
        dataPoints: 0
      };
    }
  }
}

export const weatherDataFetcher = new WeatherDataFetcher();
