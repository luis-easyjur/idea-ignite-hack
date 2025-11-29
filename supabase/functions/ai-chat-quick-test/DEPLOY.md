# Como Fazer Deploy da Função de Teste

## Problema: "Failed to send a request to the Edge Function"

Este erro geralmente significa que a Edge Function não foi deployada no Supabase.

## Solução: Deploy da Função

### Opção 1: Via Supabase CLI (Recomendado)

1. **Instale o Supabase CLI** (se ainda não tiver):
```bash
npm install -g supabase
```

2. **Faça login no Supabase**:
```bash
supabase login
```

3. **Conecte ao seu projeto**:
```bash
supabase link --project-ref SEU_PROJECT_REF
```

4. **Faça o deploy da função**:
```bash
supabase functions deploy ai-chat-quick-test
```

### Opção 2: Via Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Edge Functions** no menu lateral
4. Clique em **Create a new function**
5. Nome da função: `ai-chat-quick-test`
6. Cole o conteúdo do arquivo `index.ts`
7. Clique em **Deploy**

### Opção 3: Via GitHub Actions (se configurado)

Se você tem CI/CD configurado, o deploy pode ser automático ao fazer push.

## Configurar Variáveis de Ambiente

Após o deploy, configure a variável de ambiente:

1. No Supabase Dashboard, vá em **Project Settings** → **Edge Functions** → **Secrets**
2. Adicione:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Sua chave da API do Google Gemini

## Verificar se o Deploy Funcionou

1. No Supabase Dashboard, vá em **Edge Functions**
2. Você deve ver `ai-chat-quick-test` na lista
3. Clique na função e depois em **Invoke function**
4. Use o payload:
```json
{
  "message": "Olá, você está funcionando?"
}
```

## Troubleshooting

### Erro: "Function not found"
- A função não foi deployada ou o nome está incorreto
- Verifique se o nome da função no código corresponde ao nome no Supabase

### Erro: "GEMINI_API_KEY não está configurada"
- Configure a variável de ambiente no Supabase Dashboard
- Project Settings → Edge Functions → Secrets

### Erro: "401 Unauthorized"
- Verifique se você está autenticado no Supabase
- Verifique se a chave anônima do Supabase está correta no frontend

### Erro: "500 Internal Server Error"
- Verifique os logs da Edge Function no Supabase Dashboard
- Edge Functions → ai-chat-quick-test → Logs

## Testar Localmente (Opcional)

Se quiser testar localmente antes de fazer deploy:

```bash
# Inicie o Supabase localmente
supabase start

# Execute a função localmente
supabase functions serve ai-chat-quick-test
```

