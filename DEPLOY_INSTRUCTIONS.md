# 🚀 Guia de Deploy - Função ai-chat-quick-test

## Método 1: Via Supabase Dashboard (Mais Fácil) ⭐

### Passo 1: Acessar o Dashboard
1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: **mtujvdqhuzjfbwlacupc**

### Passo 2: Criar/Deployar a Função
1. No menu lateral, clique em **Edge Functions**
2. Você verá uma lista de funções existentes
3. Clique no botão **"Deploy a new function"** ou **"Create a new function"**

### Passo 3: Configurar a Função
1. **Nome da função**: `ai-chat-quick-test`
2. **Código**: Copie TODO o conteúdo do arquivo `supabase/functions/ai-chat-quick-test/index.ts`
3. Clique em **Deploy** ou **Save**

### Passo 4: Configurar Variáveis de Ambiente
1. No Dashboard, vá em **Project Settings** (ícone de engrenagem)
2. No menu lateral, clique em **Edge Functions**
3. Vá na aba **Secrets**
4. Clique em **Add new secret**
5. Configure:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Cole sua chave da API do Google Gemini
6. Clique em **Save**

### Passo 5: Testar
1. Volte para **Edge Functions**
2. Clique na função `ai-chat-quick-test`
3. Clique em **Invoke function**
4. Use este payload:
```json
{
  "message": "Olá, você está funcionando?"
}
```
5. Clique em **Invoke**
6. Você deve ver a resposta do Gemini!

---

## Método 2: Via Supabase CLI (Avançado)

### Instalar Supabase CLI

**Windows (PowerShell):**
```powershell
# Opção 1: Via npm (se tiver Node.js)
npm install -g supabase

# Opção 2: Via Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Linux/Mac:**
```bash
# Via npm
npm install -g supabase

# Ou via Homebrew (Mac)
brew install supabase/tap/supabase
```

### Fazer Login
```bash
supabase login
```

### Linkar ao Projeto
```bash
supabase link --project-ref mtujvdqhuzjfbwlacupc
```

### Deploy da Função
```bash
supabase functions deploy ai-chat-quick-test
```

### Configurar Secrets
```bash
supabase secrets set GEMINI_API_KEY=sua_chave_aqui
```

---

## ✅ Verificação

Após o deploy, você deve conseguir:

1. Ver a função listada em **Edge Functions** no Dashboard
2. Testar via Dashboard (Invoke function)
3. Testar via interface do app (componente GeminiTest)

---

## 🐛 Troubleshooting

### Erro: "Function not found"
- Verifique se o nome da função está exatamente como `ai-chat-quick-test`
- Certifique-se de que o deploy foi concluído com sucesso

### Erro: "GEMINI_API_KEY não está configurada"
- Verifique se adicionou a secret no Dashboard
- Certifique-se de que o nome está exatamente como `GEMINI_API_KEY` (case-sensitive)

### Erro: "401 Unauthorized"
- Verifique se está autenticado no Supabase
- Verifique as credenciais do projeto no frontend

---

## 📝 Próximos Passos

Após testar com sucesso:
1. ✅ Remova o componente de teste da página Index (se quiser)
2. ✅ Teste a função completa `ai-chat-quick` com RAG
3. ✅ Configure as variáveis do RAG (RAG_API_URL, RAG_API_KEY, etc.)

