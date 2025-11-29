import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchParams {
  query?: string;
  country?: string;
  after_date?: string;
  before_date?: string;
  assignee?: string;
  inventor?: string;
  status?: 'granted' | 'pending' | 'all';
  page?: number;
  limit?: number;
  category?: 'foliar_nutrition' | 'biostimulants' | 'biodefensives' | 'adjuvants' | 'biofertilizers';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Google Patents search...');

    const searchApiKey = Deno.env.get('SEARCHAPI_KEY');
    if (!searchApiKey) {
      throw new Error('SEARCHAPI_KEY not configured');
    }

    const { query, country, after_date, before_date, assignee, inventor, status, page = 1, limit = 20, category }: SearchParams = 
      await req.json();

    if (!query && !assignee && !inventor) {
      return new Response(
        JSON.stringify({ error: 'At least one search parameter (query, assignee, or inventor) is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build search query
    let searchQuery = query || '';
    
    if (assignee) {
      searchQuery += ` assignee:"${assignee}"`;
    }
    
    if (inventor) {
      searchQuery += ` inventor:"${inventor}"`;
    }

    if (after_date) {
      searchQuery += ` after:${after_date}`;
    }

    if (before_date) {
      searchQuery += ` before:${before_date}`;
    }

    if (status === 'granted') {
      searchQuery += ' status:granted';
    } else if (status === 'pending') {
      searchQuery += ' status:pending';
    }

    console.log('Search query:', searchQuery);
    console.log('Search parameters:', { country, page, limit });

    // SearchAPI Google Patents endpoint
    const searchUrl = new URL('https://www.searchapi.io/api/v1/search');
    searchUrl.searchParams.set('engine', 'google_patents');
    searchUrl.searchParams.set('q', searchQuery.trim());
    searchUrl.searchParams.set('api_key', searchApiKey);
    
    if (country) {
      searchUrl.searchParams.set('country', country.toUpperCase());
    }
    
    if (page > 1) {
      searchUrl.searchParams.set('start', ((page - 1) * limit).toString());
    }
    
    searchUrl.searchParams.set('num', limit.toString());

    const response = await fetch(searchUrl.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SearchAPI error: ${response.status} - ${errorText}`);
      throw new Error(`SearchAPI returned status ${response.status}`);
    }

    const data = await response.json();
    const patents = data.organic_results || [];

    console.log(`Found ${patents.length} patents from SearchAPI`);
    console.log('First patent example:', patents[0]);

    // Format results
    const formattedResults = patents.map((patent: any) => {
      // Extract clean patent number from patent_id format: "patent/XX123456/pt"
      const cleanPatentNumber = patent.patent_id
        ?.replace('patent/', '')
        ?.replace(/\/[a-z]{2}$/, '') || patent.patent_id;
      
      console.log(`Processing patent: ${patent.patent_id} -> ${cleanPatentNumber}`);
      
      return {
        patent_number: cleanPatentNumber,
        publication_number: patent.publication_number || cleanPatentNumber,
      title: patent.title,
      abstract: patent.snippet,
      company: patent.assignee,
      inventors: patent.inventor ? [patent.inventor] : [],
      filing_date: patent.filing_date,
      priority_date: patent.priority_date,
      publication_date: patent.publication_date,
      grant_date: patent.grant_date,
      status: patent.status || (patent.grant_date ? 'Granted' : 'Pending'),
      google_patents_link: patent.link,
      pdf_url: patent.pdf_link,
      thumbnail_url: patent.thumbnail,
      country_code: patent.country_code,
      category: category || 'biostimulants',
    };
    });

    return new Response(
      JSON.stringify({
        success: true,
        results: formattedResults,
        total: data.search_information?.total_results || patents.length,
        page,
        limit,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error searching patents:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
