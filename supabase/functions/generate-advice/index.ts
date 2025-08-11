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
  console.log('🔍 Extracting agricultural data for query:', queryText);
  
  try {
    const locationInfo = extractLocationInfo(queryText);
    console.log('📍 Location extraction result:', locationInfo);
    
    let dataContext = '\n\nRELEVANT AGRICULTURAL DATA:\n';
    
    // Add seasonal context
    const currentMonth = new Date().getMonth() + 1;
    const isKharif = currentMonth >= 6 && currentMonth <= 10;
    const isRabi = currentMonth >= 11 || currentMonth <= 3;
    
    console.log('📅 Seasonal context:', { currentMonth, isKharif, isRabi });
    
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
    
    console.log('✅ Agricultural data context generated successfully');
    return dataContext;
  } catch (error) {
    console.error('❌ Error in getRelevantData:', error);
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🚀 [${requestId}] Starting generate-advice request`);

  try {
    console.log(`📝 [${requestId}] Parsing request body...`);
    const { cleaned_query_text, detected_language, language, include_data_retrieval }: GenerateAdviceRequest = await req.json();

    console.log(`📋 [${requestId}] Request parameters:`, {
      cleaned_query_text: cleaned_query_text?.substring(0, 100) + '...',
      detected_language,
      language,
      include_data_retrieval
    });

    if (!cleaned_query_text) {
      console.error(`❌ [${requestId}] Missing query text`);
      return new Response(
        JSON.stringify({ error: 'Query text is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get relevant agricultural data if requested
    let dataContext = '';
    let sources: string[] = [];
    
    if (include_data_retrieval) {
      console.log(`🌾 [${requestId}] Retrieving agricultural data...`);
      try {
        dataContext = await getRelevantData(cleaned_query_text);
        sources = ['Agricultural Calendar', 'Seasonal Advisory', 'Government Schemes'];
        console.log(`✅ [${requestId}] Agricultural data retrieved successfully`);
      } catch (error) {
        console.error(`⚠️ [${requestId}] Error retrieving agricultural data:`, error);
        dataContext = '\n\nNote: Using general agricultural knowledge.\n';
        sources = ['General Agricultural Knowledge'];
      }
    } else {
      console.log(`⏭️ [${requestId}] Skipping data retrieval`);
    }

    console.log(`🔑 [${requestId}] Checking API credentials...`);
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error(`❌ [${requestId}] GEMINI_API_KEY not found in environment variables`);
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable - missing API key' }), 
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

    console.log(`🤖 [${requestId}] Sending request to Gemini API...`);
    
    const geminiPayload = {
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
    };

    console.log(`📤 [${requestId}] Gemini request payload size:`, JSON.stringify(geminiPayload).length);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload),
    });

    console.log(`📨 [${requestId}] Gemini API response status:`, response.status, response.statusText);

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        console.error(`❌ [${requestId}] Failed to parse error response:`, e);
      }
      
      console.error(`❌ [${requestId}] Gemini API error:`, {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI service is currently busy. Please try again in a moment.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 403) {
        return new Response(
          JSON.stringify({ error: 'AI service access denied. Please check API configuration.' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `AI service error (${response.status}). Please try again.` }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📥 [${requestId}] Parsing Gemini response...`);
    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error(`❌ [${requestId}] Failed to parse Gemini response JSON:`, error);
      return new Response(
        JSON.stringify({ error: 'Invalid response from AI service' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ [${requestId}] Gemini API response received successfully`);

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error(`❌ [${requestId}] Invalid response structure from Gemini API:`, {
        hasCandidates: !!data.candidates,
        candidatesLength: data.candidates?.length,
        firstCandidate: data.candidates?.[0],
        fullResponse: data
      });
      return new Response(
        JSON.stringify({ error: 'Invalid AI response structure. Please try again.' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log(`📝 [${requestId}] Generated text length:`, generatedText?.length);

    // Try to parse JSON response
    console.log(`🔍 [${requestId}] Parsing generated text as JSON...`);
    let advice: string;
    let explanation: string;

    try {
      const parsed = JSON.parse(generatedText);
      console.log(`✅ [${requestId}] Successfully parsed JSON response`);
      advice = parsed.advice || generatedText;
      explanation = parsed.explanation || '';
    } catch (parseError) {
      console.warn(`⚠️ [${requestId}] Failed to parse as JSON, using as plain text:`, parseError);
      advice = generatedText;
      explanation = 'AI-generated farming advice based on your query.';
    }

    // Validate the final response
    if (!advice || advice.trim().length === 0) {
      console.error(`❌ [${requestId}] Empty advice generated`);
      return new Response(
        JSON.stringify({ error: 'AI generated empty advice. Please try again.' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const finalResponse = {
      advice: advice.trim(),
      explanation: explanation.trim(),
      sources: sources.length > 0 ? sources : undefined
    };

    console.log(`🎉 [${requestId}] Request completed successfully:`, {
      adviceLength: finalResponse.advice.length,
      explanationLength: finalResponse.explanation.length,
      sourcesCount: finalResponse.sources?.length || 0
    });

    return new Response(
      JSON.stringify(finalResponse), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error(`💥 [${requestId}] Unexpected error in generate-advice function:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    
    return new Response(
      JSON.stringify({ 
        error: `Unexpected server error: ${error.message || 'Unknown error'}. Please try again.`,
        requestId 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});