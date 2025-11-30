import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MainTrend {
  title: string;
  description: string;
  growth_rate: string;
}

export interface Opportunity {
  title: string;
  description: string;
  potential: 'high' | 'medium' | 'low';
}

export interface Threat {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Forecast {
  scenario: string;
  key_predictions: string[];
  market_size_estimate: string;
}

export interface Recommendation {
  action: string;
  priority: 'high' | 'medium' | 'low';
  timeline: string;
}

export interface MarketInsights {
  main_trend: MainTrend;
  opportunities: Opportunity[];
  threats: Threat[];
  forecast_3_4_years: Forecast;
  recommendations: Recommendation[];
}

export interface MarketInsightsResponse {
  success: boolean;
  insights: MarketInsights;
  metadata?: {
    generated_at: string;
    data_analyzed: {
      patents: number;
      regulatory: number;
      companies: number;
      categories: number;
    };
  };
}

export const useMarketInsights = () => {
  return useQuery({
    queryKey: ['market-insights'],
    queryFn: async (): Promise<MarketInsightsResponse> => {
      const { data, error } = await supabase.functions.invoke('generate-market-insights');

      if (error) {
        throw new Error(`Erro ao gerar insights de mercado: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Erro ao gerar insights');
      }

      return data as MarketInsightsResponse;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    retry: 2,
  });
};
