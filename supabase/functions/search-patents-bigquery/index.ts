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

    // Build SQL query for Brazilian patents
    let sqlQuery = `
      SELECT 
        publication_number,
        title_localized.text as title,
        abstract_localized.text as abstract,
        assignee_harmonized.name as assignee,
        inventor_harmonized.name as inventors,
        filing_date,
        grant_date,
        publication_date,
        priority_date,
        application_number,
        family_id,
        country_code
      FROM \`patents-public-data.patents.publications\`
      WHERE country_code = 'BR'
    `;

    if (query) {
      sqlQuery += ` AND (
        LOWER(title_localized.text) LIKE LOWER('%${query}%') OR
        LOWER(abstract_localized.text) LIKE LOWER('%${query}%')
      )`;
    }

    if (assignee) {
      sqlQuery += ` AND LOWER(assignee_harmonized.name) LIKE LOWER('%${assignee}%')`;
    }

    sqlQuery += ` ORDER BY filing_date DESC LIMIT ${limit}`;

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
      return {
        patent_number: fields[0]?.v || '',
        title: fields[1]?.v || 'Sem título',
        abstract: fields[2]?.v || '',
        company: fields[3]?.v?.[0]?.v || 'Empresa desconhecida',
        inventors: fields[4]?.v?.map((inv: any) => inv.v) || [],
        filing_date: fields[5]?.v || null,
        grant_date: fields[6]?.v || null,
        publication_date: fields[7]?.v || null,
        priority_date: fields[8]?.v || null,
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
