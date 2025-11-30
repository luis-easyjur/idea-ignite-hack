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

    // Buscar patentes com detalhes completos
    const { data: patents } = await supabase
      .from('patents')
      .select('*')
      .order('filing_date', { ascending: false })
      .limit(20);

    // Buscar registros regulatórios
    const { data: regulatory } = await supabase
      .from('regulatory_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    // Preparar dados para análise de correlação
    const context = {
      patents: patents || [],
      regulatory: regulatory || []
    };

    const systemPrompt = `Você é um analista de inteligência competitiva especializado em correlacionar dados do setor agrícola brasileiro.

Sua tarefa é identificar CORRELAÇÕES REAIS entre:
- Patentes depositadas
- Registros regulatórios (MAPA)
- Produtos comerciais

TIPOS DE CORRELAÇÃO:
1. Patent → Product: Patente levou a produto registrado
2. Research → Patent: Pesquisa científica gerou patente
3. Patent → Regulatory: Patente em processo de registro
4. Competitor Activity: Movimentos coordenados de competidores

Para cada correlação, calcule:
- Confiança (0-100%): Quão provável é a correlação
- Timeline: Duração estimada entre eventos
- Previsão: Quando esperar próximo evento

Retorne EXATAMENTE 3 correlações mais relevantes.`;

    const userPrompt = `Analise estes dados e identifique correlações:

PATENTES (${context.patents.length}):
${context.patents.slice(0, 10).map(p => `- ${p.title} | ${p.company} | Depositada: ${p.filing_date} | Status: ${p.status}`).join('\n')}

REGISTROS REGULATÓRIOS (${context.regulatory.length}):
${context.regulatory.slice(0, 10).map(r => `- ${r.product_name} | ${r.company} | Status: ${r.status} | Aprovação: ${r.approval_date || 'Pendente'}`).join('\n')}

Identifique as 3 correlações mais importantes.`;

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
            name: "identify_correlations",
            description: "Identify data correlations and predict outcomes",
            parameters: {
              type: "object",
              properties: {
                correlations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      company: { type: "string" },
                      type: { 
                        type: "string",
                        enum: ["patent_to_product", "research_to_patent", "patent_to_regulatory", "competitor_activity"]
                      },
                      events: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            type: { 
                              type: "string",
                              enum: ["science", "patent", "regulatory", "launch", "prediction"]
                            },
                            title: { type: "string" },
                            date: { type: "string" },
                            description: { type: "string" }
                          }
                        }
                      },
                      confidence: { type: "number", minimum: 0, maximum: 100 },
                      timeline_months: { type: "number" },
                      prediction: { type: "string" },
                      impact: { 
                        type: "string",
                        enum: ["high", "medium", "low"]
                      }
                    },
                    required: ["title", "company", "type", "events", "confidence"]
                  }
                }
              },
              required: ["correlations"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "identify_correlations" } }
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

    const correlations = JSON.parse(toolCall.function.arguments).correlations;

    return new Response(JSON.stringify({ 
      success: true,
      correlations,
      metadata: {
        generated_at: new Date().toISOString(),
        data_analyzed: {
          patents: context.patents.length,
          regulatory: context.regulatory.length
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-data-correlations:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
