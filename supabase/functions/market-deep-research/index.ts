import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, title } = await req.json();

    if (!prompt || !title) {
      throw new Error("prompt and title are required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Starting market deep research: ${title}`);

    const systemPrompt = `Você é um analista sênior de inteligência de mercado especializado no setor agrícola brasileiro.

Conduza uma pesquisa aprofundada e estruturada sobre o tema solicitado.

Sua análise deve incluir:

1. **RESUMO EXECUTIVO** (2-3 parágrafos)
   - Síntese das principais descobertas
   - Contexto de mercado atual
   - Relevância estratégica

2. **ANÁLISE DE MERCADO**
   - Tamanho de mercado e crescimento
   - Principais players e participação
   - Segmentação e nichos
   - Tendências observadas

3. **ANÁLISE COMPETITIVA**
   - Principais concorrentes identificados
   - Posicionamento estratégico de cada player
   - Forças e fraquezas competitivas
   - Diferenciais tecnológicos

4. **PRODUTOS E TECNOLOGIAS**
   - Produtos/tecnologias líderes de mercado
   - Inovações recentes
   - Pipeline de lançamentos identificados
   - Registros regulatórios relevantes

5. **OPORTUNIDADES E AMEAÇAS**
   - Oportunidades de mercado não exploradas
   - Gaps competitivos identificados
   - Ameaças e barreiras de entrada
   - Riscos regulatórios

6. **INSIGHTS ESTRATÉGICOS**
   - Recomendações para posicionamento
   - Áreas prioritárias de investimento
   - Parcerias estratégicas potenciais
   - Próximos passos sugeridos

Retorne um JSON válido com a seguinte estrutura:
{
  "summary": "Resumo executivo em texto...",
  "key_findings": ["Descoberta 1", "Descoberta 2", ...],
  "market_analysis": {
    "size": "Descrição do tamanho de mercado",
    "growth": "Análise de crescimento",
    "players": [{"name": "Player", "market_share": "X%", "positioning": "Descrição"}],
    "trends": ["Tendência 1", "Tendência 2", ...]
  },
  "competitive_analysis": {
    "competitors": [{"name": "", "strengths": [], "weaknesses": [], "tech_differentials": []}]
  },
  "products_technologies": {
    "leading_products": [{"name": "", "description": "", "company": ""}],
    "recent_innovations": [{"description": "", "date": "", "company": ""}],
    "pipeline": [{"product": "", "company": "", "expected_launch": ""}]
  },
  "opportunities_threats": {
    "opportunities": ["Oportunidade 1", ...],
    "gaps": ["Gap 1", ...],
    "threats": ["Ameaça 1", ...],
    "regulatory_risks": ["Risco 1", ...]
  },
  "strategic_insights": {
    "recommendations": ["Recomendação 1", ...],
    "investment_priorities": ["Prioridade 1", ...],
    "potential_partnerships": ["Parceria 1", ...],
    "next_steps": ["Passo 1", ...]
  }
}

IMPORTANTE:
- Use dados reais e atualizados através da pesquisa Google
- Sempre inclua URLs das fontes para cada informação relevante
- Foque no mercado agrícola brasileiro
- Seja específico e baseie-se em dados verificáveis`;

    // Call Lovable AI Gateway with Google Search Grounding
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        tools: [{ googleSearch: {} }], // Enable Google Search Grounding
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI Response received");

    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    let researchResult;
    let summary = "";
    let keyFindings: string[] = [];
    
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      researchResult = JSON.parse(jsonString);
      
      summary = researchResult.summary || "";
      keyFindings = researchResult.key_findings || [];
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Fallback: use content as summary
      summary = content;
      researchResult = {
        summary: content,
        raw_analysis: content
      };
    }

    // Extract sources from the AI response metadata if available
    const sources: string[] = [];
    if (aiData.choices?.[0]?.message?.grounding_chunks) {
      aiData.choices[0].message.grounding_chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push(chunk.web.uri);
        }
      });
    }

    // Get user ID from request
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      );
      
      const { data: { user } } = await supabaseClient.auth.getUser();
      userId = user?.id;
    }

    // Store research in database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: report, error: dbError } = await supabaseClient
      .from("market_research_reports")
      .insert({
        title,
        prompt,
        result_json: researchResult,
        summary,
        key_findings: keyFindings,
        sources,
        created_by: userId,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    console.log(`Market research completed: ${title}`);

    return new Response(
      JSON.stringify({
        success: true,
        report: {
          ...report,
          result_json: researchResult,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in market-deep-research function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
