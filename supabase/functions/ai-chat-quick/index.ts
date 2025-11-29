import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RAGRequest {
  user_query: string;
  collection_name: string;
  top_k: number;
}

interface RAGResult {
  content: string;
  source: string;
  score: number;
  metadata?: Record<string, any>;
}

interface RAGResponse {
  strategy_used: string;
  results: RAGResult[];
}

/**
 * Busca contexto relevante no RAG usando busca híbrida
 */
async function fetchRAGHybrid(
  userQuery: string,
  collectionName: string,
  topK: number
): Promise<string> {
  const RAG_API_URL = Deno.env.get("RAG_API_URL");
  const RAG_API_KEY = Deno.env.get("RAG_API_KEY");

  if (!RAG_API_URL) {
    console.warn("RAG_API_URL not configured. Skipping RAG search.");
    return "";
  }

  try {
    const ragRequest: RAGRequest = {
      user_query: userQuery,
      collection_name: collectionName,
      top_k: topK,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (RAG_API_KEY) {
      headers["Authorization"] = `Bearer ${RAG_API_KEY}`;
    }

    const ragResponse = await fetch(`${RAG_API_URL}/rag/v3/hybrid`, {
      method: "POST",
      headers,
      body: JSON.stringify(ragRequest),
    });

    if (!ragResponse.ok) {
      console.error(
        `RAG API error: ${ragResponse.status} ${ragResponse.statusText}`
      );
      return "";
    }

    const ragData: RAGResponse = await ragResponse.json();

    if (!ragData.results || ragData.results.length === 0) {
      return "";
    }

    // Montar contexto a partir dos resultados do RAG
    let context = "\n\nCONTEXTO RELEVANTE DA BASE DE CONHECIMENTO:\n\n";
    
    ragData.results.forEach((result, index) => {
      context += `[${index + 1}] ${result.content}\n`;
      if (result.source) {
        context += `Fonte: ${result.source}`;
        if (result.score !== undefined) {
          context += ` (Relevância: ${(result.score * 100).toFixed(1)}%)`;
        }
        context += "\n";
      }
      context += "\n";
    });

    console.log(
      `RAG search completed. Strategy: ${ragData.strategy_used}, Results: ${ragData.results.length}`
    );

    return context;
  } catch (error) {
    console.error("Error fetching RAG context:", error);
    return "";
  }
}

/**
 * Chama o Gemini via Google AI API diretamente
 */
async function callGemini(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>
): Promise<Response> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  // Converter mensagens do formato OpenAI para formato Gemini
  const contents = messages
    .filter((msg) => msg.role !== "system") // System prompt vai separado
    .map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

  const requestBody = {
    contents: contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };

  const model = "gemini-2.0-flash-exp";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Gemini API error:", response.status, errorData);

    if (response.status === 429) {
      return new Response(
        JSON.stringify({
          error: "Limite de requisições atingido. Tente novamente em alguns instantes.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (response.status === 400) {
      return new Response(
        JSON.stringify({
          error: "Erro na requisição. Verifique os parâmetros enviados.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (response.status === 401 || response.status === 403) {
      return new Response(
        JSON.stringify({
          error: "Erro de autenticação. Verifique sua GEMINI_API_KEY.",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Erro ao conectar com a IA. Tente novamente mais tarde.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
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
    console.error("Unexpected Gemini response format:", data);
    return new Response(
      JSON.stringify({
        error: "Formato de resposta inesperado da IA.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const aiResponse = data.candidates[0].content.parts[0].text;

  return new Response(
    JSON.stringify({ response: aiResponse }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Mensagens são obrigatórias" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Pegar a última mensagem do usuário
    const userMessage = messages[messages.length - 1];
    const userQuery = userMessage.content;

    if (!userQuery || typeof userQuery !== "string") {
      return new Response(
        JSON.stringify({ error: "Pergunta do usuário é obrigatória" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Configurações do RAG
    const collectionName =
      Deno.env.get("RAG_COLLECTION_NAME") || "quick";
    const topK = parseInt(Deno.env.get("RAG_TOP_K") || "10", 10);

    // 1. Buscar contexto no RAG Hybrid
    const ragContext = await fetchRAGHybrid(userQuery, collectionName, topK);

    // 2. Montar system prompt mínimo com contexto do RAG
    let systemPrompt = `Você é um assistente especializado em inteligência competitiva para o mercado de especialidades agrícolas brasileiro.

Sua função é responder perguntas de forma clara, objetiva e baseada APENAS no contexto fornecido.${ragContext}

INSTRUÇÕES:
- Use APENAS as informações do contexto fornecido para responder
- Se não houver informação suficiente no contexto, diga claramente que não possui dados suficientes
- Cite as fontes quando mencionar informações específicas
- Seja conciso e direto nas respostas
- Se a pergunta não estiver relacionada ao contexto, informe educadamente que você só pode ajudar com questões sobre especialidades agrícolas`;

    // 3. Enviar para Gemini
    return await callGemini(systemPrompt, messages);
  } catch (error) {
    console.error("Error in ai-chat-quick function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

