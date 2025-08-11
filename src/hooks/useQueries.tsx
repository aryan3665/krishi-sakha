import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';
import { preprocessQuery } from '@/utils/queryPreprocessor';

export interface Query {
  id: string;
  user_id: string;
  query_text: string;
  original_query_text: string | null;
  detected_language: string | null;
  language: string;
  advice: string;
  explanation: string | null;
  sources?: string[] | null;
  created_at: string;
}

export const useQueries = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateAdviceWithAI = async (cleanedText: string, detectedLanguage: string | null, language: string): Promise<{ advice: string; explanation: string; sources?: string[] }> => {
    console.log('🚀 Starting AI advice generation:', { cleanedText, detectedLanguage, language });
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-advice', {
        body: {
          cleaned_query_text: cleanedText,
          detected_language: detectedLanguage,
          language: language,
          include_data_retrieval: true
        }
      });

      console.log('📡 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        const errorMessage = error.message || error.details || 'AI service error';
        throw new Error(`AI Service Error: ${errorMessage}`);
      }

      if (!data) {
        console.error('❌ No data received from edge function');
        throw new Error('No response received from AI service');
      }

      if (!data.advice) {
        console.error('❌ Invalid response structure:', data);
        throw new Error('Invalid AI response - missing advice');
      }

      console.log('✅ AI advice generated successfully:', { 
        adviceLength: data.advice?.length, 
        explanationLength: data.explanation?.length,
        sourcesCount: data.sources?.length 
      });

      return {
        advice: data.advice,
        explanation: data.explanation || 'AI-generated farming advice based on your query.',
        sources: data.sources
      };
    } catch (error: any) {
      console.error('💥 Error in generateAdviceWithAI:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Re-throw the error to be handled by submitQuery
      throw error;
    }
  };

  const fetchQueries = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('queries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setQueries(data || []);
    } catch (error) {
      console.error('Error fetching queries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch query history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitQuery = async (queryText: string, language: string) => {
    if (!user) {
      console.error('❌ No authenticated user found');
      toast({
        title: "Authentication Error",
        description: "Please sign in to submit queries.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('🔄 Starting query submission:', { queryText, language, userId: user.id });
    setLoading(true);
    
    try {
      // Preprocess the query
      console.log('🔍 Preprocessing query...');
      const processed = preprocessQuery(queryText);
      console.log('📋 Query preprocessing result:', processed);
      
      // Validate the processed query
      if (!processed.isValid) {
        console.warn('⚠️ Query validation failed:', processed.error);
        toast({
          title: "Invalid Query",
          description: processed.error || "Please enter a valid farming question.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('🤖 Generating AI advice...');
      const { advice, explanation, sources } = await generateAdviceWithAI(processed.cleanedText, processed.detectedLanguage, language);
      
      console.log('💾 Saving query to database...');
      const queryData = {
        user_id: user.id,
        query_text: processed.cleanedText,
        original_query_text: processed.originalText,
        detected_language: processed.detectedLanguage,
        language,
        advice,
        explanation,
        sources: sources ? JSON.stringify(sources) : null
      };
      
      console.log('📤 Database insert payload:', { 
        ...queryData, 
        adviceLength: advice?.length,
        sourcesCount: sources?.length 
      });

      const { data, error } = await supabase
        .from('queries')
        .insert([queryData])
        .select()
        .single();

      if (error) {
        console.error('❌ Database insertion error:', error);
        throw new Error(`Database Error: ${error.message} (Code: ${error.code})`);
      }
      
      console.log('✅ Query saved successfully:', data);
      setQueries(prev => [data, ...prev.slice(0, 9)]);
      
      toast({
        title: "Success!",
        description: "Your agricultural query has been processed successfully!",
      });
      
      return data;
    } catch (error: any) {
      console.error('💥 Query submission failed:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      });
      
      // Provide specific error messages based on error type
      let userMessage = "An unexpected error occurred. Please try again.";
      let suggestions: string[] = [];
      
      if (error.message?.includes('AI Service Error')) {
        userMessage = "AI service is temporarily unavailable.";
        suggestions = ["Try a simpler query", "Check your internet connection", "Try again in a moment"];
      } else if (error.message?.includes('Database Error')) {
        userMessage = "Failed to save your query.";
        suggestions = ["Check your internet connection", "Try again in a moment"];
      } else if (error.message?.includes('Network error') || error.message?.includes('fetch')) {
        userMessage = "Network connection problem.";
        suggestions = ["Check your internet connection", "Try again in a moment"];
      } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        userMessage = "Service is busy right now.";
        suggestions = ["Please wait a moment and try again"];
      }
      
      const fullDescription = suggestions.length > 0 
        ? `${userMessage} Suggestions: ${suggestions.join(', ')}`
        : userMessage;
      
      toast({
        title: "Error",
        description: fullDescription,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteQuery = async (queryId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('queries')
        .delete()
        .eq('id', queryId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setQueries(prev => prev.filter(q => q.id !== queryId));
      
      toast({
        title: "Query deleted",
        description: "The query has been removed from your history.",
      });
    } catch (error) {
      console.error('Error deleting query:', error);
      toast({
        title: "Error",
        description: "Failed to delete query. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchQueries();
    }
  }, [user]);

  return {
    queries,
    loading,
    submitQuery,
    deleteQuery,
    refetch: fetchQueries
  };
};