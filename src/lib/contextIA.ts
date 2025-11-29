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
  userPrompt: string;
  contextoAiPromptId: string;
  advanced: boolean;
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
 * @param userPrompt Prompt/mensagem do usuário
 * @param contextoAiPromptId ID do prompt básico do ContextoAI
 * @returns Objeto JSON pronto para envio
 */
export function prepareBasicPayload(
  userPrompt: string,
  contextoAiPromptId: string
): BasicPayloadData {
  return {
    userPrompt,
    contextoAiPromptId,
    advanced: false,
  };
}
