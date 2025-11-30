import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Remove trailing slash from host if present
const ELASTIC_HOST = (Deno.env.get('ELASTIC_HOST') || 'https://elastic.easyjur.com').replace(/\/+$/, '');
const ELASTIC_API_KEY = Deno.env.get('ELASTIC_API_KEY');
const ELASTIC_INDEX = 'ubyagro-intelligence';

interface ElasticQuery {
  size: number;
  query: {
    bool: {
      must: Array<{ term?: Record<string, string>; exists?: { field: string } }>;
    };
  };
  aggs?: Record<string, unknown>;
}

async function queryElasticsearch(query: ElasticQuery) {
  const response = await fetch(`${ELASTIC_HOST}/${ELASTIC_INDEX}/_search`, {
    method: 'POST',
    headers: {
      'Authorization': `ApiKey ${ELASTIC_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Elasticsearch error: ${error}`);
  }

  return response.json();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { queryType, uf } = await req.json();

    let result;

    switch (queryType) {
      case 'municipios_por_uf':
        // Gráfico 1: Mapa de calor por UF
        result = await queryElasticsearch({
          size: 0,
          query: {
            bool: {
              must: [
                { term: { source: 'zarc' } },
                { exists: { field: 'metadata.uf' } }
              ]
            }
          },
          aggs: {
            municipios_por_uf: {
              terms: {
                field: 'metadata.uf.keyword',
                size: 30,
                order: { _count: 'desc' }
              }
            }
          }
        });
        break;

      case 'top_culturas':
        // Gráfico 2: Top 15 culturas
        result = await queryElasticsearch({
          size: 0,
          query: {
            bool: {
              must: [
                { term: { source: 'zarc' } },
                { exists: { field: 'metadata.nome' } }
              ]
            }
          },
          aggs: {
            top_culturas: {
              terms: {
                field: 'metadata.nome.keyword',
                size: 15,
                order: { _count: 'desc' }
              }
            }
          }
        });
        break;

      case 'culturas_por_uf':
        // Gráfico 3: Culturas de um estado específico
        if (!uf) {
          throw new Error('UF parameter required for culturas_por_uf query');
        }
        result = await queryElasticsearch({
          size: 0,
          query: {
            bool: {
              must: [
                { term: { source: 'zarc' } },
                { term: { 'metadata.uf.keyword': uf } },
                { exists: { field: 'metadata.nome' } }
              ]
            }
          },
          aggs: {
            culturas: {
              terms: {
                field: 'metadata.nome.keyword',
                size: 20,
                order: { _count: 'desc' }
              }
            }
          }
        });
        break;

      case 'municipios_detalhados_uf':
        // Mapa detalhado: Municípios de um estado específico
        if (!uf) {
          throw new Error('UF parameter required for municipios_detalhados_uf query');
        }
        result = await queryElasticsearch({
          size: 0,
          query: {
            bool: {
              must: [
                { term: { source: 'zarc' } },
                { term: { 'metadata.uf.keyword': uf } },
                { exists: { field: 'metadata.municipio' } }
              ]
            }
          },
          aggs: {
            municipios: {
              terms: {
                field: 'metadata.municipio.keyword',
                size: 1000, // MG tem ~850 municípios
                order: { _count: 'desc' }
              }
            }
          }
        });
        break;

      case 'cultura_risco':
        // Gráfico 4: Matrix de risco climático
        result = await queryElasticsearch({
          size: 0,
          query: {
            bool: {
              must: [
                { term: { source: 'zarc' } },
                { exists: { field: 'metadata.risco' } },
                { exists: { field: 'metadata.cultura' } }
              ]
            }
          },
          aggs: {
            cultura_risco: {
              composite: {
                size: 100,
                sources: [
                  { cultura: { terms: { field: 'metadata.cultura.keyword' } } },
                  { risco: { terms: { field: 'metadata.risco.keyword' } } }
                ]
              }
            }
          }
        });
        break;

      case 'top_obtentores':
        // Gráfico 5: Top obtentores
        result = await queryElasticsearch({
          size: 0,
          query: {
            bool: {
              must: [
                { term: { source: 'zarc' } },
                { exists: { field: 'metadata.nomeCompleto' } }
              ]
            }
          },
          aggs: {
            top_obtentores: {
              terms: {
                field: 'metadata.nomeCompleto.keyword',
                size: 15,
                order: { _count: 'desc' }
              }
            }
          }
        });
        break;

      case 'totals':
        // Totais gerais
        const [totalDocs, culturas, municipios, obtentores] = await Promise.all([
          queryElasticsearch({
            size: 0,
            query: { bool: { must: [{ term: { source: 'zarc' } }] } }
          }),
          queryElasticsearch({
            size: 0,
            query: { bool: { must: [{ term: { source: 'zarc' } }, { exists: { field: 'metadata.nome' } }] } },
            aggs: { unique: { cardinality: { field: 'metadata.nome.keyword' } } }
          }),
          queryElasticsearch({
            size: 0,
            query: { bool: { must: [{ term: { source: 'zarc' } }, { exists: { field: 'metadata.municipio' } }] } },
            aggs: { unique: { cardinality: { field: 'metadata.municipio.keyword' } } }
          }),
          queryElasticsearch({
            size: 0,
            query: { bool: { must: [{ term: { source: 'zarc' } }, { exists: { field: 'metadata.nomeCompleto' } }] } },
            aggs: { unique: { cardinality: { field: 'metadata.nomeCompleto.keyword' } } }
          })
        ]);

        result = {
          total: totalDocs.hits?.total?.value || 0,
          culturas: culturas.aggregations?.unique?.value || 0,
          municipios: municipios.aggregations?.unique?.value || 0,
          obtentores: obtentores.aggregations?.unique?.value || 0
        };
        break;

      default:
        throw new Error(`Unknown query type: ${queryType}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching ZARC data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});