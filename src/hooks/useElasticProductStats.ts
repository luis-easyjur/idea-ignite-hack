import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ElasticProductStats {
  success: boolean;
  error?: string;
  totals: {
    total: number;
    totalAvailable: number;
    agrofit: number;
    bioinsumos: number;
    other: number;
    companies: number;
    cultures: number;
  };
  companies: Array<{
    name: string;
    count: number;
  }>;
  cultures: Array<{
    name: string;
    count: number;
  }>;
  pests: Array<{
    name: string;
    count: number;
  }>;
  categories: Array<{
    name: string;
    count: number;
  }>;
  ingredients: Array<{
    name: string;
    count: number;
  }>;
  chemicalGroups: Array<{
    name: string;
    count: number;
  }>;
  toxicityLevels: Array<{
    name: string;
    count: number;
  }>;
  formulations: Array<{
    name: string;
    count: number;
  }>;
  biologicalProducts: {
    total: number;
    organic: number;
  };
  sourceComparison: Array<{
    name: string;
    value: number;
  }>;
}

export const useElasticProductStats = () => {
  return useQuery({
    queryKey: ['elastic-product-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<ElasticProductStats>(
        'fetch-elastic-products'
      );

      if (error) {
        console.error('Error fetching elastic products:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch product data');
      }

      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });
};
