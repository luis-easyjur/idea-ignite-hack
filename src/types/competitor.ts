export interface Competitor {
  id: string;
  name: string;
  segment?: string;
  website?: string;
  cnpj?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegistroRegulatorio {
  product_name: string;
  registration_number: string;
  status: string;
  date: string;
  source_url: string;
}

export interface PatentInfo {
  patent_number: string;
  title: string;
  status: string;
  filing_date: string;
  source_url: string;
}

export interface MarketMove {
  type: string; // "launch", "partnership", "acquisition", "expansion"
  description: string;
  date: string;
  source_url: string;
}

export interface NewsItem {
  title: string;
  summary: string;
  date: string;
  source_url: string;
}

export interface ResearchResult {
  regulatory: RegistroRegulatorio[];
  patents: PatentInfo[];
  market_moves: MarketMove[];
  news: NewsItem[];
  strategic_analysis: string;
}

export interface CompetitorResearch {
  id: string;
  competitor_id: string;
  research_type: string;
  activity_score: number;
  sources: string[];
  researched_at: string;
  result_json: ResearchResult;
}
