-- Create enum for alert types
CREATE TYPE alert_type AS ENUM (
  'regulatory_approval',
  'patent_expiry',
  'competitor_launch',
  'market_change',
  'new_publication',
  'price_change'
);

-- Create enum for alert priority
CREATE TYPE alert_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Create enum for product categories
CREATE TYPE product_category AS ENUM (
  'foliar_nutrition',
  'biostimulants',
  'biodefensives',
  'adjuvants',
  'biofertilizers'
);

-- Create enum for regulatory status
CREATE TYPE regulatory_status AS ENUM (
  'pre_registered',
  'under_analysis',
  'approved',
  'rejected',
  'suspended'
);

-- Create alerts configuration table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type alert_type NOT NULL,
  priority alert_priority NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create regulatory records table
CREATE TABLE public.regulatory_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  company TEXT NOT NULL,
  category product_category NOT NULL,
  status regulatory_status NOT NULL,
  registration_number TEXT,
  submission_date DATE,
  approval_date DATE,
  active_ingredients TEXT[],
  target_crops TEXT[],
  mapa_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patents table
CREATE TABLE public.patents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patent_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  category product_category NOT NULL,
  filing_date DATE NOT NULL,
  grant_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL,
  abstract TEXT,
  inventors TEXT[],
  inpi_link TEXT,
  google_patents_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL,
  filters JSONB DEFAULT '{}'::jsonb,
  data JSONB DEFAULT '{}'::jsonb,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alerts
CREATE POLICY "Users can view their own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON public.alerts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for regulatory records (public read, admin write)
CREATE POLICY "Anyone can view regulatory records"
  ON public.regulatory_records FOR SELECT
  USING (true);

-- RLS Policies for patents (public read, admin write)
CREATE POLICY "Anyone can view patents"
  ON public.patents FOR SELECT
  USING (true);

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_regulatory_records_updated_at
  BEFORE UPDATE ON public.regulatory_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patents_updated_at
  BEFORE UPDATE ON public.patents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample regulatory records
INSERT INTO public.regulatory_records (product_name, company, category, status, registration_number, submission_date, approval_date, active_ingredients, target_crops) VALUES
('BioNutri Max', 'AgroTech Solutions', 'foliar_nutrition', 'approved', 'MAPA-2024-001', '2024-01-15', '2024-06-20', ARRAY['Nitrogênio', 'Fósforo', 'Potássio'], ARRAY['Soja', 'Milho']),
('EcoStim Pro', 'BioAgro Innovations', 'biostimulants', 'under_analysis', 'MAPA-2024-045', '2024-08-10', NULL, ARRAY['Extrato de algas', 'Aminoácidos'], ARRAY['Café', 'Citrus']),
('GuardianPlus', 'DefenseCrop Ltd', 'biodefensives', 'approved', 'MAPA-2023-789', '2023-09-05', '2024-02-28', ARRAY['Bacillus thuringiensis'], ARRAY['Soja', 'Algodão', 'Milho']),
('NanoAdjuvant X', 'TechAgro Corp', 'adjuvants', 'pre_registered', NULL, '2024-11-01', NULL, ARRAY['Surfactante não-iônico'], ARRAY['Todas as culturas']),
('OrganicBoost', 'NaturalFert SA', 'biofertilizers', 'approved', 'MAPA-2024-123', '2024-03-20', '2024-09-15', ARRAY['Azospirillum brasilense'], ARRAY['Trigo', 'Cevada']);

-- Insert sample patents
INSERT INTO public.patents (patent_number, title, company, category, filing_date, grant_date, expiry_date, status, abstract, inventors) VALUES
('BR102023001234', 'Composição Bioestimulante de Alta Performance', 'BioAgro Innovations', 'biostimulants', '2023-01-15', '2024-03-20', '2043-01-15', 'Granted', 'Composição sinérgica de extratos de algas marinhas e aminoácidos para aumento de produtividade', ARRAY['Dr. João Silva', 'Dra. Maria Santos']),
('BR102022005678', 'Sistema de Liberação Controlada para Nutrientes Foliares', 'AgroTech Solutions', 'foliar_nutrition', '2022-06-10', '2023-11-15', '2042-06-10', 'Granted', 'Tecnologia de nanoencapsulação para liberação gradual de nutrientes', ARRAY['Dr. Carlos Oliveira']),
('BR102024002345', 'Formulação Biodefensiva com Bacillus Modificado', 'DefenseCrop Ltd', 'biodefensives', '2024-02-20', NULL, '2044-02-20', 'Pending', 'Cepa modificada de Bacillus com maior eficácia contra pragas', ARRAY['Dr. Ana Costa', 'Dr. Pedro Lima']),
('BR102021008901', 'Adjuvante com Redução de Deriva de Pulverização', 'TechAgro Corp', 'adjuvants', '2021-09-05', '2023-05-10', '2041-09-05', 'Granted', 'Adjuvante que reduz deriva em 80% durante aplicação', ARRAY['Eng. Roberto Fernandes']),
('BR102020003456', 'Consórcio Microbiano para Fixação de Nitrogênio', 'NaturalFert SA', 'biofertilizers', '2020-03-15', '2022-08-20', '2040-03-15', 'Granted', 'Combinação otimizada de microorganismos fixadores', ARRAY['Dra. Beatriz Almeida', 'Dr. Fernando Rocha']);