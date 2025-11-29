-- Create patent_search_terms table
CREATE TABLE public.patent_search_terms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  term TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  last_searched_at TIMESTAMPTZ,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patent_search_terms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own search terms"
ON public.patent_search_terms
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search terms"
ON public.patent_search_terms
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search terms"
ON public.patent_search_terms
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search terms"
ON public.patent_search_terms
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_patent_search_terms_updated_at
BEFORE UPDATE ON public.patent_search_terms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();