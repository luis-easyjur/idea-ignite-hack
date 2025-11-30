/**
 * Utilitários para integração com IA de Insights
 */

/**
 * Payload JSON para envio à IA de Insights (modo avançado)
 */
export interface InsightsPayloadData {
  userPrompt: string;
  contextoAiPromptId: string;
  moduleType: string;
  advanced: boolean;
}

/**
 * Payload JSON para envio à IA Básica (chat do header)
 */
export interface BasicPayloadData {
  query: string;
  collection_name: string;
  rag_mode: string;
  model_name: string;
  deep_research: boolean;
  top_k: number;
  prompt_id: number;
  id: string;
}

/**
 * Prepara o FormData para envio à IA de Insights
 * @param files Array de arquivos para enviar
 * @param userPrompt Prompt/mensagem do usuário
 * @param contextoAiPromptId ID do prompt do ContextoAI (do módulo selecionado)
 * @param moduleType Tipo do módulo selecionado
 * @returns FormData pronto para envio
 */
export function prepareInsightsPayload(
  files: File[],
  userPrompt: string,
  contextoAiPromptId: string,
  moduleType: string
): FormData {
  const formData = new FormData();

  // Adicionar arquivos ao FormData
  files.forEach((file) => {
    formData.append('files', file);
  });

  // Adicionar dados JSON como string
  const payloadData: InsightsPayloadData = {
    userPrompt,
    contextoAiPromptId,
    moduleType,
    advanced: true,
  };

  formData.append('data', JSON.stringify(payloadData));

  return formData;
}

/**
 * Prepara o payload básico para envio à IA (chat do header)
 * @param query Prompt/mensagem do usuário
 * @param promptId ID do prompt básico do ContextoAI (será convertido para número)
 * @param sessionId Hash da sessão do chat
 * @returns Objeto JSON pronto para envio
 */
/**
 * Envia dados para o Context IA (API externa)
 * @param files Array de arquivos para enviar
 * @param userPrompt Prompt do usuário
 * @param promptId ID do prompt (opcional)
 * @returns Promise com a resposta do servidor
 */
export async function sendToContextIA(
  files: File[],
  userPrompt: string,
  promptId?: string
): Promise<{ response: string }> {
  const formData = prepareInsightsPayload(
    files,
    userPrompt,
    promptId || "",
    "general"
  );

  const apiUrl = import.meta.env.VITE_CONTEXT_IA_API_URL;
  const apiUser = import.meta.env.VITE_CONTEXT_IA_API_USER;
  const apiPassword = import.meta.env.VITE_CONTEXT_IA_API_PASSWORD;

  if (!apiUrl || !apiUser || !apiPassword) {
    throw new Error("Configurações da API Context IA não encontradas");
  }

  // Fazer autenticação básica
  const authHeader = "Basic " + btoa(`${apiUser}:${apiPassword}`);

  const response = await fetch(`${apiUrl}/api/chat`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Erro ao enviar para Context IA: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export function prepareBasicPayload(
  query: string,
  promptId: string,
  sessionId: string
): BasicPayloadData {
  // Converter promptId para número, ou usar 0 se não for válido
  const promptIdNumber = promptId ? parseInt(promptId, 10) : 0;
  
  return {
    query,
    collection_name: "ubyagro-knowledge",
    rag_mode: "hybrid",
    model_name: "gemini-2.0-flash",
    deep_research: false,
    top_k: 50,
    prompt_id: isNaN(promptIdNumber) ? 0 : promptIdNumber,
    id: sessionId,
  };
}
