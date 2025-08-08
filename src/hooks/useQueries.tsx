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
  created_at: string;
}

export const useQueries = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateAdviceWithAI = async (cleanedText: string, detectedLanguage: string | null, language: string): Promise<{ advice: string; explanation: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-advice', {
        body: {
          cleaned_query_text: cleanedText,
          detected_language: detectedLanguage,
          language: language
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate advice');
      }

      if (!data || !data.advice) {
        throw new Error('Invalid response from AI service');
      }

      return {
        advice: data.advice,
        explanation: data.explanation || 'AI-generated farming advice based on your query.'
      };
    } catch (error) {
      console.error('Error calling AI service:', error);
      // Fallback to basic advice
      return {
        advice: "For best results, consider your local soil conditions, climate, and crop variety. Consult with local agricultural experts for specific guidance.",
        explanation: "Unable to generate AI advice at this time. Please try again later."
      };
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
    if (!user) return;
    
    setLoading(true);
    try {
      // Preprocess the query
      const processed = preprocessQuery(queryText);
      
      // Validate the processed query
      if (!processed.isValid) {
        toast({
          title: "Invalid Query",
          description: processed.error || "Please enter a valid farming question.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { advice, explanation } = await generateAdviceWithAI(processed.cleanedText, processed.detectedLanguage, language);
      
      const { data, error } = await supabase
        .from('queries')
        .insert([{
          user_id: user.id,
          query_text: processed.cleanedText,
          original_query_text: processed.originalText,
          detected_language: processed.detectedLanguage,
          language,
          advice,
          explanation
        }])
        .select()
        .single();

      if (error) throw error;
      
      setQueries(prev => [data, ...prev.slice(0, 9)]);
      
      toast({
        title: "Query submitted",
        description: "Your agricultural query has been processed successfully!",
      });
      
      return data;
    } catch (error) {
      console.error('Error submitting query:', error);
      toast({
        title: "Error",
        description: "Failed to submit query. Please try again.",
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