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

    // Query Elasticsearch - Filter only agricultural products (agrofit and bioinsumos)
    const query = {
      size: 1000,
      query: {
        bool: {
          filter: [
            {
              terms: { 
                source: ["agrofit", "bioinsumos"] 
              }
            }
          ]
        }
      },
      _source: [
        "source",
        "raw_content.titular_registro",
        "raw_content.indicacao_uso",
        "raw_content.classe_categoria_agronomica",
        "raw_content.ingrediente_ativo_detalhado",
        "raw_content.classificacao_toxicologica",
        "raw_content.formulacao",
        "raw_content.produto_biologico",
        "raw_content.produto_agricultura_organica"
      ]
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

    // Debug: Check which sources exist
    const sourcesFound = new Set<string>();
    documents.forEach((doc: any) => {
      if (doc.source) sourcesFound.add(doc.source);
    });
    console.log('Sources found in documents:', Array.from(sourcesFound));

    // Process documents manually
    const companiesMap = new Map<string, number>();
    const culturesMap = new Map<string, number>();
    const pestsMap = new Map<string, number>();
    const categoriesMap = new Map<string, number>();
    const ingredientsMap = new Map<string, number>();
    const chemicalGroupsMap = new Map<string, number>();
    const toxicityMap = new Map<string, number>();
    const formulationsMap = new Map<string, number>();
    let agrofitCount = 0;
    let bioinsumosCount = 0;
    let biologicalCount = 0;
    let organicCount = 0;

    documents.forEach((doc: any) => {
      // Count sources (case-insensitive and trimmed)
      const source = (doc.source || '').toLowerCase().trim();
      if (source === 'agrofit') {
        agrofitCount++;
      } else if (source === 'bioinsumos') {
        bioinsumosCount++;
      }

      // Count biological and organic products
      if (doc.raw_content?.produto_biologico) biologicalCount++;
      if (doc.raw_content?.produto_agricultura_organica) organicCount++;

      // Extract companies from titular_registro (correct field)
      const titularRegistro = doc.raw_content?.titular_registro;
      if (titularRegistro && typeof titularRegistro === 'string' && titularRegistro.trim() && titularRegistro !== 'N/A') {
        companiesMap.set(titularRegistro, (companiesMap.get(titularRegistro) || 0) + 1);
      }

      // Extract ingredients
      let ingredientesDetalhados = doc.raw_content?.ingrediente_ativo_detalhado;
      if (!ingredientesDetalhados) ingredientesDetalhados = [];
      else if (!Array.isArray(ingredientesDetalhados)) ingredientesDetalhados = [ingredientesDetalhados];
      
      ingredientesDetalhados.forEach((ing: any) => {
        const ingrediente = ing?.ingrediente_ativo;
        if (ingrediente && ingrediente.trim() && ingrediente !== 'N/A') {
          ingredientsMap.set(ingrediente, (ingredientsMap.get(ingrediente) || 0) + 1);
        }

        const grupoQuimico = ing?.grupo_quimico;
        if (grupoQuimico && grupoQuimico.trim() && grupoQuimico !== 'N/A') {
          chemicalGroupsMap.set(grupoQuimico, (chemicalGroupsMap.get(grupoQuimico) || 0) + 1);
        }
      });

      // Extract toxicity classification
      const toxicity = doc.raw_content?.classificacao_toxicologica;
      if (toxicity && typeof toxicity === 'string' && toxicity.trim()) {
        toxicityMap.set(toxicity, (toxicityMap.get(toxicity) || 0) + 1);
      }

      // Extract formulation
      const formulacao = doc.raw_content?.formulacao;
      if (formulacao && typeof formulacao === 'string' && formulacao.trim()) {
        formulationsMap.set(formulacao, (formulationsMap.get(formulacao) || 0) + 1);
      }

      // Extract cultures and pests from indicacao_uso - normalize to array
      let indicacoes = doc.raw_content?.indicacao_uso;
      if (!indicacoes) indicacoes = [];
      else if (!Array.isArray(indicacoes)) indicacoes = [indicacoes];
      
      indicacoes.forEach((ind: any) => {
        const cultura = ind?.cultura;
        if (cultura && cultura.trim() && cultura !== 'N/A') {
          culturesMap.set(cultura, (culturesMap.get(cultura) || 0) + 1);
        }

        // Normalize praga_nome_comum to array
        let pragas = ind?.praga_nome_comum;
        if (!pragas) pragas = [];
        else if (typeof pragas === 'string') pragas = [pragas];
        else if (!Array.isArray(pragas)) pragas = [];
        
        pragas.forEach((praga: string) => {
          if (praga && praga.trim() && praga !== 'N/A') {
            pestsMap.set(praga, (pestsMap.get(praga) || 0) + 1);
          }
        });
      });

      // Extract categories - normalize to array
      let categories = doc.raw_content?.classe_categoria_agronomica;
      if (!categories) categories = [];
      else if (typeof categories === 'string') categories = [categories];
      else if (!Array.isArray(categories)) categories = [categories];
      
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

    const ingredients = Array.from(ingredientsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const chemicalGroups = Array.from(chemicalGroupsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const toxicityLevels = Array.from(toxicityMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const formulations = Array.from(formulationsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const result = {
      success: true,
      totals: {
        total: documents.length,
        totalAvailable: data.hits?.total?.value || 0,
        agrofit: agrofitCount,
        bioinsumos: bioinsumosCount,
        other: 0,
        companies: companiesMap.size,
        cultures: culturesMap.size
      },
      companies,
      cultures,
      pests,
      categories,
      ingredients,
      chemicalGroups,
      toxicityLevels,
      formulations,
      biologicalProducts: {
        total: biologicalCount,
        organic: organicCount
      },
      sourceComparison: [
        { name: 'Defensivos (Agrofit)', value: agrofitCount },
        { name: 'Bioinsumos', value: bioinsumosCount }
      ]
    };

    console.log('Processed - Agrofit:', agrofitCount, 'Bioinsumos:', bioinsumosCount);
    console.log('Companies:', companiesMap.size, 'Cultures:', culturesMap.size);

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
