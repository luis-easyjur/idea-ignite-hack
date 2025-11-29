/**
 * Configuração de IDs de prompts para cada módulo
 * Estes valores devem ser configurados como variáveis de ambiente no Supabase
 */

export const PROMPT_IDS = {
  BASIC: import.meta.env.VITE_PROMPT_BASIC_ID || '',
  GENERAL: import.meta.env.VITE_PROMPT_GENERAL_ID || '',
  MARKET: import.meta.env.VITE_PROMPT_MARKET_ID || '',
  REGULATORY: import.meta.env.VITE_PROMPT_REGULATORY_ID || '',
  PATENTS: import.meta.env.VITE_PROMPT_PATENTS_ID || '',
  SCIENCE: import.meta.env.VITE_PROMPT_SCIENCE_ID || '',
} as const;

export type ModuleType = 'general' | 'market' | 'regulatory' | 'patents' | 'science';

export interface ModuleOption {
  value: ModuleType;
  label: string;
  description: string;
  promptId: string;
}

export const MODULE_OPTIONS: ModuleOption[] = [
  {
    value: 'general',
    label: 'Pesquisa Geral',
    description: 'Análise geral sem foco específico',
    promptId: PROMPT_IDS.GENERAL,
  },
  {
    value: 'market',
    label: 'Dados de Mercado',
    description: 'Market Intelligence: Tamanho de mercado, crescimento regional, comportamento por cultura (Cana, Milho, etc.). Fontes: Abisolo, IBGE, Conab',
    promptId: PROMPT_IDS.MARKET,
  },
  {
    value: 'regulatory',
    label: 'Dados Regulatórios',
    description: 'Regulatory Intelligence: Novos registros no MAPA, alterações ANVISA/IBAMA, monitoramento de moléculas. Fontes: MAPA, ANVISA, IBAMA',
    promptId: PROMPT_IDS.REGULATORY,
  },
  {
    value: 'patents',
    label: 'Propriedade Intelectual',
    description: 'Patentes: Patentes de concorrentes, vencimentos, royalties, liberdade de operação (FTO). Fontes: INPI, WIPO',
    promptId: PROMPT_IDS.PATENTS,
  },
  {
    value: 'science',
    label: 'Dados Científicos',
    description: 'Science & Tech: Artigos de alto impacto sobre novas tecnologias e moléculas. Identifica tendências de P&D',
    promptId: PROMPT_IDS.SCIENCE,
  },
];

/**
 * Obtém o ID do prompt baseado no tipo de módulo
 */
export function getPromptId(moduleType: ModuleType): string {
  const module = MODULE_OPTIONS.find((m) => m.value === moduleType);
  return module?.promptId || PROMPT_IDS.GENERAL;
}

