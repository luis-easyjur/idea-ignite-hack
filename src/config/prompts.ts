/**
 * Configuração de IDs de prompts para cada módulo
 * Estes valores devem ser configurados como variáveis de ambiente no Supabase
 */

export const PROMPT_IDS = {
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
    description: 'Market Intelligence - IBGE, Abisolo, Conab',
    promptId: PROMPT_IDS.MARKET,
  },
  {
    value: 'regulatory',
    label: 'Dados Regulatórios',
    description: 'Regulatory Intelligence - MAPA, ANVISA, IBAMA',
    promptId: PROMPT_IDS.REGULATORY,
  },
  {
    value: 'patents',
    label: 'Propriedade Intelectual',
    description: 'Patentes - INPI, WIPO',
    promptId: PROMPT_IDS.PATENTS,
  },
  {
    value: 'science',
    label: 'Dados Científicos',
    description: 'Science & Tech - Artigos científicos',
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

