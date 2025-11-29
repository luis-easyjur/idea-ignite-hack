# Variáveis de Ambiente Necessárias

Este documento lista todas as variáveis de ambiente necessárias para o funcionamento completo do sistema de chat avançado.

## Variáveis do Frontend (Vite)

Adicione estas variáveis no arquivo `.env` ou configure-as no ambiente de produção:

### Context IA API
```env
VITE_CONTEXT_IA_API_URL=https://api.contextia.com
VITE_CONTEXT_IA_API_KEY=sua_chave_api_aqui
```

### IDs de Prompts
```env
VITE_PROMPT_GENERAL_ID=id_do_prompt_geral
VITE_PROMPT_MARKET_ID=id_do_prompt_dados_de_mercado
VITE_PROMPT_REGULATORY_ID=id_do_prompt_dados_regulatorios
VITE_PROMPT_PATENTS_ID=id_do_prompt_patentes
VITE_PROMPT_SCIENCE_ID=id_do_prompt_dados_cientificos
```

## Variáveis do Supabase (Edge Functions)

Configure estas variáveis no Supabase Dashboard (Settings → Edge Functions → Secrets):

### Gemini API (já existente)
```env
GEMINI_API_KEY=sua_chave_gemini_aqui
```

### Context IA API (para uso nas edge functions, se necessário)
```env
CONTEXT_IA_API_URL=https://api.contextia.com
CONTEXT_IA_API_KEY=sua_chave_api_aqui
```

## Descrição dos Módulos

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

### Pesquisa Geral
- **ID Prompt**: `VITE_PROMPT_GENERAL_ID`
- **Uso**: Quando nenhum módulo específico é selecionado

## Como Configurar

1. **Frontend**: Adicione as variáveis `VITE_*` no arquivo `.env` na raiz do projeto
2. **Supabase**: Configure as variáveis no Supabase Dashboard:
   - Acesse: Settings → Edge Functions → Secrets
   - Adicione cada variável individualmente
   - Clique em "Save"

## Notas Importantes

- As variáveis `VITE_*` são expostas ao cliente, então não inclua informações sensíveis
- A `CONTEXT_IA_API_KEY` no frontend será visível no código do cliente
- Para maior segurança, considere usar a edge function como proxy para chamadas à API Context IA
- Os IDs de prompts devem ser obtidos da plataforma Context IA após criar os prompts correspondentes

