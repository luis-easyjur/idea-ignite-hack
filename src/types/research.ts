export interface Author {
  id: string;
  display_name: string;
  orcid?: string;
}

export interface Institution {
  id: string;
  display_name: string;
  ror?: string;
  country_code: string;
  type: string;
  lineage: string[];
}

export interface Authorship {
  author_position: "first" | "middle" | "last";
  author: Author;
  institutions: Institution[];
  countries: string[];
  is_corresponding: boolean;
  raw_author_name: string;
  raw_affiliation_strings: string[];
}

export interface Source {
  id: string;
  display_name: string;
  issn_l?: string;
  issn?: string[];
  is_oa: boolean;
  is_in_doaj: boolean;
  is_core: boolean;
  type: string;
}

export interface Location {
  id?: string;
  is_oa: boolean;
  landing_page_url?: string;
  pdf_url?: string | null;
  source?: Source;
  license?: string;
  license_id?: string;
  version?: string;
  is_accepted?: boolean;
  is_published?: boolean;
}

export interface Topic {
  id: string;
  display_name: string;
  score: number;
  subfield: {
    id: string;
    display_name: string;
  };
  field: {
    id: string;
    display_name: string;
  };
  domain: {
    id: string;
    display_name: string;
  };
}

export interface Keyword {
  id: string;
  display_name: string;
  score: number;
}

export interface Concept {
  id: string;
  wikidata?: string;
  display_name: string;
  level: number;
  score: number;
}

export interface MeshTerm {
  descriptor_ui: string;
  descriptor_name: string;
  qualifier_ui?: string;
  qualifier_name?: string;
  is_major_topic: boolean;
}

export interface SDG {
  id: string;
  display_name: string;
  score: number;
}

export interface OpenAccess {
  is_oa: boolean;
  oa_status: "gold" | "green" | "hybrid" | "bronze" | "closed";
  oa_url?: string;
  any_repository_has_fulltext?: boolean;
}

export interface APC {
  value: number;
  currency: string;
  value_usd: number;
}

export interface CitationPercentile {
  value: number;
  is_in_top_1_percent: boolean;
  is_in_top_10_percent: boolean;
}

export interface Study {
  id: string;
  doi?: string;
  title: string;
  display_name: string;
  relevance_score: number;
  publication_year: number;
  publication_date: string;
  language: string;
  type: string;
  
  // Acesso Aberto
  open_access: OpenAccess;
  
  // Autores
  authorships: Authorship[];
  institutions_distinct_count: number;
  countries_distinct_count: number;
  corresponding_author_ids: string[];
  
  // Métricas de Impacto
  cited_by_count: number;
  fwci?: number;
  citation_normalized_percentile?: CitationPercentile;
  cited_by_percentile_year?: {
    min: number;
    max: number;
  };
  
  // Tópicos e Conceitos
  primary_topic?: Topic;
  topics?: Topic[];
  keywords?: Keyword[];
  concepts?: Concept[];
  mesh?: MeshTerm[];
  
  // ODS
  sustainable_development_goals?: SDG[];
  
  // Localização/Publicação
  primary_location: Location;
  locations?: Location[];
  
  // Custos
  apc_list?: APC;
  apc_paid?: APC;
  
  // Referências
  referenced_works_count?: number;
  
  // Abstract
  abstract_inverted_index?: Record<string, number[]>;
  
  // Indexação
  indexed_in?: string[];
  
  // Metadata
  is_retracted: boolean;
  is_paratext: boolean;
}

export interface StudyFilters {
  search: string;
  yearRange: [number, number];
  type: string;
  oaStatus: string;
  domain: string;
  country: string;
  topPercentile: boolean;
}
