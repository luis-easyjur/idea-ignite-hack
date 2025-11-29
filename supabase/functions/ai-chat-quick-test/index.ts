import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Testa a conexão com o Gemini sem RAG
 */
async function testGeminiConnection(userMessage: string): Promise<Response> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

  if (!GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "GEMINI_API_KEY não está configurada",
        details: "Configure a variável GEMINI_API_KEY no Supabase Dashboard",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // System prompt simples para teste
  const systemPrompt = `Você é um assistente útil e amigável. Responda de forma clara e objetiva.`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ],
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

  console.log("Testando conexão com Gemini...");
  console.log("URL:", url.replace(GEMINI_API_KEY, "***"));
  console.log("Mensagem:", userMessage);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erro na resposta do Gemini:", response.status, errorData);

      let errorMessage = "Erro ao conectar com o Gemini";
      
      if (response.status === 429) {
        errorMessage = "Limite de requisições atingido. Tente novamente em alguns instantes.";
      } else if (response.status === 400) {
        errorMessage = `Erro na requisição: ${JSON.stringify(errorData)}`;
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = "Erro de autenticação. Verifique se a GEMINI_API_KEY está correta.";
      } else {
        errorMessage = `Erro ${response.status}: ${JSON.stringify(errorData)}`;
      }

      return new Response(
        JSON.stringify({
          error: errorMessage,
          status: response.status,
          details: errorData,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    console.log("Resposta recebida do Gemini:", JSON.stringify(data).substring(0, 200));

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
        JSON.stringify({
          error: "Formato de resposta inesperado da IA",
          details: data,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
        test: "Conexão com Gemini funcionando corretamente!",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return new Response(
      JSON.stringify({
        error: "Erro ao conectar com o Gemini",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({
          error: "Parâmetro 'message' é obrigatório",
          example: { message: "Olá, como você está?" },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return await testGeminiConnection(message);
  } catch (error) {
    console.error("Error in test function:", error);
    return new Response(
      JSON.stringify({
        error: "Erro ao processar requisição",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

