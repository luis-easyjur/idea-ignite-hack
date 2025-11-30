// Função para consultar o Elasticsearch
export interface ElasticsearchHit {
  _index: string;
  _id: string;
  _score: number;
  _source: {
    raw_content: {
      titular_registro: string;
      documento_cadastrado: Array<{
        data_inclusao: string;
      }>;
    };
  };
}

export interface ElasticsearchResponse {
  hits: {
    hits: ElasticsearchHit[];
    total: {
      value: number;
    };
  };
}

import { supabase } from "@/integrations/supabase/client";

export async function fetchProductLaunches(): Promise<ElasticsearchResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-elasticsearch-data');

    if (error) {
      throw new Error(`Erro ao buscar dados: ${error.message}`);
    }

    if (!data) {
      throw new Error('Nenhum dado retornado da edge function');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data as ElasticsearchResponse;
  } catch (error) {
    console.error('Erro ao buscar dados do Elasticsearch:', error);
    throw error;
  }
}

