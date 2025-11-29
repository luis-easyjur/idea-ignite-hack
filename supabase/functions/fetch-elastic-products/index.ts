import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELASTIC_HOST = Deno.env.get('ELASTIC_HOST');
    const ELASTIC_API_KEY = Deno.env.get('ELASTIC_API_KEY');
    const ELASTIC_INDEX = Deno.env.get('ELASTIC_INDEX');

    if (!ELASTIC_HOST || !ELASTIC_API_KEY || !ELASTIC_INDEX) {
      throw new Error('Elasticsearch credentials not configured');
    }

    console.log('Fetching product data from Elasticsearch...');

    // Fetch documents with source filter - get 1000 docs for better stats
    const query = {
      size: 1000,
      _source: ["source", "raw_content.empresa_detentora", "raw_content.indicacao_uso", "raw_content.classe_categoria_agronomica"]
    };

    const response = await fetch(
      `${ELASTIC_HOST}${ELASTIC_INDEX}/_search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${ELASTIC_API_KEY}`,
        },
        body: JSON.stringify(query),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Elasticsearch error:', response.status, errorText);
      throw new Error(`Elasticsearch error: ${response.status}`);
    }

    const data = await response.json();
    const documents = data.hits?.hits?.map((hit: any) => hit._source) || [];
    
    console.log('Documents fetched:', documents.length);
    console.log('Total available:', data.hits?.total?.value);

    // Process documents manually
    const companiesMap = new Map<string, number>();
    const culturesMap = new Map<string, number>();
    const pestsMap = new Map<string, number>();
    const categoriesMap = new Map<string, number>();
    let agrofitCount = 0;
    let bioinsumosCount = 0;

    documents.forEach((doc: any) => {
      // Count sources
      if (doc.source === 'agrofit') agrofitCount++;
      if (doc.source === 'bioinsumos') bioinsumosCount++;

      // Extract companies
      const companies = doc.raw_content?.empresa_detentora || [];
      companies.forEach((comp: any) => {
        const name = comp?.nome;
        if (name && name.trim() && name !== 'N/A') {
          companiesMap.set(name, (companiesMap.get(name) || 0) + 1);
        }
      });

      // Extract cultures and pests from indicacao_uso
      const indicacoes = doc.raw_content?.indicacao_uso || [];
      indicacoes.forEach((ind: any) => {
        const cultura = ind?.cultura;
        if (cultura && cultura.trim() && cultura !== 'N/A') {
          culturesMap.set(cultura, (culturesMap.get(cultura) || 0) + 1);
        }

        const pragas = ind?.praga_nome_comum || [];
        pragas.forEach((praga: string) => {
          if (praga && praga.trim() && praga !== 'N/A') {
            pestsMap.set(praga, (pestsMap.get(praga) || 0) + 1);
          }
        });
      });

      // Extract categories
      const categories = doc.raw_content?.classe_categoria_agronomica || [];
      categories.forEach((cat: string) => {
        if (cat && cat.trim() && cat !== 'N/A') {
          categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
        }
      });
    });

    // Convert maps to sorted arrays
    const companies = Array.from(companiesMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const cultures = Array.from(culturesMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const pests = Array.from(pestsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const categories = Array.from(categoriesMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const result = {
      success: true,
      totals: {
        total: agrofitCount + bioinsumosCount,
        agrofit: agrofitCount,
        bioinsumos: bioinsumosCount,
        companies: companies.length,
        cultures: cultures.length
      },
      companies,
      cultures,
      pests,
      categories,
      sourceComparison: [
        { name: 'Defensivos (Agrofit)', value: agrofitCount },
        { name: 'Bioinsumos', value: bioinsumosCount }
      ]
    };

    console.log('Processed - Agrofit:', agrofitCount, 'Bioinsumos:', bioinsumosCount);
    console.log('Companies:', companies.length, 'Cultures:', cultures.length);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error fetching elastic products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
