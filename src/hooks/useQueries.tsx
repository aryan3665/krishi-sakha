import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';
import { preprocessQuery } from '@/utils/queryPreprocessor';
import { ragSystem, RAGResponse } from '@/services/ragSystem';

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
  sources?: any[];
  confidence?: number;
  factual_basis?: 'high' | 'medium' | 'low';
}

export const useQueries = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateAdviceWithRAG = async (queryText: string, language: string): Promise<RAGResponse> => {
    try {
      return await ragSystem.generateAdvice(queryText, language);
    } catch (error) {
      console.error('Error calling RAG system:', error);

      // Enhanced fallback response that's always helpful
      const isHindi = language === 'hi';
      const fallbackAnswer = isHindi ?
        `🌾 **कृषि सलाह** (सिस्टम त्रुटि के कारण सामान्य सुझाव)\n\n💡 **तत्काल सुझाव:**\n• अपनी मिट्टी की जांच कराएं\n• मौसम के अनुसार फसल का चयन करें\n• स्थानीय कृषि विशेषज्ञ से संपर्क करें\n• उ��ित सिंचाई और उर्वरक का प्रयोग करें\n\n📞 **सहायता:**\n• किसान कॉल सेंटर: 1800-180-1551\n• निकटतम कृषि केंद्र से मिलें\n\n⚠️ **नोट:** यह सामान्य सलाह है। विस्तृत जानकारी के लिए इंटरनेट कनेक्शन की जांच करें।` :
        `🌾 **Agricultural Advisory** (General guidance due to system error)\n\n💡 **Immediate Suggestions:**\n• Test your soil regularly for nutrients\n• Choose crops suitable for current season\n• Contact local agricultural extension office\n• Use appropriate irrigation and fertilization\n\n📞 **Support:**\n• Kisan Call Center: 1800-180-1551\n• Visit nearest Krishi Vigyan Kendra\n\n⚠️ **Note:** This is general advice. Check internet connection for detailed, data-driven guidance.`;

      return {
        answer: fallbackAnswer,
        sources: [],
        confidence: 0.4,
        factualBasis: 'low',
        generatedContent: ['General agricultural guidance'],
        disclaimer: "System temporarily unavailable - showing general farming guidance"
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

      const ragResponse = await generateAdviceWithRAG(queryText, language);

      const { data, error } = await supabase
        .from('queries')
        .insert([{
          user_id: user.id,
          query_text: processed.cleanedText,
          original_query_text: processed.originalText,
          detected_language: processed.detectedLanguage,
          language,
          advice: ragResponse.answer,
          explanation: ragResponse.disclaimer || `AI-generated advice with ${ragResponse.factualBasis} factual basis (${(ragResponse.confidence * 100).toFixed(0)}% confidence)`,
          sources: ragResponse.sources,
          confidence: ragResponse.confidence,
          factual_basis: ragResponse.factualBasis
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

      // Even if database submission fails, still provide the RAG response
      const ragResponse = await generateAdviceWithRAG(queryText, language);

      // Show warning but don't fail completely
      toast({
        title: "Partial Success",
        description: "Got advice but couldn't save to history. Response shown below.",
        variant: "default",
      });

      // Return a mock query object with the response
      const mockQuery = {
        id: `temp_${Date.now()}`,
        user_id: user?.id || 'temp',
        query_text: processed.cleanedText,
        original_query_text: processed.originalText,
        detected_language: processed.detectedLanguage,
        language,
        advice: ragResponse.answer,
        explanation: ragResponse.disclaimer || `Generated advice with ${ragResponse.factualBasis} factual basis`,
        created_at: new Date().toISOString(),
        sources: ragResponse.sources,
        confidence: ragResponse.confidence,
        factual_basis: ragResponse.factualBasis
      };

      return mockQuery;
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
