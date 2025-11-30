const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const ELASTICSEARCH_URL = 'https://elastic.easyjur.com/ubyagro-intelligence/_search';
const ELASTICSEARCH_API_KEY = 'Wk9iQUhwRUJnTVQ0OWZnVFNKMFk6cUF2ZUkyekxSR2FlRXgxeWNFRl82Zw==';

interface ProductFilters {
  search?: string;
  source?: string;
  empresa?: string;
  categoria?: string;
  cultura?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { page = 1, pageSize = 20, filters = {} } = await req.json() as {
      page?: number;
      pageSize?: number;
      filters?: ProductFilters;
    };

    console.log('Fetching products:', { page, pageSize, filters });
    console.log('Using Elasticsearch URL:', ELASTICSEARCH_URL);
    console.log('CODE VERSION: 2.0 - Sort removed');

    const must: any[] = [
      {
        terms: {
          source: ['agrofit', 'bioinsumos']
        }
      }
    ];

    // Filtro de busca por texto
    if (filters.search && filters.search.trim()) {
      must.push({
        multi_match: {
          query: filters.search,
          fields: [
            'raw_content.titular_registro^2',
            'raw_content.nome_comercial^3',
            'raw_content.ingrediente_ativo_nome'
          ],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      });
    }

    // Filtro por fonte
    if (filters.source && filters.source !== '') {
      must.push({
        term: { source: filters.source }
      });
    }

    // Filtro por empresa
    if (filters.empresa && filters.empresa.trim()) {
      must.push({
        term: { 'raw_content.titular_registro.keyword': filters.empresa }
      });
    }

    // Filtro por categoria
    if (filters.categoria && filters.categoria.trim()) {
      must.push({
        term: { 'raw_content.classe_categoria.keyword': filters.categoria }
      });
    }

    // Filtro por cultura
    if (filters.cultura && filters.cultura.trim()) {
      must.push({
        nested: {
          path: 'raw_content.indicacao_uso',
          query: {
            term: { 'raw_content.indicacao_uso.cultura.keyword': filters.cultura }
          }
        }
      });
    }

    const from = (page - 1) * pageSize;

    const requestBody = {
      _source: [
        'source',
        'raw_content.titular_registro',
        'raw_content.nome_comercial',
        'raw_content.classe_categoria',
        'raw_content.indicacao_uso',
        'raw_content.ingrediente_ativo_nome',
        'raw_content.grupo_quimico',
        'raw_content.classificacao_toxicologica',
        'raw_content.formulacao',
        'raw_content.produto_biologico',
        'raw_content.produto_organico'
      ],
      query: {
        bool: { must }
      },
      from,
      size: pageSize
    };

    const response = await fetch(ELASTICSEARCH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `ApiKey ${ELASTICSEARCH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Elasticsearch error:', errorText);
      throw new Error(`Elasticsearch returned status ${response.status}`);
    }

    const data = await response.json();
    
    const products = data.hits.hits.map((hit: any) => ({
      id: hit._id,
      source: hit._source.source,
      titular_registro: hit._source.raw_content?.titular_registro || 'N/A',
      nome_comercial: hit._source.raw_content?.nome_comercial || '',
      classe_categoria: hit._source.raw_content?.classe_categoria || [],
      indicacao_uso: hit._source.raw_content?.indicacao_uso || [],
      ingrediente_ativo_nome: hit._source.raw_content?.ingrediente_ativo_nome || [],
      grupo_quimico: hit._source.raw_content?.grupo_quimico || [],
      classificacao_toxicologica: hit._source.raw_content?.classificacao_toxicologica || '',
      formulacao: hit._source.raw_content?.formulacao || '',
      produto_biologico: hit._source.raw_content?.produto_biologico || false,
      produto_organico: hit._source.raw_content?.produto_organico || false,
    }));

    const total = data.hits.total.value;
    const totalPages = Math.ceil(total / pageSize);

    return new Response(
      JSON.stringify({
        success: true,
        products,
        total,
        page,
        pageSize,
        totalPages
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        products: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
