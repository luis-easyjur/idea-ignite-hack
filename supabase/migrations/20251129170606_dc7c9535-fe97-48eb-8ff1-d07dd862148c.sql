-- Add new fields to patents table for enhanced Google Patents integration
ALTER TABLE public.patents 
  ADD COLUMN IF NOT EXISTS publication_number TEXT,
  ADD COLUMN IF NOT EXISTS priority_date DATE,
  ADD COLUMN IF NOT EXISTS publication_date DATE,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS claims TEXT,
  ADD COLUMN IF NOT EXISTS country_status JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS figures JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt';

-- Add index for better search performance
CREATE INDEX IF NOT EXISTS idx_patents_publication_number ON public.patents(publication_number);
CREATE INDEX IF NOT EXISTS idx_patents_priority_date ON public.patents(priority_date);
CREATE INDEX IF NOT EXISTS idx_patents_publication_date ON public.patents(publication_date);

-- Add comment for documentation
COMMENT ON COLUMN public.patents.publication_number IS 'Patent publication number from Google Patents';
COMMENT ON COLUMN public.patents.priority_date IS 'Priority filing date';
COMMENT ON COLUMN public.patents.publication_date IS 'Publication date';
COMMENT ON COLUMN public.patents.thumbnail_url IS 'URL to patent thumbnail image';
COMMENT ON COLUMN public.patents.pdf_url IS 'Direct URL to patent PDF';
COMMENT ON COLUMN public.patents.claims IS 'Patent claims text';
COMMENT ON COLUMN public.patents.country_status IS 'Patent status by country (JSON object)';
COMMENT ON COLUMN public.patents.figures IS 'Array of figure URLs (JSON array)';
COMMENT ON COLUMN public.patents.language IS 'Patent document language';