import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PatentResult {
  patent_number: string;
  title: string;
  abstract?: string;
  filing_date: string;
  grant_date?: string;
  assignee: string;
  inventors?: string[];
  status: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting patents data sync...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const searchApiKey = Deno.env.get('SEARCHAPI_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    if (!searchApiKey) {
      console.warn('SEARCHAPI_KEY not configured. Skipping sync.');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'SEARCHAPI_KEY not configured. Please add it in Settings > Secrets.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Search for agricultural patents in Brazil
    const queries = [
      'biostimulant agricultural Brazil',
      'biological pesticide Brazil',
      'agricultural specialty Brazil',
    ];

    let totalInserted = 0;
    let totalUpdated = 0;

    for (const query of queries) {
      console.log(`Searching patents for: ${query}`);

      // SearchAPI Google Patents endpoint
      const searchUrl = `https://www.searchapi.io/api/v1/search?engine=google_patents&q=${encodeURIComponent(query)}&country=BR&api_key=${searchApiKey}`;

      const response = await fetch(searchUrl);

      if (!response.ok) {
        console.error(`SearchAPI returned status ${response.status}`);
        continue;
      }

      const data = await response.json();
      const patents = data.organic_results || [];

      console.log(`Found ${patents.length} patents for query: ${query}`);

      for (const patent of patents) {
        const record = {
          patent_number: patent.patent_id || `TEMP-${Date.now()}-${Math.random()}`,
          title: patent.title || 'Título não disponível',
          abstract: patent.snippet || null,
          company: patent.assignee || 'Titular não informado',
          inventors: patent.inventor ? [patent.inventor] : [],
          filing_date: patent.filing_date || new Date().toISOString().split('T')[0],
          grant_date: patent.grant_date || null,
          expiry_date: patent.expiry_date || null,
          status: patent.status || 'Active',
          category: mapPatentCategory(query),
          inpi_link: patent.pdf_link || null,
          google_patents_link: patent.link || null,
        };

        // Try to update first, then insert if not exists
        const { data: existing } = await supabase
          .from('patents')
          .select('id')
          .eq('patent_number', record.patent_number)
          .single();

        if (existing) {
          await supabase
            .from('patents')
            .update(record)
            .eq('id', existing.id);
          totalUpdated++;
        } else {
          await supabase
            .from('patents')
            .insert(record);
          totalInserted++;
        }
      }
    }

    console.log(`Sync complete: ${totalInserted} inserted, ${totalUpdated} updated`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted: totalInserted,
        updated: totalUpdated,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing patents data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function mapPatentCategory(query: string): 'biostimulant' | 'biological' | 'fertilizer' | 'specialty' | 'conventional_pesticide' {
  if (query.includes('biostimulant')) return 'biostimulant';
  if (query.includes('biological')) return 'biological';
  if (query.includes('fertilizer')) return 'fertilizer';
  return 'specialty';
}
