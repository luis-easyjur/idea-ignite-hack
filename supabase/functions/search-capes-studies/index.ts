import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Resource IDs conhecidos da CAPES
const RESOURCE_IDS = {
  THESES_2021_2024: 'a5e72d15-0c0b-4fcb-9471-4fca804d4cff',
  PRODUCTION_2021: '8e9bcb66-fdaf-4d8e-a906-a2c3ff2d3d60',
  PRODUCTION_2020: '0f05c0c0-5e5c-4d5c-a4c4-3f3c0c0c0c0c'
};

interface CKANSearchParams {
  resource_id: string;
  q?: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, string>;
}

interface CAPESStudyRecord {
  _id: number;
  NM_TESE_DISSERTACAO?: string;
  AN_BASE?: string;
  NM_PROGRAMA?: string;
  NM_ENTIDADE_ENSINO?: string;
  NM_GRAU_ACADEMICO?: string;
  NM_GRANDE_AREA_CONHECIMENTO?: string;
  NM_AREA_CONHECIMENTO?: string;
  NM_AUTOR?: string;
  DS_PALAVRA_CHAVE?: string;
  DS_RESUMO?: string;
}

interface CKANResponse {
  success: boolean;
  result: {
    records: CAPESStudyRecord[];
    total: number;
    fields: any[];
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Ler parâmetros do body da requisição
    const body = await req.json();
    const searchQuery = body.q || '';
    const limit = parseInt(body.limit?.toString() || '10');
    const offset = parseInt(body.offset?.toString() || '0');
    const resourceId = body.resource_id || RESOURCE_IDS.THESES_2021_2024;
    const area = body.area || '';
    const institution = body.institution || '';
    const year = body.year || '';

    console.log('Searching CAPES API:', { searchQuery, limit, offset, resourceId, area, institution, year });

    // Construir URL da API CKAN
    const ckanUrl = new URL('https://dadosabertos.capes.gov.br/pt_BR/api/3/action/datastore_search');
    ckanUrl.searchParams.set('resource_id', resourceId);
    ckanUrl.searchParams.set('limit', limit.toString());
    ckanUrl.searchParams.set('offset', offset.toString());
    
    if (searchQuery) {
      ckanUrl.searchParams.set('q', searchQuery);
    }

    // Adicionar filtros se especificados
    const filters: Record<string, string> = {};
    if (area) filters['NM_AREA_CONHECIMENTO'] = area;
    if (institution) filters['NM_ENTIDADE_ENSINO'] = institution;
    if (year) filters['AN_BASE'] = year;
    
    if (Object.keys(filters).length > 0) {
      ckanUrl.searchParams.set('filters', JSON.stringify(filters));
    }

    console.log('CKAN URL:', ckanUrl.toString());

    // Fazer requisição para API CAPES
    const response = await fetch(ckanUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CAPES API error: ${response.status} ${response.statusText}`);
    }

    const data: CKANResponse = await response.json();

    console.log('CAPES API response:', {
      success: data.success,
      total: data.result.total,
      records: data.result.records.length
    });

    // Log do primeiro registro para debug dos campos
    if (data.result.records.length > 0) {
      console.log('Primeiro registro CAPES completo:', JSON.stringify(data.result.records[0], null, 2));
    }

    // Mapear dados para formato compatível com Study
    const mappedStudies = data.result.records.map((record, index) => ({
      id: `capes-${record._id}`,
      doi: null,
      title: record.NM_TESE_DISSERTACAO || 'Sem título',
      display_name: record.NM_TESE_DISSERTACAO || 'Sem título',
      relevance_score: 100 - (offset + index),
      publication_year: parseInt(record.AN_BASE || new Date().getFullYear().toString()),
      publication_date: `${record.AN_BASE}-01-01`,
      language: 'pt',
      type: record.NM_GRAU_ACADEMICO === 'DOUTORADO' ? 'dissertation' : 'thesis',
      open_access: {
        is_oa: true,
        oa_status: 'green',
        oa_url: null,
        any_repository_has_fulltext: false,
      },
      authorships: [
        {
          author_position: 'first',
          author: {
            id: `capes-author-${record._id}`,
            display_name: record.NM_AUTOR || 'Autor não informado',
            orcid: null,
          },
          institutions: [
            {
              id: `capes-inst-${record._id}`,
              display_name: record.NM_ENTIDADE_ENSINO || 'Instituição não informada',
              ror: null,
              country_code: 'BR',
              type: 'education',
              lineage: [],
            },
          ],
          countries: ['BR'],
          is_corresponding: true,
          raw_author_name: record.NM_AUTOR || 'Autor não informado',
          raw_affiliation_strings: [record.NM_ENTIDADE_ENSINO || 'Instituição não informada'],
        },
      ],
      institutions_distinct_count: 1,
      countries_distinct_count: 1,
      corresponding_author_ids: [`capes-author-${record._id}`],
      cited_by_count: 0,
      fwci: 0,
      citation_normalized_percentile: null,
      cited_by_percentile_year: null,
      primary_topic: {
        id: `capes-topic-${record._id}`,
        display_name: record.NM_AREA_CONHECIMENTO || record.NM_GRANDE_AREA_CONHECIMENTO || 'Área não informada',
        score: 0.95,
        subfield: {
          id: `capes-subfield-${record._id}`,
          display_name: record.NM_AREA_CONHECIMENTO || 'Subárea não informada',
        },
        field: {
          id: `capes-field-${record._id}`,
          display_name: record.NM_GRANDE_AREA_CONHECIMENTO || 'Campo não informado',
        },
        domain: {
          id: 'capes-domain',
          display_name: 'Ciências',
        },
      },
      topics: [
        {
          id: `capes-topic-${record._id}`,
          display_name: record.NM_PROGRAMA || 'Programa não informado',
          score: 0.95,
          subfield: {
            id: `capes-subfield-${record._id}`,
            display_name: record.NM_AREA_CONHECIMENTO || 'Subárea não informada',
          },
          field: {
            id: `capes-field-${record._id}`,
            display_name: record.NM_GRANDE_AREA_CONHECIMENTO || 'Campo não informado',
          },
          domain: {
            id: 'capes-domain',
            display_name: 'Ciências',
          },
        },
      ],
      keywords: record.DS_PALAVRA_CHAVE
        ? record.DS_PALAVRA_CHAVE.split(';').slice(0, 5).map((kw, i) => ({
            id: `capes-kw-${record._id}-${i}`,
            display_name: kw.trim(),
            score: 0.8,
          }))
        : [],
      mesh: [],
      sustainable_development_goals: [],
      primary_location: {
        id: `capes-location-${record._id}`,
        is_oa: true,
        landing_page_url: null,
        pdf_url: null,
        source: {
          id: 'capes-source',
          display_name: 'Catálogo de Teses e Dissertações CAPES',
          issn_l: null,
          issn: [],
          is_oa: true,
          is_in_doaj: false,
          is_core: true,
          type: 'repository',
        },
        license: null,
        license_id: null,
        version: 'publishedVersion',
        is_accepted: true,
        is_published: true,
      },
      apc_list: null,
      apc_paid: null,
      indexed_in: ['capes'],
      is_retracted: false,
      is_paratext: false,
      referenced_works_count: 0,
      abstract_inverted_index: record.DS_RESUMO
        ? { resumo: [0] } // Simplificado
        : undefined,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          studies: mappedStudies,
          total: data.result.total,
          limit,
          offset,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in search-capes-studies:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao buscar estudos';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
