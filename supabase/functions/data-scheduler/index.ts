import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting scheduled data sync...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results = {
      agrofit: null as any,
      patents: null as any,
      timestamp: new Date().toISOString(),
    };

    // Sync AGROFIT data (Embrapa - always runs)
    try {
      console.log('Invoking sync-agrofit-data...');
      const { data, error } = await supabase.functions.invoke('sync-agrofit-data');
      
      if (error) throw error;
      results.agrofit = data;
      console.log('AGROFIT sync completed:', data);
    } catch (error) {
      console.error('AGROFIT sync failed:', error);
      results.agrofit = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Sync patents data (only if API key is configured)
    try {
      console.log('Invoking sync-patents-data...');
      const { data, error } = await supabase.functions.invoke('sync-patents-data');
      
      if (error) throw error;
      results.patents = data;
      console.log('Patents sync completed:', data);
    } catch (error) {
      console.error('Patents sync failed:', error);
      results.patents = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in data scheduler:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
