const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const ELASTICSEARCH_URL = 'https://elastic.easyjur.com/ubyagro-intelligence/_search';
const ELASTICSEARCH_API_KEY = 'Wk9iQUhwRUJnTVQ0OWZnVFNKMFk6cUF2ZUkyekxSR2FlRXgxeWNFRl82Zw==';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const requestBody = {
      _source: [
        'raw_content.titular_registro',
        'raw_content.documento_cadastrado.data_inclusao'
      ],
      query: {
        terms: {
          source: [
            'agrofit',
            'bioinsumos'
          ]
        }
      },
      size: 10000
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
      throw new Error(`Elasticsearch returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching Elasticsearch data:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

