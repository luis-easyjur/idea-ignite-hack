import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PatentDetailsResponse {
  description?: string;
  application_number?: string;
  classifications?: Array<{
    code: string;
    description: string;
    leaf: boolean;
    first_code: boolean;
  }>;
  claims?: Array<{
    num: number;
    text: string;
  }>;
  cited_by?: {
    family_to_family?: Array<{
      publication_number: string;
      title: string;
      assignee_original: string;
      priority_date: string;
      link: string;
    }>;
  };
  similar_documents?: Array<{
    publication_number: string;
    title: string;
    publication_date: string;
    link: string;
  }>;
  legal_events?: Array<{
    date: string;
    code: string;
    title: string;
  }>;
  worldwide_applications?: Array<{
    year: string;
    applications: Array<{
      country_code: string;
      application_number: string;
      legal_status: string;
      legal_status_cat: string;
      filing_date: string;
      link: string;
    }>;
  }>;
  external_links?: Array<{
    text: string;
    link: string;
  }>;
  events?: Array<{
    date: string;
    title: string;
    type: string;
    critical: boolean;
  }>;
  prior_art_keywords?: string[];
  images?: Array<{
    url: string;
    thumbnail: string;
    caption?: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const searchApiKey = Deno.env.get('SEARCHAPI_KEY');

    if (!searchApiKey) {
      throw new Error('SEARCHAPI_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { patent_id } = await req.json();

    if (!patent_id) {
      return new Response(
        JSON.stringify({ error: 'patent_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching details for patent: ${patent_id}`);
    
    // Clean patent_id to get the patent number for database matching
    const cleanPatentNumber = patent_id.replace('patent/', '').replace(/\/[a-z]{2}$/, '');
    console.log(`Cleaned patent number for DB: ${cleanPatentNumber}`);

    // Call SearchAPI.io Google Patents Details endpoint
    const searchApiUrl = new URL('https://www.searchapi.io/api/v1/search');
    searchApiUrl.searchParams.set('engine', 'google_patents_details');
    searchApiUrl.searchParams.set('patent_id', patent_id);
    searchApiUrl.searchParams.set('api_key', searchApiKey);

    const apiResponse = await fetch(searchApiUrl.toString());
    
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('SearchAPI error:', apiResponse.status, errorText);
      throw new Error(`SearchAPI returned ${apiResponse.status}: ${errorText}`);
    }

    const data: PatentDetailsResponse = await apiResponse.json();
    console.log('Received patent details from API');
    console.log('Description length:', data.description?.length || 0);
    console.log('Classifications count:', data.classifications?.length || 0);
    console.log('Claims count:', data.claims?.length || 0);
    console.log('Images count:', data.images?.length || 0);

    // Extract and format the data
    const claimsText = data.claims?.map(c => `${c.num}. ${c.text}`).join('\n\n') || null;
    const allImages = data.images?.map(img => img.url) || [];
    
    // Update the patent record in the database
    console.log(`Updating patent in database with number: ${cleanPatentNumber}`);
    const { data: updatedPatent, error: updateError } = await supabase
      .from('patents')
      .update({
        description: data.description || null,
        application_number: data.application_number || null,
        classifications: data.classifications || [],
        claims: claimsText,
        cited_by: data.cited_by || {},
        similar_documents: data.similar_documents || [],
        legal_events: data.legal_events || [],
        worldwide_applications: data.worldwide_applications || [],
        external_links: data.external_links || [],
        prior_art_keywords: data.prior_art_keywords || [],
        all_images: allImages,
        events: data.events || [],
        details_loaded: true,
        details_loaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('patent_number', cleanPatentNumber)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Patent details updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        patent: updatedPatent,
        message: 'Patent details loaded successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-patent-details:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});