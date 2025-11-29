import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      messages, 
      advanced = false, 
      module_id, 
      files, 
      context_ia_response 
    } = await req.json();
    
    // TESTE: Chave direta no código
    const GEMINI_API_KEY = "AIzaSyCYC4qCiZTvjsl2u4JVwAgB7izOtHfWJPQ";
    // const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "GEMINI_API_KEY não está configurada",
          details: "Configure a variável GEMINI_API_KEY no Supabase Dashboard (Settings → Edge Functions → Secrets)"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Se advanced e houver context_ia_response, usar diretamente (Context IA já retorna resposta completa)
    if (advanced && context_ia_response) {
      return new Response(
        JSON.stringify({ response: context_ia_response }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Contexto do dashboard para a IA (chat básico do header)
    const systemPrompt = `Você é um assistente de inteligência competitiva especializado no mercado de especialidades agrícolas brasileiro. 

Você tem acesso aos seguintes dados do dashboard:

MÉTRICAS PRINCIPAIS:
- Novos Registros no MAPA (30 dias): 24 registros (+12% vs mês anterior)
- Patentes Monitoradas no INPI: 156 patentes (+8 novas)
- Artigos Científicos na Embrapa: 89 artigos (+5% este trimestre)
- Crescimento do Mercado: 18.2% (Bioestimulantes em 2024)

ESPECIALIDADES AGRÍCOLAS:
1. Nutrição Foliar: 87 produtos ativos, +12% crescimento
2. Bioestimulantes: 64 produtos ativos, +18% crescimento
3. Biodefensivos: 52 produtos ativos, +25% crescimento
4. Adjuvantes: 43 produtos ativos, +9% crescimento
5. Biofertilizantes: 38 produtos ativos, +21% crescimento

PILARES DE INTELIGÊNCIA:
- Inteligência de Mercado: R$ 2.8B mercado total, +15.3% crescimento (fontes: IBGE, Abisolo)
- Dados Regulatórios: 142 registros em 2024, 38 pendentes (fontes: MAPA, ANVISA, IBAMA)
- Propriedade Intelectual: 234 patentes ativas, 12 vencendo em 2025 (fonte: INPI)
- Ciência & Tecnologia: 89 papers em 2024, 23 de alto impacto (fonte: Embrapa)

PRINCIPAIS CONCORRENTES:
1. Stoller do Brasil - Índice 95/100 (Muito Alta atividade)
2. FMC Agricultural Solutions - Índice 87/100 (Alta atividade)
3. UPL Brasil - Índice 82/100 (Alta atividade)
4. BASF Agricultural Solutions - Índice 78/100 (Moderada atividade)
5. Koppert Brasil - Índice 73/100 (Moderada atividade)

PROJEÇÕES DE MERCADO (2024-2027):
- Bioestimulantes: crescimento de 79% (R$ 1.9B → R$ 3.4B)
- Biodefensivos: crescimento de 100% (R$ 1.5B → R$ 3.0B)
- Biofertilizantes: crescimento de 114% (R$ 0.7B → R$ 1.5B)
- Nutrição Foliar: crescimento de 32% (R$ 2.8B → R$ 3.7B)
- Adjuvantes: crescimento de 56% (R$ 0.9B → R$ 1.4B)

OPORTUNIDADES IDENTIFICADAS:
1. Bioestimulantes com Nanotecnologia - 92% confiança, Alto impacto (fontes: Embrapa, INPI)
2. Biofertilizantes para Cana-de-Açúcar - 88% confiança, Alto impacto (fontes: IBGE, MAPA)
3. Adjuvantes Sustentáveis - 85% confiança, Médio impacto (fontes: IBAMA, MAPA)

TECNOLOGIAS EMERGENTES:
- RNA Interferência (RNAi) para Biodefensivos - Timeline: 2-3 anos
- CRISPR para Bioinsumos em Bioestimulantes - Timeline: 3-5 anos
- IA para Formulação Personalizada em Nutrição Foliar - Timeline: 1-2 anos

Sua função é ajudar a responder perguntas sobre esses dados, fazer análises comparativas, identificar tendências e fornecer insights estratégicos. Seja claro, objetivo e baseie suas respostas nos dados fornecidos. Quando relevante, cite as fontes (MAPA, INPI, Embrapa, IBGE, Abisolo, ANVISA, IBAMA).`;

    // Se advanced e houver context_ia_response como contexto adicional, adicionar ao system prompt
    let finalSystemPrompt = systemPrompt;
    if (advanced && context_ia_response) {
      finalSystemPrompt = `${systemPrompt}\n\nCONTEXTO ADICIONAL DOS ARQUIVOS ANEXADOS:\n${context_ia_response}`;
    }

    // Converter mensagens do formato OpenAI para formato Gemini
    // O Gemini requer alternância entre "user" e "model", então agrupamos mensagens consecutivas do mesmo role
    const filteredMessages = messages.filter((msg: any) => msg.role !== "system");
    
    const geminiContents: any[] = [];
    let lastRole: string | null = null;
    
    for (const msg of filteredMessages) {
      const geminiRole = msg.role === "assistant" ? "model" : "user";
      
      // Se for o mesmo role da mensagem anterior, combina o texto
      if (lastRole === geminiRole && geminiContents.length > 0) {
        const lastContent = geminiContents[geminiContents.length - 1];
        lastContent.parts[0].text += "\n\n" + msg.content;
      } else {
        // Nova mensagem com role diferente
        geminiContents.push({
          role: geminiRole,
          parts: [{ text: msg.content }],
        });
        lastRole = geminiRole;
      }
    }
    
    console.log("Mensagens convertidas para Gemini:", JSON.stringify(geminiContents, null, 2));

    const requestBody = {
      contents: geminiContents,
      systemInstruction: {
        parts: [{ text: finalSystemPrompt }],
      },
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    const model = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    // Validar que há pelo menos uma mensagem do usuário
    const hasUserMessage = geminiContents.some((msg: any) => msg.role === "user");
    if (!hasUserMessage) {
      console.error("Nenhuma mensagem do usuário encontrada");
      return new Response(
        JSON.stringify({ error: "É necessário pelo menos uma mensagem do usuário" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar que a primeira mensagem não é do modelo (Gemini requer que comece com user)
    if (geminiContents.length > 0 && geminiContents[0].role === "model") {
      console.warn("Primeira mensagem é do modelo, removendo para garantir formato correto");
      geminiContents.shift();
    }

    console.log("Chamando Gemini - URL:", url);
    console.log("Chamando Gemini - API Key presente:", !!GEMINI_API_KEY);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { raw: errorText };
      }
      
      console.error("Erro na resposta do Gemini:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      let errorMessage = "Erro ao conectar com a IA";
      
      if (response.status === 429) {
        errorMessage = "Limite de requisições atingido. Tente novamente em alguns instantes.";
      } else if (response.status === 400) {
        const errorDetail = errorData.error?.message || errorData.message || JSON.stringify(errorData);
        errorMessage = `Erro na requisição ao Gemini: ${errorDetail}`;
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = "Erro de autenticação. Verifique se a GEMINI_API_KEY está correta.";
      } else {
        const errorDetail = errorData.error?.message || errorData.message || JSON.stringify(errorData);
        errorMessage = `Erro ${response.status}: ${errorDetail}`;
      }

      return new Response(
        JSON.stringify({ error: errorMessage, details: errorData }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // Extrair resposta do formato Gemini
    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      !data.candidates[0].content.parts[0]
    ) {
      console.error("Formato de resposta inesperado:", data);
      return new Response(
        JSON.stringify({ error: "Formato de resposta inesperado da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in dashboard-ai-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
