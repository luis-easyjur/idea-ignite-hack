import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELASTIC_HOST = Deno.env.get('ELASTIC_HOST');
    const ELASTIC_API_KEY = Deno.env.get('ELASTIC_API_KEY');
    const ELASTIC_INDEX = Deno.env.get('ELASTIC_INDEX');

    if (!ELASTIC_HOST || !ELASTIC_API_KEY || !ELASTIC_INDEX) {
      console.error('Missing Elasticsearch credentials');
      throw new Error('Elasticsearch credentials not configured');
    }

    console.log('Testing Elasticsearch connection...');
    console.log('Host:', ELASTIC_HOST);
    console.log('Index:', ELASTIC_INDEX);

    // Test connection and fetch sample documents from agrofit source
    const agrofitQuery = {
      query: {
        bool: {
          filter: [
            { term: { source: "agrofit" } }
          ]
        }
      },
      size: 5
    };

    console.log('Fetching agrofit samples...');
    const agrofitResponse = await fetch(
      `${ELASTIC_HOST}${ELASTIC_INDEX}/_search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${ELASTIC_API_KEY}`,
        },
        body: JSON.stringify(agrofitQuery),
      }
    );

    if (!agrofitResponse.ok) {
      const errorText = await agrofitResponse.text();
      console.error('Elasticsearch agrofit error:', agrofitResponse.status, errorText);
      throw new Error(`Elasticsearch error: ${agrofitResponse.status} - ${errorText}`);
    }

    const agrofitData = await agrofitResponse.json();
    console.log('Agrofit total hits:', agrofitData.hits?.total?.value);

    // Fetch sample documents from bioinsumos source
    const bioinsumosQuery = {
      query: {
        bool: {
          filter: [
            { term: { source: "bioinsumos" } }
          ]
        }
      },
      size: 5
    };

    console.log('Fetching bioinsumos samples...');
    const bioinsumosResponse = await fetch(
      `${ELASTIC_HOST}${ELASTIC_INDEX}/_search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${ELASTIC_API_KEY}`,
        },
        body: JSON.stringify(bioinsumosQuery),
      }
    );

    if (!bioinsumosResponse.ok) {
      const errorText = await bioinsumosResponse.text();
      console.error('Elasticsearch bioinsumos error:', bioinsumosResponse.status, errorText);
      throw new Error(`Elasticsearch error: ${bioinsumosResponse.status} - ${errorText}`);
    }

    const bioinsumosData = await bioinsumosResponse.json();
    console.log('Bioinsumos total hits:', bioinsumosData.hits?.total?.value);

    // Extract sample documents
    const agrofitSamples = agrofitData.hits?.hits?.map((hit: any) => hit._source) || [];
    const bioinsumosSamples = bioinsumosData.hits?.hits?.map((hit: any) => hit._source) || [];

    // Log first sample of each to understand structure
    if (agrofitSamples.length > 0) {
      console.log('First agrofit sample structure:', JSON.stringify(agrofitSamples[0], null, 2));
    }
    if (bioinsumosSamples.length > 0) {
      console.log('First bioinsumos sample structure:', JSON.stringify(bioinsumosSamples[0], null, 2));
    }

    const result = {
      success: true,
      connection: 'OK',
      index: ELASTIC_INDEX,
      agrofit: {
        total: agrofitData.hits?.total?.value || 0,
        samples: agrofitSamples,
        fields: agrofitSamples.length > 0 ? Object.keys(agrofitSamples[0]) : []
      },
      bioinsumos: {
        total: bioinsumosData.hits?.total?.value || 0,
        samples: bioinsumosSamples,
        fields: bioinsumosSamples.length > 0 ? Object.keys(bioinsumosSamples[0]) : []
      }
    };

    console.log('Test completed successfully');
    console.log('Agrofit fields:', result.agrofit.fields);
    console.log('Bioinsumos fields:', result.bioinsumos.fields);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error testing Elasticsearch:', error);
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
