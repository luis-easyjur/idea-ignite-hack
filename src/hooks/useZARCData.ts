import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AggregationBucket {
  key: string;
  doc_count: number;
}

interface ZARCTotals {
  total: number;
  culturas: number;
  municipios: number;
  obtentores: number;
}

interface MunicipiosPorUF {
  buckets: AggregationBucket[];
}

interface TopCulturas {
  buckets: AggregationBucket[];
}

interface CulturasPorUF {
  buckets: AggregationBucket[];
}

interface CulturaRiscoBucket {
  key: { cultura: string; risco: string };
  doc_count: number;
}

interface TopObtentores {
  buckets: AggregationBucket[];
}

async function fetchZARCData<T>(queryType: string, uf?: string): Promise<T> {
  const { data, error } = await supabase.functions.invoke('fetch-zarc-data', {
    body: { queryType, uf }
  });

  if (error) throw new Error(error.message);
  if (!data.success) throw new Error(data.error || 'Unknown error');
  
  return data.data;
}

export function useZARCTotals() {
  return useQuery({
    queryKey: ['zarc', 'totals'],
    queryFn: () => fetchZARCData<ZARCTotals>('totals'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useZARCMunicipiosPorUF() {
  return useQuery({
    queryKey: ['zarc', 'municipios_por_uf'],
    queryFn: async () => {
      const result = await fetchZARCData<{ aggregations: { municipios_por_uf: MunicipiosPorUF } }>('municipios_por_uf');
      return result.aggregations?.municipios_por_uf?.buckets || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useZARCTopCulturas() {
  return useQuery({
    queryKey: ['zarc', 'top_culturas'],
    queryFn: async () => {
      const result = await fetchZARCData<{ aggregations: { top_culturas: TopCulturas } }>('top_culturas');
      return result.aggregations?.top_culturas?.buckets || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useZARCCulturasPorUF(uf: string) {
  return useQuery({
    queryKey: ['zarc', 'culturas_por_uf', uf],
    queryFn: async () => {
      const result = await fetchZARCData<{ aggregations: { culturas: CulturasPorUF } }>('culturas_por_uf', uf);
      return result.aggregations?.culturas?.buckets || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!uf,
  });
}

export function useZARCCulturaRisco() {
  return useQuery({
    queryKey: ['zarc', 'cultura_risco'],
    queryFn: async () => {
      const result = await fetchZARCData<{ aggregations: { cultura_risco: { buckets: CulturaRiscoBucket[] } } }>('cultura_risco');
      return result.aggregations?.cultura_risco?.buckets || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useZARCTopObtentores() {
  return useQuery({
    queryKey: ['zarc', 'top_obtentores'],
    queryFn: async () => {
      const result = await fetchZARCData<{ aggregations: { top_obtentores: TopObtentores } }>('top_obtentores');
      return result.aggregations?.top_obtentores?.buckets || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}