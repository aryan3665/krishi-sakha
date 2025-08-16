import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateAdviceRequest {
  cleaned_query_text?: string;
  detected_language?: string;
  language?: string;
  prompt?: string; // New format for enhanced queries
  model?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cleaned_query_text, detected_language, language }: GenerateAdviceRequest = await req.json();

    if (!cleaned_query_text) {
      return new Response(
        JSON.stringify({ error: 'Query text is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

Format your response as JSON with two fields:
- "advice": Practical, actionable farming advice
- "explanation": Brief explanation of why this advice works

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
        explanation: explanation.trim()
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
