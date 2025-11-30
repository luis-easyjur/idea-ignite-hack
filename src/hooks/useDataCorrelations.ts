import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CorrelationEvent {
  type: 'science' | 'patent' | 'regulatory' | 'launch' | 'prediction';
  title: string;
  date: string;
  description: string;
}

export interface DataCorrelation {
  id?: string;
  title: string;
  company: string;
  type: 'patent_to_product' | 'research_to_patent' | 'patent_to_regulatory' | 'competitor_activity';
  events: CorrelationEvent[];
  confidence?: number;
  timeline_months?: number;
  prediction?: string;
  impact?: 'high' | 'medium' | 'low';
}

export interface CorrelationsResponse {
  success: boolean;
  correlations: DataCorrelation[];
  metadata?: {
    generated_at: string;
    data_analyzed: {
      patents: number;
      regulatory: number;
    };
  };
}

export const useDataCorrelations = () => {
  return useQuery({
    queryKey: ['data-correlations'],
    queryFn: async (): Promise<CorrelationsResponse> => {
      const { data, error } = await supabase.functions.invoke('get-data-correlations');

      if (error) {
        throw new Error(`Erro ao buscar correlações: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Erro ao buscar correlações');
      }

      return data as CorrelationsResponse;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  });
};
