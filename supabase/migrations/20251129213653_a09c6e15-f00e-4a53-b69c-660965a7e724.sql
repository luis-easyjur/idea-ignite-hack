-- Create market_research_reports table
CREATE TABLE IF NOT EXISTS public.market_research_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  result_json JSONB,
  summary TEXT,
  key_findings TEXT[],
  sources TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.market_research_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view market research"
  ON public.market_research_reports
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create market research"
  ON public.market_research_reports
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update market research"
  ON public.market_research_reports
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete market research"
  ON public.market_research_reports
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create index
CREATE INDEX IF NOT EXISTS idx_market_research_created_at ON public.market_research_reports(created_at DESC);