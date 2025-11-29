# Variáveis de Ambiente Necessárias

Este documento lista todas as variáveis de ambiente necessárias para o funcionamento completo do sistema UbyAgro.

## Variáveis do Frontend (Vite)

Adicione estas variáveis no arquivo `.env` na raiz do projeto:

### Supabase (Obrigatórias)
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_aqui
```

### ContextoAI API (Para busca de prompts e integração futura)
```env
# URL da API ContextoAI (opcional, padrão: https://api.contextoai.com.br)
VITE_CONTEXT_IA_API_URL=https://api.contextoai.com.br

# Credenciais de autenticação
VITE_CONTEXT_IA_API_USER=seu_usuario_aqui
VITE_CONTEXT_IA_API_PASSWORD=sua_senha_aqui
```

### IDs de Prompts - Módulos de Insights
```env
# Chat Básico do Header (respostas rápidas, modelo LLM simples)
VITE_PROMPT_BASIC_ID=id_do_prompt_basico

# Pesquisa Geral (sem foco específico)
VITE_PROMPT_GENERAL_ID=24

# Dados de Mercado (Market Intelligence)
# Fontes: IBGE, Abisolo, Conab
VITE_PROMPT_MARKET_ID=25

# Dados Regulatórios (Regulatory Intelligence)
# Fontes: MAPA, ANVISA, IBAMA
VITE_PROMPT_REGULATORY_ID=26

# Propriedade Intelectual (Patentes)
# Fontes: INPI, WIPO
VITE_PROMPT_PATENTS_ID=27

# Dados Científicos (Science & Tech)
# Fontes: Artigos científicos de alto impacto
VITE_PROMPT_SCIENCE_ID=28
```

## Variáveis do Supabase (Edge Functions)

Configure estas variáveis no Supabase Dashboard (Settings → Edge Functions → Secrets):

### Gemini API
```env
GEMINI_API_KEY=sua_chave_gemini_aqui
```

## Descrição dos Módulos de Prompts

### Chat Básico do Header
- **ID Prompt**: `VITE_PROMPT_BASIC_ID`
- **Uso**: Chat rápido no header da aplicação
- **Características**: Respostas rápidas, modelo LLM simples, sem arquivos, sem seleção de módulo
- **Advanced**: `false`

### Pesquisa Geral
- **ID Prompt**: `VITE_PROMPT_GENERAL_ID`
- **Uso**: Quando nenhum módulo específico é selecionado

### A. Dados de Mercado (Market Intelligence)
- **ID Prompt**: `VITE_PROMPT_MARKET_ID`
- **Fontes**: IBGE, Abisolo, Conab
- **Objetivo**: Responder "Onde devo vender?" e "Qual cultura está crescendo?"

### B. Dados Regulatórios (Regulatory Intelligence)
- **ID Prompt**: `VITE_PROMPT_REGULATORY_ID`
- **Fontes**: MAPA, ANVISA, IBAMA
- **Objetivo**: Monitorar novos registros e alterações normativas

### C. Propriedade Intelectual (Patentes)
- **ID Prompt**: `VITE_PROMPT_PATENTS_ID`
- **Fontes**: INPI, WIPO
- **Objetivo**: Analisar patentes de concorrentes e liberdade de operação

### D. Dados Científicos (Science & Tech)
- **ID Prompt**: `VITE_PROMPT_SCIENCE_ID`
- **Fontes**: Artigos científicos de alto impacto
- **Objetivo**: Identificar tendências de P&D antes de virarem produtos

## Como Configurar

1. **Frontend**: Adicione as variáveis `VITE_*` no arquivo `.env` na raiz do projeto
2. **Supabase**: Configure as variáveis no Supabase Dashboard:
   - Acesse: Settings → Edge Functions → Secrets
   - Adicione cada variável individualmente
   - Clique em "Save"

## Notas Importantes

- As variáveis `VITE_*` são expostas ao cliente, então não inclua informações sensíveis além do necessário
- As credenciais da API ContextoAI (`VITE_CONTEXT_IA_API_USER` e `VITE_CONTEXT_IA_API_PASSWORD`) serão visíveis no código do cliente
- Para maior segurança, considere usar a edge function como proxy para chamadas à API ContextoAI
- Os IDs de prompts devem ser obtidos da plataforma ContextoAI após criar os prompts correspondentes
- Se `VITE_CONTEXT_IA_API_URL` não estiver configurada, o sistema usará o padrão `https://api.contextoai.com.br`
