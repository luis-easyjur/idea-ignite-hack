/**
 * Utilitários para integração com Context IA API
 */

export interface ContextIAFile {
  name: string;
  content: string | ArrayBuffer;
  type: string;
  size: number;
}

export interface ContextIAResponse {
  response: string;
  metadata?: any;
}

/**
 * Converte um arquivo File para base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove o prefixo data:type;base64,
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Envia arquivos e contexto para Context IA
 * @param files Array de arquivos para enviar
 * @param userContext Contexto adicional do usuário
 * @param promptId ID do prompt a ser usado (opcional)
 * @returns Resposta da API Context IA
 */
export async function sendToContextIA(
  files: File[],
  userContext: string,
  promptId?: string
): Promise<ContextIAResponse> {
  const apiUrl = import.meta.env.VITE_CONTEXT_IA_API_URL;
  const apiKey = import.meta.env.VITE_CONTEXT_IA_API_KEY;

  if (!apiUrl) {
    throw new Error('VITE_CONTEXT_IA_API_URL não está configurada');
  }

  // Construir URL com id_prompt se fornecido
  let url = `${apiUrl}/chat`;
  if (promptId) {
    url += `?id_prompt=${encodeURIComponent(promptId)}`;
  }

  // Preparar arquivos para envio
  const fileData = await Promise.all(
    files.map(async (file) => ({
      name: file.name,
      content: await fileToBase64(file),
      type: file.type,
      size: file.size,
    }))
  );

  // Preparar payload
  const payload = {
    files: fileData,
    context: userContext,
  };

  // Headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['X-API-Key'] = apiKey;
  }

  // Fazer requisição
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Context IA API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}

