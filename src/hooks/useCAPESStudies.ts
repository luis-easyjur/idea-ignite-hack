import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CAPESSearchParams, CAPESSearchResponse, CAPESStudy } from "@/types/capes";

export const useCAPESStudies = (params: CAPESSearchParams) => {
  return useQuery({
    queryKey: ['capes-studies', params],
    queryFn: async (): Promise<{ studies: CAPESStudy[]; total: number }> => {
      console.log('Fetching CAPES studies with params:', params);

      // Enviar parâmetros como objeto JSON simples
      const requestBody: Record<string, any> = {};
      if (params.query) requestBody.q = params.query;
      if (params.limit) requestBody.limit = params.limit;
      if (params.offset) requestBody.offset = params.offset;
      if (params.resource_id) requestBody.resource_id = params.resource_id;
      if (params.area) requestBody.area = params.area;
      if (params.institution) requestBody.institution = params.institution;
      if (params.year) requestBody.year = params.year;

      const { data, error } = await supabase.functions.invoke<CAPESSearchResponse>(
        'search-capes-studies',
        {
          body: requestBody,
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
