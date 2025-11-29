# AI Chat Quick - Edge Function

Edge Function para o chat rápido do header, utilizando RAG Hybrid para buscar contexto relevante.

## Funcionalidades

- **RAG Hybrid**: Busca contexto relevante usando busca híbrida (vetorial + textual)
- **Prompt Mínimo**: Usa apenas o contexto do RAG, sem dados estáticos
- **Resposta Rápida**: Otimizado para perguntas básicas e respostas rápidas
- **Integração Gemini**: Usa Google Gemini 2.0 Flash diretamente via Google AI API

## Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Supabase:

### Obrigatórias

- `GEMINI_API_KEY`: Chave da API do Google Gemini (obtenha em https://aistudio.google.com/apikey)

### Opcionais (RAG)

- `RAG_API_URL`: URL base da API RAG (ex: `https://api.exemplo.com`)
- `RAG_API_KEY`: Chave de autenticação da API RAG (se necessário)
- `RAG_COLLECTION_NAME`: Nome da coleção para busca (padrão: `"quick"`)
- `RAG_TOP_K`: Número de resultados a retornar do RAG (padrão: `10`)

## Como Configurar

1. Acesse o Supabase Dashboard
2. Vá em **Project Settings** > **Edge Functions** > **Secrets**
3. Adicione as variáveis de ambiente necessárias

## Endpoint RAG

A função espera que a API RAG tenha o seguinte endpoint:

**POST** `/rag/v3/hybrid`

**Request:**
```json
{
  "user_query": "string",
  "collection_name": "string",
  "top_k": 10
}
```

**Response:**
```json
{
  "strategy_used": "string",
  "results": [
    {
      "content": "string",
      "source": "string",
      "score": 0,
      "metadata": {}
    }
  ]
}
```

## Fluxo de Execução

1. Recebe a pergunta do usuário
2. Busca contexto relevante no RAG usando busca híbrida
3. Monta prompt mínimo com contexto do RAG
4. Envia para Gemini via Google AI API
5. Retorna resposta ao usuário

## Uso

A função é chamada automaticamente pelo componente `AIChatSidebar` quando o usuário envia uma mensagem no chat do header.

## Fallback

Se a API RAG não estiver configurada ou falhar, a função continuará funcionando, mas sem contexto adicional do RAG.

