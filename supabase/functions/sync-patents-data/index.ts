import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GooglePatentResult {
  patent_id: string;
  publication_number?: string;
  title: string;
  snippet?: string;
  filing_date?: string;
  priority_date?: string;
  publication_date?: string;
  grant_date?: string;
  assignee?: string;
  inventor?: string;
  inventors?: string[];
  status?: string;
  link?: string;
  pdf_link?: string;
  thumbnail?: string;
  country_code?: string;
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

    // Enhanced search queries for Brazilian agricultural patents
    const queries = [
      'bioestimulante agrícola Brasil',
      'biostimulant agricultural Brazil',
      'defensivo biológico Brasil',
      'biological pesticide Brazil',
      'nutrição foliar Brasil',
      'foliar nutrition Brazil',
      'biodefensivo Brasil',
      'adjuvante agrícola Brasil',
      'agricultural adjuvant Brazil',
      'biofertilizante Brasil',
      'biofertilizer Brazil',
      'controle biológico pragas Brasil',
      'biological pest control Brazil',
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
        // Extract inventors array
        let inventorsList: string[] = [];
        if (patent.inventor) {
          inventorsList = [patent.inventor];
        }
        if (patent.inventors && Array.isArray(patent.inventors)) {
          inventorsList = [...inventorsList, ...patent.inventors];
        }

        const record = {
          patent_number: patent.patent_id || `TEMP-${Date.now()}-${Math.random()}`,
          publication_number: patent.publication_number || patent.patent_id || null,
          title: patent.title || 'Título não disponível',
          abstract: patent.snippet || null,
          company: patent.assignee || 'Titular não informado',
          inventors: inventorsList.length > 0 ? inventorsList : null,
          filing_date: patent.filing_date || new Date().toISOString().split('T')[0],
          priority_date: patent.priority_date || null,
          publication_date: patent.publication_date || null,
          grant_date: patent.grant_date || null,
          expiry_date: calculateExpiryDate(patent.filing_date, patent.grant_date),
          status: patent.status || (patent.grant_date ? 'Granted' : 'Pending'),
          category: mapPatentCategory(query),
          inpi_link: patent.pdf_link || null,
          google_patents_link: patent.link || null,
          thumbnail_url: patent.thumbnail || null,
          pdf_url: patent.pdf_link || null,
          language: query.includes('Brasil') ? 'pt' : 'en',
          country_status: patent.country_code ? { [patent.country_code]: patent.status || 'Active' } : {},
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

function mapPatentCategory(query: string): 'foliar_nutrition' | 'biostimulants' | 'biodefensives' | 'adjuvants' | 'biofertilizers' {
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('biostimul') || lowerQuery.includes('bioestimul')) return 'biostimulants';
  if (lowerQuery.includes('biologic') || lowerQuery.includes('pesticide') || lowerQuery.includes('defensiv') || lowerQuery.includes('controle')) return 'biodefensives';
  if (lowerQuery.includes('fertiliz') || lowerQuery.includes('biofertil')) return 'biofertilizers';
  if (lowerQuery.includes('adjuvant') || lowerQuery.includes('adjuvante')) return 'adjuvants';
  if (lowerQuery.includes('foliar') || lowerQuery.includes('nutrição')) return 'foliar_nutrition';
  return 'foliar_nutrition';
}

function calculateExpiryDate(filingDate?: string, grantDate?: string): string | null {
  if (!filingDate) return null;
  
  try {
    const filing = new Date(filingDate);
    // Patents typically expire 20 years from filing date
    const expiry = new Date(filing);
    expiry.setFullYear(expiry.getFullYear() + 20);
    return expiry.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error calculating expiry date:', error);
    return null;
  }
}
