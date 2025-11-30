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

    // Buscar estatísticas agregadas
    const { data: patentStats } = await supabase
      .from('patents')
      .select('category, company, filing_date, status')
      .order('filing_date', { ascending: false });

    const { data: regulatoryStats } = await supabase
      .from('regulatory_records')
      .select('category, company, status, approval_date')
      .order('created_at', { ascending: false });

    // Análise de tendências por categoria
    const categoryTrends: Record<string, number> = {};
    patentStats?.forEach(p => {
      categoryTrends[p.category] = (categoryTrends[p.category] || 0) + 1;
    });

    // Análise de atividade por empresa
    const companyActivity: Record<string, number> = {};
    patentStats?.forEach(p => {
      companyActivity[p.company] = (companyActivity[p.company] || 0) + 1;
    });

    const topCompanies = Object.entries(companyActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Análise temporal (últimos 12 meses)
    const monthlyActivity: Record<string, number> = {};
    patentStats?.forEach(p => {
      const month = new Date(p.filing_date).toISOString().slice(0, 7);
      monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
    });

    const context = {
      total_patents: patentStats?.length || 0,
      total_regulatory: regulatoryStats?.length || 0,
      category_trends: categoryTrends,
      top_companies: topCompanies,
      monthly_activity: monthlyActivity
    };

    const systemPrompt = `Você é um analista estratégico de mercado para especialidades agrícolas no Brasil.

Analise os dados agregados e gere insights acionáveis com PREVISÕES para 3-4 anos.

ESTRUTURA DO INSIGHT:
1. Tendência Principal: Maior movimento no mercado
2. Oportunidades: 2-3 oportunidades específicas
3. Ameaças: 2-3 riscos a monitorar
4. Previsão 3-4 anos: Cenário futuro baseado em dados
5. Recomendações: Ações específicas

Baseie suas previsões em:
- Velocidade de crescimento de categorias
- Atividade de P&D dos competidores
- Pipeline regulatório
- Tendências globais do setor

Seja ESPECÍFICO e ACIONÁVEL.`;

    const userPrompt = `Dados do mercado de especialidades agrícolas:

ESTATÍSTICAS GERAIS:
- Total de patentes: ${context.total_patents}
- Registros regulatórios: ${context.total_regulatory}

TENDÊNCIAS POR CATEGORIA:
${Object.entries(context.category_trends)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, count]) => `- ${cat}: ${count} patentes`)
  .join('\n')}

TOP 5 EMPRESAS MAIS ATIVAS:
${context.top_companies.map(c => `- ${c.name}: ${c.count} patentes`).join('\n')}

ATIVIDADE MENSAL (últimos meses):
${Object.entries(context.monthly_activity)
  .slice(-6)
  .map(([month, count]) => `- ${month}: ${count} patentes`)
  .join('\n')}

Gere um relatório de inteligência com insights e previsões para 3-4 anos.`;

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
            name: "generate_market_insights",
            description: "Generate market intelligence insights with 3-4 year forecasts",
            parameters: {
              type: "object",
              properties: {
                main_trend: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    growth_rate: { type: "string" }
                  }
                },
                opportunities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      potential: { type: "string", enum: ["high", "medium", "low"] }
                    }
                  }
                },
                threats: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      severity: { type: "string", enum: ["high", "medium", "low"] }
                    }
                  }
                },
                forecast_3_4_years: {
                  type: "object",
                  properties: {
                    scenario: { type: "string" },
                    key_predictions: { type: "array", items: { type: "string" } },
                    market_size_estimate: { type: "string" }
                  }
                },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                      timeline: { type: "string" }
                    }
                  }
                }
              },
              required: ["main_trend", "opportunities", "threats", "forecast_3_4_years", "recommendations"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_market_insights" } }
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

    const insights = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ 
      success: true,
      insights,
      metadata: {
        generated_at: new Date().toISOString(),
        data_analyzed: {
          patents: context.total_patents,
          regulatory: context.total_regulatory,
          companies: Object.keys(companyActivity).length,
          categories: Object.keys(categoryTrends).length
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-market-insights:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
