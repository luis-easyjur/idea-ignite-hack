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
    const { competitorId, companyName } = await req.json();

    if (!competitorId || !companyName) {
      throw new Error("competitorId and companyName are required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Starting research for competitor: ${companyName} (ID: ${competitorId})`);

    const systemPrompt = `Você é um analista de inteligência competitiva especializado no setor agrícola brasileiro.

Para a empresa solicitada, pesquise e estruture informações sobre:

1. **REGISTROS REGULATÓRIOS** (MAPA/ANVISA/IBAMA)
   - Produtos registrados recentemente (últimos 12 meses)
   - Status de registros em andamento
   - Datas e tipos de registro
   
2. **PROPRIEDADE INTELECTUAL** (INPI/WIPO/Google Patents)
   - Patentes depositadas/concedidas
   - Pedidos de patente em andamento
   - Áreas tecnológicas principais

3. **MOVIMENTAÇÕES DE MERCADO**
   - Lançamentos de produtos
   - Expansões de portfólio
   - Parcerias estratégicas e aquisições
   - Expansões regionais

4. **NOTÍCIAS E EVENTOS**
   - Participações em feiras (Agrishow, Hortitec, etc)
   - Notícias relevantes dos últimos 3 meses
   - Comunicados de imprensa e anúncios oficiais

5. **ANÁLISE ESTRATÉGICA**
   - Principais forças competitivas identificadas
   - Áreas de foco e investimento
   - Tendências e posicionamento de mercado

Retorne um JSON válido com a seguinte estrutura:
{
  "regulatory": [{"product_name": "", "registration_number": "", "status": "", "date": "", "source_url": ""}],
  "patents": [{"patent_number": "", "title": "", "status": "", "filing_date": "", "source_url": ""}],
  "market_moves": [{"type": "", "description": "", "date": "", "source_url": ""}],
  "news": [{"title": "", "summary": "", "date": "", "source_url": ""}],
  "strategic_analysis": "Análise detalhada em texto..."
}

IMPORTANTE: Sempre inclua URLs das fontes para cada informação. Use pesquisa real para dados atualizados.`;

    const userPrompt = `Pesquise e analise a empresa "${companyName}" no setor agrícola brasileiro. 
    
Foque em:
- Dados dos últimos 12 meses
- Fontes brasileiras (MAPA, INPI, notícias nacionais)
- Informações verificáveis com URLs

Retorne JSON estruturado conforme especificado.`;

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
          { role: "user", content: userPrompt }
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
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      researchResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Fallback: create structured response from text
      researchResult = {
        regulatory: [],
        patents: [],
        market_moves: [],
        news: [],
        strategic_analysis: content
      };
    }

    // Calculate activity score based on findings
    const activityScore = Math.min(100, 
      (researchResult.regulatory?.length || 0) * 15 +
      (researchResult.patents?.length || 0) * 10 +
      (researchResult.market_moves?.length || 0) * 20 +
      (researchResult.news?.length || 0) * 5 +
      30 // Base score
    );

    // Extract all source URLs
    const sources = [
      ...(researchResult.regulatory?.map((r: any) => r.source_url) || []),
      ...(researchResult.patents?.map((p: any) => p.source_url) || []),
      ...(researchResult.market_moves?.map((m: any) => m.source_url) || []),
      ...(researchResult.news?.map((n: any) => n.source_url) || []),
    ].filter(Boolean);

    // Store research in database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: research, error: dbError } = await supabaseClient
      .from("competitor_research")
      .insert({
        competitor_id: competitorId,
        research_type: "full",
        result_json: researchResult,
        activity_score: activityScore,
        sources: sources,
        researched_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    console.log(`Research completed for ${companyName}. Score: ${activityScore}`);

    return new Response(
      JSON.stringify({
        success: true,
        research: {
          ...research,
          result_json: researchResult,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in research-competitor function:", error);
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
