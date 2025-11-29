# AI Chat Quick Test - Função de Teste

Função de teste para validar a conexão com o Google Gemini API antes de integrar com o RAG.

## Uso

Esta função permite testar se a `GEMINI_API_KEY` está configurada corretamente e se a conexão com o Gemini está funcionando.

## Como Testar

### Via cURL

```bash
curl -X POST https://SEU_PROJETO.supabase.co/functions/v1/ai-chat-quick-test \
  -H "Authorization: Bearer SEU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, você está funcionando?"}'
```

### Via JavaScript/TypeScript

```typescript
const { data, error } = await supabase.functions.invoke("ai-chat-quick-test", {
  body: { message: "Olá, você está funcionando?" }
});

if (error) {
  console.error("Erro:", error);
} else {
  console.log("Resposta:", data.response);
  console.log("Teste:", data.test);
}
```

### Via Supabase Dashboard

1. Acesse **Edge Functions** > **ai-chat-quick-test**
2. Clique em **Invoke function**
3. Use o payload:
```json
{
  "message": "Olá, você está funcionando?"
}
```

## Resposta de Sucesso

```json
{
  "success": true,
  "response": "Olá! Sim, estou funcionando perfeitamente...",
  "test": "Conexão com Gemini funcionando corretamente!"
}
```

## Resposta de Erro

```json
{
  "error": "Descrição do erro",
  "status": 401,
  "details": {}
}
```

## Variáveis de Ambiente Necessárias

- `GEMINI_API_KEY`: Chave da API do Google Gemini

## Após o Teste

Se o teste funcionar, você pode usar a função `ai-chat-quick` que já inclui a integração com RAG.

