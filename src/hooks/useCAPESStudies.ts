import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CAPESSearchParams, CAPESSearchResponse } from "@/types/capes";
import { Study } from "@/types/research";

export const useCAPESStudies = (params: CAPESSearchParams) => {
  return useQuery({
    queryKey: ['capes-studies', params],
    queryFn: async (): Promise<{ studies: Study[]; total: number }> => {
      console.log('Fetching CAPES studies with params:', params);

      const searchParams = new URLSearchParams();
      if (params.query) searchParams.set('q', params.query);
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.offset) searchParams.set('offset', params.offset.toString());
      if (params.resource_id) searchParams.set('resource_id', params.resource_id);
      if (params.area) searchParams.set('area', params.area);
      if (params.institution) searchParams.set('institution', params.institution);
      if (params.year) searchParams.set('year', params.year);

      const { data, error } = await supabase.functions.invoke<CAPESSearchResponse>(
        'search-capes-studies',
        {
          body: searchParams,
        }
      );

      if (error) {
        console.error('Error fetching CAPES studies:', error);
        throw new Error(error.message);
      }

      if (!data?.success) {
        console.error('CAPES API returned error:', data?.error);
        throw new Error(data?.error || 'Erro ao buscar estudos CAPES');
      }

      console.log('CAPES studies fetched:', data.data.total, 'total results');

      return {
        studies: data.data.studies,
        total: data.data.total,
      };
    },
    enabled: params.limit !== undefined && params.offset !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
