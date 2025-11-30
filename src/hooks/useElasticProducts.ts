import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductsListResponse, ProductFilters } from "@/types/products";

interface UseElasticProductsParams {
  page?: number;
  pageSize?: number;
  filters?: ProductFilters;
}

export const useElasticProducts = ({ 
  page = 1, 
  pageSize = 20, 
  filters = {} 
}: UseElasticProductsParams = {}) => {
  return useQuery({
    queryKey: ['elastic-products', page, pageSize, filters],
    queryFn: async (): Promise<ProductsListResponse> => {
      const { data, error } = await supabase.functions.invoke('list-elastic-products', {
        body: { page, pageSize, filters }
      });

      if (error) {
        throw new Error(`Erro ao buscar produtos: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Erro ao buscar produtos');
      }

      return data as ProductsListResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
