import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SmartAlert {
  title: string;
  description: string;
  alert_type: 'regulatory_approval' | 'patent_expiry' | 'competitor_launch' | 'new_publication' | 'market_change';
  priority: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  metadata?: Record<string, any>;
}

export interface SmartAlertsResponse {
  success: boolean;
  alerts: SmartAlert[];
  metadata?: {
    generated_at: string;
    data_sources: {
      recent_patents: number;
      recent_regulatory: number;
      expiring_patents: number;
    };
  };
}

export const useSmartAlerts = () => {
  return useQuery({
    queryKey: ['smart-alerts'],
    queryFn: async (): Promise<SmartAlertsResponse> => {
      const { data, error } = await supabase.functions.invoke('generate-smart-alerts');

      if (error) {
        throw new Error(`Erro ao gerar alertas inteligentes: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Erro ao gerar alertas');
      }

      return data as SmartAlertsResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};
