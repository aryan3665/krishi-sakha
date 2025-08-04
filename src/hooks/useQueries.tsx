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

  const generateMockAdvice = (query: string): { advice: string; explanation: string } => {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('पानी') || queryLower.includes('water') || queryLower.includes('irrigation')) {
      return {
        advice: "Ensure proper water management by checking soil moisture regularly. Water early morning or evening to minimize evaporation.",
        explanation: "Proper irrigation timing helps plants absorb water efficiently while reducing water loss through evaporation."
      };
    }
    
    if (queryLower.includes('खाद') || queryLower.includes('fertilizer') || queryLower.includes('nutrients')) {
      return {
        advice: "Use balanced NPK fertilizers and consider organic compost. Test soil pH before applying any fertilizers.",
        explanation: "Balanced nutrition ensures healthy plant growth. Soil testing helps determine specific nutrient needs."
      };
    }
    
    if (queryLower.includes('कीट') || queryLower.includes('pest') || queryLower.includes('insects')) {
      return {
        advice: "Use integrated pest management (IPM) approach. Try neem oil or beneficial insects before chemical pesticides.",
        explanation: "IPM reduces environmental impact while effectively managing pests through multiple strategies."
      };
    }
    
    if (queryLower.includes('बीज') || queryLower.includes('seed') || queryLower.includes('planting')) {
      return {
        advice: "Choose certified seeds suitable for your soil and climate. Follow proper spacing and planting depth guidelines.",
        explanation: "Quality seeds and proper planting techniques are fundamental for good crop establishment and yield."
      };
    }
    
    return {
      advice: "For best results, consider your local soil conditions, climate, and crop variety. Consult with local agricultural experts for specific guidance.",
      explanation: "Agricultural practices should be adapted to local conditions for optimal results."
    };
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

      const { advice, explanation } = generateMockAdvice(processed.cleanedText);
      
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