export interface MarketPlayer {
  name: string;
  market_share?: string;
  positioning: string;
}

export interface MarketAnalysis {
  size: string;
  growth: string;
  players: MarketPlayer[];
  trends: string[];
}

export interface CompetitorAnalysis {
  name: string;
  strengths: string[];
  weaknesses: string[];
  tech_differentials: string[];
}

export interface LeadingProduct {
  name: string;
  description: string;
  company: string;
}

export interface RecentInnovation {
  description: string;
  date: string;
  company: string;
}

export interface PipelineProduct {
  product: string;
  company: string;
  expected_launch: string;
}

export interface ProductsTechnologies {
  leading_products: LeadingProduct[];
  recent_innovations: RecentInnovation[];
  pipeline: PipelineProduct[];
}

export interface OpportunitiesThreats {
  opportunities: string[];
  gaps: string[];
  threats: string[];
  regulatory_risks: string[];
}

export interface StrategicInsights {
  recommendations: string[];
  investment_priorities: string[];
  potential_partnerships: string[];
  next_steps: string[];
}

export interface MarketResearchResult {
  summary: string;
  key_findings: string[];
  market_analysis?: MarketAnalysis;
  competitive_analysis?: {
    competitors: CompetitorAnalysis[];
  };
  products_technologies?: ProductsTechnologies;
  opportunities_threats?: OpportunitiesThreats;
  strategic_insights?: StrategicInsights;
  raw_analysis?: string;
}

export interface MarketResearchReport {
  id: string;
  title: string;
  prompt: string;
  result_json: MarketResearchResult;
  summary: string;
  key_findings: string[];
  sources: string[];
  created_at: string;
  created_by?: string;
}
