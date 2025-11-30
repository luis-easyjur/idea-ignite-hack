export interface ElasticProduct {
  id: string;
  source: 'agrofit' | 'bioinsumos';
  titular_registro: string;
  nome_comercial?: string;
  classe_categoria: string[];
  indicacao_uso: ProductIndication[];
  ingrediente_ativo_nome: string[];
  grupo_quimico: string[];
  classificacao_toxicologica: string;
  formulacao: string;
  produto_biologico: boolean;
  produto_organico: boolean;
}

export interface ProductIndication {
  cultura: string;
  praga_nome_comum?: string[];
}

export interface ProductsListResponse {
  success: boolean;
  products: ElasticProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilters {
  search?: string;
  source?: 'agrofit' | 'bioinsumos' | '';
  empresa?: string;
  categoria?: string;
  cultura?: string;
}
