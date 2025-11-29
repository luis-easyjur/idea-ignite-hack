import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, messages, conversation_history } = await req.json();

    if (!query && (!messages || messages.length === 0)) {
      return new Response(
        JSON.stringify({ error: "Query ou messages são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Obter a última mensagem do usuário se não houver query direta
    const userQuery = query || (messages && messages.length > 0 
      ? messages.filter((m: any) => m.role === "user").pop()?.content 
      : null);

    if (!userQuery) {
      return new Response(
        JSON.stringify({ error: "É necessário uma pergunta do usuário" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Configuração do Supabase não encontrada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Coletar dados de todos os módulos em paralelo
    console.log("Coletando contexto de todos os módulos...");

    const [
      regulatoryData,
      patentsData,
      alertsData,
      regulatoryStats,
      patentsStats
    ] = await Promise.all([
      // Regulatory Records - últimos 50 registros
      supabase
        .from("regulatory_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
      
      // Patents - últimas 50 patentes
      supabase
        .from("patents")
        .select("*")
        .order("filing_date", { ascending: false })
        .limit(50),
      
      // Alerts - últimos 30 alertas
      supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30),
      
      // Estatísticas regulatórias
      supabase
        .from("regulatory_records")
        .select("status, category")
        .then(result => {
          if (result.error) return { data: null, error: result.error };
          const records = result.data || [];
          return {
            data: {
              total: records.length,
              by_status: records.reduce((acc: any, r: any) => {
                acc[r.status] = (acc[r.status] || 0) + 1;
                return acc;
              }, {}),
              by_category: records.reduce((acc: any, r: any) => {
                acc[r.category] = (acc[r.category] || 0) + 1;
                return acc;
              }, {})
            },
            error: null
          };
        }),
      
      // Estatísticas de patentes
      supabase
        .from("patents")
        .select("category, company, status")
        .then(result => {
          if (result.error) return { data: null, error: result.error };
          const patents = result.data || [];
          return {
            data: {
              total: patents.length,
              by_category: patents.reduce((acc: any, p: any) => {
                acc[p.category] = (acc[p.category] || 0) + 1;
                return acc;
              }, {}),
              by_company: patents.reduce((acc: any, p: any) => {
                acc[p.company] = (acc[p.company] || 0) + 1;
                return acc;
              }, {}),
              by_status: patents.reduce((acc: any, p: any) => {
                acc[p.status] = (acc[p.status] || 0) + 1;
                return acc;
              }, {})
            },
            error: null
          };
        })
    ]);

    // Estruturar contexto
    const context = {
      regulatory: {
        records: regulatoryData.data || [],
        stats: regulatoryStats.data || null,
        error: regulatoryData.error?.message || regulatoryStats.error?.message || null
      },
      patents: {
        records: patentsData.data || [],
        stats: patentsStats.data || null,
        error: patentsData.error?.message || patentsStats.error?.message || null
      },
      alerts: {
        records: alertsData.data || [],
        error: alertsData.error?.message || null
      },
      market: {
        // Estatísticas agregadas do dashboard
        total_market: "R$ 2.8B",
        growth_rate: "15.3%",
        categories: {
          foliar_nutrition: { products: 87, growth: "+12%" },
          biostimulants: { products: 64, growth: "+18%" },
          biodefensives: { products: 52, growth: "+25%" },
          adjuvants: { products: 43, growth: "+9%" },
          biofertilizers: { products: 38, growth: "+21%" }
        }
      },
      dashboard_stats: {
        new_registrations_30d: 24,
        patents_monitored: patentsStats.data?.total || 0,
        scientific_articles: 89,
        market_growth: "18.2%"
      }
    };

    // Preparar payload para API externa
    const payload = {
      query: userQuery,
      context: context,
      conversation_history: conversation_history || (messages ? messages.filter((m: any) => m.role !== "system") : [])
    };

    // Obter URL da API externa
    const externalApiUrl = Deno.env.get("EXTERNAL_AI_API_URL");
    const externalApiKey = Deno.env.get("EXTERNAL_AI_API_KEY");

    if (!externalApiUrl) {
      console.warn("EXTERNAL_AI_API_URL não configurada, retornando contexto apenas");
      return new Response(
        JSON.stringify({ 
          response: "API externa não configurada. Contexto coletado com sucesso.",
          context: context,
          payload: payload
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Chamar API externa
    console.log("Chamando API externa:", externalApiUrl);
    
    const apiHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (externalApiKey) {
      apiHeaders["Authorization"] = `Bearer ${externalApiKey}`;
      apiHeaders["X-API-Key"] = externalApiKey;
    }

    const apiResponse = await fetch(externalApiUrl, {
      method: "POST",
      headers: apiHeaders,
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Erro na API externa:", {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        error: errorText
      });

      return new Response(
        JSON.stringify({ 
          error: `Erro na API externa: ${apiResponse.status} ${apiResponse.statusText}`,
          details: errorText,
          context: context // Retornar contexto mesmo em caso de erro
        }),
        { status: apiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiData = await apiResponse.json();

    // Retornar resposta da API externa
    return new Response(
      JSON.stringify({ 
        response: apiData.response || apiData.answer || apiData.text || JSON.stringify(apiData),
        context: context, // Incluir contexto na resposta para debug
        metadata: apiData.metadata || null
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in insights-ai function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido",
        details: error instanceof Error ? error.stack : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

