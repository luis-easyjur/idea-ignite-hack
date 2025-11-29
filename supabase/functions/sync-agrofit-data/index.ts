import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgroAPIProduct {
  numero_registro: string;
  nome_produto: string;
  nome_empresa_titular: string;
  situacao: string;
  ingrediente_ativo: string[];
  cultura_alvo: string[];
  data_registro?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting AGROFIT data sync...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch data from Embrapa AgroAPI
    // API Endpoint: https://api.cnptia.embrapa.br/agrofit/v1/produtos
    const agroApiUrl = 'https://api.cnptia.embrapa.br/agrofit/v1/produtos';
    
    console.log('Fetching data from Embrapa API...');
    const response = await fetch(agroApiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`AgroAPI returned status ${response.status}`);
    }

    const data = await response.json();
    const products = Array.isArray(data) ? data : data.produtos || [];

    console.log(`Fetched ${products.length} products from Embrapa`);

    // Transform and insert/update data
    let inserted = 0;
    let updated = 0;

    for (const product of products.slice(0, 100)) { // Limit to 100 for initial sync
      const record = {
        registration_number: product.numero_registro || `TEMP-${Date.now()}-${Math.random()}`,
        product_name: product.nome_produto || 'Produto sem nome',
        company: product.nome_empresa_titular || 'Empresa não informada',
        status: mapStatus(product.situacao),
        category: mapCategory(product.ingrediente_ativo?.[0]),
        active_ingredients: product.ingrediente_ativo || [],
        target_crops: product.cultura_alvo || [],
        submission_date: product.data_registro ? new Date(product.data_registro) : null,
        approval_date: product.situacao === 'Aprovado' ? new Date() : null,
        mapa_link: `https://agrofit.agricultura.gov.br/agrofit_cons/principal_agrofit_cons`,
        notes: `Importado da API Embrapa AgroAPI em ${new Date().toISOString()}`,
      };

      // Try to update first, then insert if not exists
      const { data: existing } = await supabase
        .from('regulatory_records')
        .select('id')
        .eq('registration_number', record.registration_number)
        .single();

      if (existing) {
        await supabase
          .from('regulatory_records')
          .update(record)
          .eq('id', existing.id);
        updated++;
      } else {
        await supabase
          .from('regulatory_records')
          .insert(record);
        inserted++;
      }
    }

    console.log(`Sync complete: ${inserted} inserted, ${updated} updated`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        updated,
        total: products.length,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing AGROFIT data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function mapStatus(situacao: string): 'approved' | 'under_analysis' | 'pre_registered' {
  const s = situacao?.toLowerCase() || '';
  if (s.includes('aprovado') || s.includes('deferido')) return 'approved';
  if (s.includes('análise') || s.includes('tramitação')) return 'under_analysis';
  return 'pre_registered';
}

function mapCategory(ingrediente: string): 'biostimulant' | 'biological' | 'fertilizer' | 'specialty' | 'conventional_pesticide' {
  const ing = ingrediente?.toLowerCase() || '';
  if (ing.includes('bio') || ing.includes('orgân')) return 'biological';
  if (ing.includes('estimul')) return 'biostimulant';
  if (ing.includes('fertil') || ing.includes('nutri')) return 'fertilizer';
  return 'specialty';
}
