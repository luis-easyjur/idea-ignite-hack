-- Create competitors table
CREATE TABLE IF NOT EXISTS public.competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  segment TEXT,
  website TEXT,
  cnpj TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create competitor_research table
CREATE TABLE IF NOT EXISTS public.competitor_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE CASCADE,
  research_type TEXT DEFAULT 'full',
  result_json JSONB,
  activity_score INTEGER CHECK (activity_score >= 0 AND activity_score <= 100),
  sources TEXT[],
  researched_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_research ENABLE ROW LEVEL SECURITY;

-- RLS Policies for competitors (authenticated users can view and manage)
CREATE POLICY "Authenticated users can view competitors"
  ON public.competitors
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert competitors"
  ON public.competitors
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update competitors"
  ON public.competitors
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete competitors"
  ON public.competitors
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for competitor_research
CREATE POLICY "Authenticated users can view research"
  ON public.competitor_research
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert research"
  ON public.competitor_research
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update research"
  ON public.competitor_research
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete research"
  ON public.competitor_research
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_competitors_is_active ON public.competitors(is_active);
CREATE INDEX IF NOT EXISTS idx_competitor_research_competitor_id ON public.competitor_research(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_research_researched_at ON public.competitor_research(researched_at DESC);

-- Trigger to update updated_at on competitors
CREATE OR REPLACE FUNCTION public.update_competitors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_competitors_updated_at
  BEFORE UPDATE ON public.competitors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_competitors_updated_at();