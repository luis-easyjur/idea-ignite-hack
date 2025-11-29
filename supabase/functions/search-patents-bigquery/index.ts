import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchParams {
  query?: string;
  assignee?: string;
  category?: string;
  limit?: number;
}

// Helper to sanitize dates from BigQuery (converts "0", null, or invalid values to null or proper format)
const sanitizeDate = (dateValue: string | number | null): string | null => {
  if (!dateValue || dateValue === '0' || dateValue === 0 || dateValue === '') return null;
  
  const str = String(dateValue);
  
  // BigQuery returns dates as YYYYMMDD (integer) - convert to YYYY-MM-DD
  if (str.length === 8 && /^\d{8}$/.test(str)) {
    return `${str.slice(0,4)}-${str.slice(4,6)}-${str.slice(6,8)}`;
  }
  
  // Already in YYYY-MM-DD format or timestamp
  return str;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceAccountJson = Deno.env.get('GOOGLE_CLOUD_SERVICE_ACCOUNT');
    if (!serviceAccountJson) {
      throw new Error('GOOGLE_CLOUD_SERVICE_ACCOUNT not configured');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    const { query, assignee, category, limit = 100 }: SearchParams = await req.json();

    // Build SQL query for Brazilian patents with proper UNNEST for arrays
    let sqlQuery = `
      SELECT 
        p.publication_number,
        ARRAY_AGG(DISTINCT title.text IGNORE NULLS ORDER BY title.text LIMIT 1)[OFFSET(0)] as title,
        ARRAY_AGG(DISTINCT abstract.text IGNORE NULLS ORDER BY abstract.text LIMIT 1)[OFFSET(0)] as abstract,
        ARRAY_AGG(DISTINCT assignee.name IGNORE NULLS ORDER BY assignee.name LIMIT 1)[OFFSET(0)] as assignee,
        ARRAY_TO_STRING(ARRAY_AGG(DISTINCT inventor.name IGNORE NULLS ORDER BY inventor.name), ', ') as inventors,
        p.filing_date,
        p.grant_date,
        p.publication_date,
        p.priority_date,
        p.application_number,
        p.family_id,
        p.country_code
      FROM \`patents-public-data.patents.publications\` p
      LEFT JOIN UNNEST(p.title_localized) as title
      LEFT JOIN UNNEST(p.abstract_localized) as abstract
      LEFT JOIN UNNEST(p.assignee_harmonized) as assignee
      LEFT JOIN UNNEST(p.inventor_harmonized) as inventor
      WHERE p.country_code = 'BR'
        AND (title.language = 'pt' OR title.language = 'en')
    `;

    if (query) {
      sqlQuery += ` AND (
        LOWER(title.text) LIKE LOWER('%${query}%') OR
        LOWER(abstract.text) LIKE LOWER('%${query}%')
      )`;
    }

    if (assignee) {
      sqlQuery += ` AND LOWER(assignee.name) LIKE LOWER('%${assignee}%')`;
    }

    sqlQuery += ` 
      GROUP BY p.publication_number, p.filing_date, p.grant_date, 
               p.publication_date, p.priority_date, p.application_number, 
               p.family_id, p.country_code
      ORDER BY p.filing_date DESC 
      LIMIT ${limit}
    `;

    console.log('Executing BigQuery SQL:', sqlQuery);

    // Get OAuth2 token for BigQuery API
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const jwtClaimSet = btoa(JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/bigquery.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }));

    const signatureInput = `${jwtHeader}.${jwtClaimSet}`;
    
    // Import private key and sign
    const privateKeyPem = serviceAccount.private_key;
    const pemContents = privateKeyPem
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace(/\s/g, "");
    
    const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    
    const key = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key,
      new TextEncoder().encode(signatureInput)
    );

    const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    const jwt = `${signatureInput}.${base64Signature}`;

    // Exchange JWT for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token error:', errorText);
      throw new Error(`Failed to get access token: ${errorText}`);
    }

    const { access_token } = await tokenResponse.json();

    // Execute BigQuery query
    const projectId = serviceAccount.project_id;
    const bigqueryResponse = await fetch(
      `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/queries`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: sqlQuery,
          useLegacySql: false,
          maxResults: limit,
        }),
      }
    );

    if (!bigqueryResponse.ok) {
      const errorText = await bigqueryResponse.text();
      console.error('BigQuery error:', errorText);
      throw new Error(`BigQuery API error: ${errorText}`);
    }

    const bigqueryData = await bigqueryResponse.json();

    // Format results to match our patent schema
    const formattedResults = bigqueryData.rows?.map((row: any) => {
      const fields = row.f;
      
      // Parse inventors string back to array
      const inventorsStr = fields[4]?.v || '';
      const inventors = inventorsStr ? inventorsStr.split(', ').filter((i: string) => i) : [];
      
      return {
        patent_number: fields[0]?.v || '',
        title: fields[1]?.v || 'Sem título',
        abstract: fields[2]?.v || '',
        company: fields[3]?.v || 'Empresa desconhecida',
        inventors: inventors,
        filing_date: sanitizeDate(fields[5]?.v),
        grant_date: sanitizeDate(fields[6]?.v),
        publication_date: sanitizeDate(fields[7]?.v),
        priority_date: sanitizeDate(fields[8]?.v),
        application_number: fields[9]?.v || null,
        publication_number: fields[0]?.v || '',
        status: fields[6]?.v ? 'Concedida' : 'Em análise',
        category: category || 'biostimulants',
        language: 'pt',
        google_patents_link: `https://patents.google.com/patent/${fields[0]?.v}`,
        country_code: 'BR',
        source: 'bigquery',
      };
    }) || [];

    console.log(`Found ${formattedResults.length} patents from BigQuery`);

    return new Response(
      JSON.stringify({
        results: formattedResults,
        total: formattedResults.length,
        source: 'Google BigQuery Patents Public Data',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('BigQuery search error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
