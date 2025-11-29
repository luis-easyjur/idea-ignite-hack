export interface CompetitorProduct {
  id: string;
  competitor_id: string;
  competitor_name?: string;
  name: string;
  description?: string;
  category?: string;
  active_ingredient?: string;
  registration_number?: string;
  status?: string;
  launch_date?: string;
  target_crops?: string[];
  image_url?: string;
  source_url?: string;
  created_at: string;
  updated_at: string;
}
