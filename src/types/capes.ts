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
  // Catálogo de Teses e Dissertações 2017-2020
  THESES_2017: '902bd63b-137f-4090-89e9-cab94f12c41d',
  THESES_2018: '638668a6-07da-4c7e-8aab-9044ae3cc753',
  THESES_2019: '8f4f2bce-2744-460a-8f14-f1648c7a16df',
  THESES_2020: 'e37df31a-f250-4405-8b21-ca7e5c7c1696',
} as const;
