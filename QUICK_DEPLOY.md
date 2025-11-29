# ⚡ Deploy Rápido - ai-chat-quick-test

## 📋 Passo a Passo Simplificado

### 1️⃣ Acesse o Supabase Dashboard
👉 https://supabase.com/dashboard/project/mtujvdqhuzjfbwlacupc

### 2️⃣ Vá em Edge Functions
- Menu lateral → **Edge Functions**

### 3️⃣ Crie a Função
- Clique em **"Deploy a new function"** ou **"Create a new function"**
- **Nome**: `ai-chat-quick-test`

### 4️⃣ Cole o Código
Copie TODO o conteúdo do arquivo:
```
supabase/functions/ai-chat-quick-test/index.ts
```

Cole no editor do Dashboard e clique em **Deploy**

### 5️⃣ Configure a Chave do Gemini
1. **Project Settings** → **Edge Functions** → **Secrets**
2. **Add new secret**:
   - Name: `GEMINI_API_KEY`
   - Value: [Sua chave do Google Gemini]
3. **Save**

### 6️⃣ Teste!
1. Volte para **Edge Functions**
2. Clique em `ai-chat-quick-test`
3. **Invoke function** com:
```json
{
  "message": "Olá, você está funcionando?"
}
```

---

## ✅ Pronto!

Agora você pode testar no app também! 🎉

