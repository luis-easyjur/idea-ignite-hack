import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { study } = await req.json();
    
    if (!study) {
      throw new Error("Study data is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing study:", study.titulo);

    const systemPrompt = `Você é um especialista em análise de pesquisa acadêmica no setor agrícola brasileiro.

Analise o estudo científico fornecido e gere uma resposta estruturada em Markdown com estas seções:

## 📊 ANÁLISE CRÍTICA

(2-3 parágrafos sobre)
- Relevância científica e metodológica
- Pontos fortes e limitações identificadas
- Contribuição para a área de conhecimento

## 📋 RESUMO DOS RESULTADOS

(Lista em bullet points)
- Principais descobertas
- Metodologia empregada
- Conclusões-chave

## 💡 INSIGHTS ESTRATÉGICOS

(Lista em bullet points)
- Aplicações práticas no agronegócio
- Oportunidades de mercado identificadas
- Relevância para inovação e P&D
- Potenciais impactos regulatórios

Use linguagem técnica mas acessível. Foque em aplicações práticas e valor estratégico.`;

    const studyContext = `
**Título:** ${study.titulo}

**Tipo:** ${study.tipo} (${study.ano})

**Autor:** ${study.autor}
${study.orientador ? `**Orientador:** ${study.orientador}` : ''}

**Instituição:** ${study.instituicao} - ${study.siglaUF}

**Programa:** ${study.programa}

**Área do Conhecimento:** ${study.areaConhecimento}
**Grande Área:** ${study.grandeArea}
${study.linhaPesquisa ? `**Linha de Pesquisa:** ${study.linhaPesquisa}` : ''}

**Palavras-chave:** ${study.palavrasChave.join(', ')}

${study.resumo ? `**Resumo:**\n${study.resumo}` : ''}
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: studyContext }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error("No analysis generated");
    }

    console.log("Analysis generated successfully");

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in analyze-study-ai:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
