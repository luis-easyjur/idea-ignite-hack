-- Add new fields to patents table for detailed information
ALTER TABLE public.patents ADD COLUMN IF NOT EXISTS application_number TEXT;
ALTER TABLE public.patents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.patents ADD COLUMN IF NOT EXISTS classifications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.patents ADD COLUMN IF NOT EXISTS cited_by JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.patents ADD COLUMN IF NOT EXISTS similar_documents JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.patents ADD COLUMN IF NOT EXISTS legal_events JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.patents ADD COLUMN IF NOT EXISTS worldwide_applications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.patents ADD COLUMN IF NOT EXISTS external_links JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.patents ADD COLUMN IF NOT EXISTS prior_art_keywords TEXT[] DEFAULT '{}';
ALTER TABLE public.patents ADD COLUMN IF NOT EXISTS all_images TEXT[] DEFAULT '{}';
ALTER TABLE public.patents ADD COLUMN IF NOT EXISTS events JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.patents ADD COLUMN IF NOT EXISTS details_loaded BOOLEAN DEFAULT false;
ALTER TABLE public.patents ADD COLUMN IF NOT EXISTS details_loaded_at TIMESTAMPTZ;

-- Create index for faster queries on details_loaded
CREATE INDEX IF NOT EXISTS idx_patents_details_loaded ON public.patents(details_loaded);

-- Create index for classifications searches
CREATE INDEX IF NOT EXISTS idx_patents_classifications ON public.patents USING gin(classifications);