import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherRequest {
  location: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location }: WeatherRequest = await req.json();

    if (!location) {
      throw new Error('Location is required');
    }

    const openWeatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!openWeatherApiKey) {
      console.log('OpenWeather API key not found, using mock data');
      // Return mock weather data when API key is not available
      const mockWeatherData = {
        temperature: 28,
        humidity: 65,
        description: 'Partly cloudy',
        windSpeed: 12,
        rainfall: 0,
        location: location,
        date: new Date().toISOString().split('T')[0]
      };
      
      return new Response(JSON.stringify(mockWeatherData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch weather data from OpenWeatherMap
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},IN&appid=${openWeatherApiKey}&units=metric`;
    
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();

    // Format the response
    const formattedWeather = {
      temperature: Math.round(weatherData.main.temp),
      humidity: weatherData.main.humidity,
      description: weatherData.weather[0].description,
      windSpeed: Math.round(weatherData.wind?.speed * 3.6 || 0), // Convert m/s to km/h
      rainfall: weatherData.rain?.['1h'] || 0,
      location: `${weatherData.name}, ${weatherData.sys.country}`,
      date: new Date().toISOString().split('T')[0]
    };

    return new Response(JSON.stringify(formattedWeather), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-weather-data function:', error);
    
    // Return error response
    return new Response(JSON.stringify({ 
      error: error.message,
      // Provide fallback mock data on error
      fallback: {
        temperature: 26,
        humidity: 70,
        description: 'Weather data unavailable',
        windSpeed: 10,
        rainfall: 0,
        location: 'India',
        date: new Date().toISOString().split('T')[0]
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});