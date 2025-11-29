export interface CAPESStudyRecord {
  _id: number;
  NM_TESE_DISSERTACAO?: string;
  AN_BASE?: string;
  NM_PROGRAMA?: string;
  NM_ENTIDADE_ENSINO?: string;
  NM_GRAU_ACADEMICO?: string;
  NM_GRANDE_AREA_CONHECIMENTO?: string;
  NM_AREA_CONHECIMENTO?: string;
  NM_AUTOR?: string;
  DS_PALAVRA_CHAVE?: string;
  DS_RESUMO?: string;
}

export interface CAPESSearchParams {
  query?: string;
  limit?: number;
  offset?: number;
  resource_id?: string;
  area?: string;
  institution?: string;
  year?: string;
}

export interface CAPESSearchResponse {
  success: boolean;
  data: {
    studies: any[];
    total: number;
    limit: number;
    offset: number;
  };
  error?: string;
}

export const CAPES_RESOURCE_IDS = {
  THESES_2021_2024: 'a5e72d15-0c0b-4fcb-9471-4fca804d4cff',
  PRODUCTION_2021: '8e9bcb66-fdaf-4d8e-a906-a2c3ff2d3d60',
} as const;
