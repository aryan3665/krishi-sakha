import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateAdviceRequest {
  cleaned_query_text: string;
  detected_language?: string;
  language: string;
  include_data_retrieval?: boolean;
}

// Data retrieval utilities
const extractLocationInfo = (queryText: string): { district?: string; state?: string; crop?: string } => {
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

const getRelevantData = async (queryText: string): Promise<string> => {
  const locationInfo = extractLocationInfo(queryText);
  let dataContext = '\n\nRELEVANT AGRICULTURAL DATA:\n';
  
  // Add seasonal context
  const currentMonth = new Date().getMonth() + 1;
  const isKharif = currentMonth >= 6 && currentMonth <= 10;
  const isRabi = currentMonth >= 11 || currentMonth <= 3;
  
  if (isKharif) {
    dataContext += '- SEASON: Kharif season (June-October) - Monsoon crops\n';
  } else if (isRabi) {
    dataContext += '- SEASON: Rabi season (November-March) - Winter crops\n';
  } else {
    dataContext += '- SEASON: Summer season (April-May) - Summer crops\n';
  }

  // Add location-specific advice
  if (locationInfo.district || locationInfo.state) {
    dataContext += `- LOCATION: ${locationInfo.district || locationInfo.state}\n`;
  }

  // Add crop-specific context
  if (locationInfo.crop) {
    dataContext += `- CROP: ${locationInfo.crop}\n`;
    
    // Add crop-specific seasonal advice
    if (locationInfo.crop.includes('rice') || locationInfo.crop.includes('paddy')) {
      if (isKharif) {
        dataContext += '- RICE ADVISORY: Ideal time for transplanting. Ensure 5-7 cm standing water.\n';
      }
    } else if (locationInfo.crop.includes('wheat')) {
      if (isRabi) {
        dataContext += '- WHEAT ADVISORY: Optimal sowing time. Use certified seeds, apply NPK fertilizers.\n';
      }
    }
  }

  // Add general weather context (mock data for now)
  dataContext += '- WEATHER: Current temperature 26-30°C, humidity 65-75%\n';
  dataContext += '- GOVERNMENT SCHEMES: PM-KISAN (₹6000/year), PMFBY (crop insurance), KCC (credit facility)\n';
  
  return dataContext;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cleaned_query_text, detected_language, language, include_data_retrieval }: GenerateAdviceRequest = await req.json();

    if (!cleaned_query_text) {
      return new Response(
        JSON.stringify({ error: 'Query text is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get relevant agricultural data if requested
    let dataContext = '';
    let sources: string[] = [];
    
    if (include_data_retrieval) {
      try {
        dataContext = await getRelevantData(cleaned_query_text);
        sources = ['Agricultural Calendar', 'Seasonal Advisory', 'Government Schemes'];
      } catch (error) {
        console.warn('Error retrieving agricultural data:', error);
        dataContext = '\n\nNote: Using general agricultural knowledge.\n';
      }
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine response language
    const responseLanguage = detected_language || language || 'English';
    const isHindi = responseLanguage.toLowerCase().includes('hindi') || responseLanguage === 'hi';
    
    // Create contextual prompt for Indian farmers
    const systemPrompt = `You are an expert agricultural advisor specializing in Indian farming practices. Provide concise, actionable advice for Indian farmers based on their queries. 

Guidelines:
- Give practical, implementable advice suitable for Indian climate and soil conditions
- Consider local crops, seasonal patterns, and traditional farming methods
- Mention specific varieties, timing, and techniques when relevant
- Keep advice under 150 words and explanation under 100 words
- Be culturally sensitive and consider resource constraints of small farmers
- ${isHindi ? 'Respond in Hindi (Devanagari script)' : `Respond in ${responseLanguage} if possible, otherwise in English`}
- When data is provided, incorporate it naturally into your advice and cite relevant sources

Format your response as JSON with two fields:
- "advice": Practical, actionable farming advice
- "explanation": Brief explanation of why this advice works

${dataContext}

User Query: ${cleaned_query_text}`;

    console.log('Sending request to Gemini API...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', response.status, errorData);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI service is currently busy. Please try again in a moment.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate advice. Please try again.' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Gemini API response received');

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid response structure from Gemini API:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to generate advice. Please try again.' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('Generated text:', generatedText);

    // Try to parse JSON response
    let advice: string;
    let explanation: string;

    try {
      const parsed = JSON.parse(generatedText);
      advice = parsed.advice || generatedText;
      explanation = parsed.explanation || '';
    } catch {
      // If not JSON, treat as plain text advice
      advice = generatedText;
      explanation = 'AI-generated farming advice based on your query.';
    }

    return new Response(
      JSON.stringify({ 
        advice: advice.trim(),
        explanation: explanation.trim(),
        sources: sources.length > 0 ? sources : undefined
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in generate-advice function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});