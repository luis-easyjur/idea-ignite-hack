import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados recentes (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Patentes recentes
    const { data: recentPatents } = await supabase
      .from('patents')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Registros regulatórios recentes
    const { data: recentRegulatory } = await supabase
      .from('regulatory_records')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Patentes próximas de expirar (próximos 6 meses)
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    
    const { data: expiringPatents } = await supabase
      .from('patents')
      .select('*')
      .lte('expiry_date', sixMonthsFromNow.toISOString())
      .gte('expiry_date', new Date().toISOString())
      .order('expiry_date', { ascending: true })
      .limit(5);

    // Preparar contexto para IA
    const context = {
      recentPatents: recentPatents || [],
      recentRegulatory: recentRegulatory || [],
      expiringPatents: expiringPatents || []
    };

    const systemPrompt = `Você é um analista de inteligência competitiva para o setor de especialidades agrícolas do Brasil.
Analise os dados fornecidos e gere alertas relevantes e acionáveis.

CATEGORIAS DE ALERTAS:
- regulatory_approval: Aprovações ou mudanças regulatórias importantes
- patent_expiry: Patentes próximas de expirar (oportunidade)
- competitor_launch: Novos produtos ou tecnologias de competidores
- new_publication: Publicações científicas relevantes
- market_change: Mudanças significativas no mercado

PRIORIDADES:
- critical: Ação imediata necessária, alto impacto
- high: Importante, requer atenção breve
- medium: Relevante, monitorar
- low: Informativo

Retorne EXATAMENTE 5 alertas no formato JSON.`;

    const userPrompt = `Dados recentes:

PATENTES RECENTES (${context.recentPatents.length}):
${context.recentPatents.map(p => `- ${p.title} (${p.company}) - Depositada em ${p.filing_date}`).join('\n')}

REGISTROS REGULATÓRIOS (${context.recentRegulatory.length}):
${context.recentRegulatory.map(r => `- ${r.product_name} (${r.company}) - Status: ${r.status}`).join('\n')}

PATENTES EXPIRANDO (${context.expiringPatents.length}):
${context.expiringPatents.map(p => `- ${p.title} (${p.company}) - Expira em ${p.expiry_date}`).join('\n')}

Gere 5 alertas relevantes baseados nesses dados.`;

    // Chamar Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_alerts",
            description: "Generate competitive intelligence alerts",
            parameters: {
              type: "object",
              properties: {
                alerts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      alert_type: { 
                        type: "string",
                        enum: ["regulatory_approval", "patent_expiry", "competitor_launch", "new_publication", "market_change"]
                      },
                      priority: { 
                        type: "string",
                        enum: ["critical", "high", "medium", "low"]
                      },
                      source: { type: "string" },
                      metadata: { type: "object" }
                    },
                    required: ["title", "description", "alert_type", "priority", "source"]
                  }
                }
              },
              required: ["alerts"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_alerts" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const alerts = JSON.parse(toolCall.function.arguments).alerts;

    return new Response(JSON.stringify({ 
      success: true,
      alerts,
      metadata: {
        generated_at: new Date().toISOString(),
        data_sources: {
          recent_patents: context.recentPatents.length,
          recent_regulatory: context.recentRegulatory.length,
          expiring_patents: context.expiringPatents.length
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-smart-alerts:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
