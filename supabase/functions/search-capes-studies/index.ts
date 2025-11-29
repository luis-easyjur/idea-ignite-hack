const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Resource IDs conhecidos da CAPES - Catálogo de Teses e Dissertações
const RESOURCE_IDS = {
  THESES_2017: '902bd63b-137f-4090-89e9-cab94f12c41d',
  THESES_2018: '638668a6-07da-4c7e-8aab-9044ae3cc753',
  THESES_2019: '8f4f2bce-2744-460a-8f14-f1648c7a16df',
  THESES_2020: 'e37df31a-f250-4405-8b21-ca7e5c7c1696',
};

interface CKANSearchParams {
  resource_id: string;
  q?: string;
  limit?: number;
  offset?: number;
}

interface CAPESStudyRecord {
  _id: number;
  NM_PRODUCAO?: string;
  AN_BASE?: string;
  NM_PROGRAMA?: string;
  NM_ENTIDADE_ENSINO?: string;
  SG_UF_IES?: string;
  NM_GRAU_ACADEMICO?: string;
  NM_GRANDE_AREA_CONHECIMENTO?: string;
  NM_AREA_CONHECIMENTO?: string;
  NM_AREA_AVALIACAO?: string;
  NM_DISCENTE?: string;
  NM_ORIENTADOR?: string;
  DS_PALAVRA_CHAVE?: string;
  DS_RESUMO?: string;
  NM_LINHA_PESQUISA?: string;
  DS_URL_TEXTO_COMPLETO?: string;
}

interface CKANResponse {
  success: boolean;
  result: {
    records: CAPESStudyRecord[];
    total: number;
    limit: number;
    offset: number;
  };
}

interface CAPESStudy {
  id: string;
  titulo: string;
  resumo?: string;
  urlTextoCompleto?: string;
  autor: string;
  orientador?: string;
  instituicao: string;
  siglaUF: string;
  programa: string;
  areaConhecimento: string;
  grandeArea: string;
  ano: number;
  tipo: 'DISSERTAÇÃO' | 'TESE';
  palavrasChave: string[];
  linhaPesquisa?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Search request received:', body);

    const searchQuery = body.q || '';
    const limit = parseInt(body.limit?.toString() || '10');
    const offset = parseInt(body.offset?.toString() || '0');
    const resourceId = body.resource_id || RESOURCE_IDS.THESES_2019;
    const area = body.area || '';
    const institution = body.institution || '';
    const year = body.year || '';

    console.log('Using resource_id:', resourceId);
    console.log('Search query:', searchQuery);

    // Construir parâmetros para a API CKAN da CAPES
    const params: CKANSearchParams = {
      resource_id: resourceId,
      limit,
      offset,
    };

    if (searchQuery) {
      params.q = searchQuery;
    }

    const queryString = new URLSearchParams(params as any).toString();
    const apiUrl = `https://dadosabertos.capes.gov.br/api/3/action/datastore_search?${queryString}`;

    console.log('Fetching from CAPES API:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CAPES API error:', response.status, errorText);
      throw new Error(`CAPES API returned ${response.status}: ${errorText}`);
    }

    const data: CKANResponse = await response.json();
    console.log('CAPES API response - total records:', data.result.total);
    console.log('First record sample:', data.result.records[0]);

    let filteredRecords = data.result.records;

    // Aplicar filtros adicionais
    if (area) {
      filteredRecords = filteredRecords.filter(record =>
        record.NM_AREA_CONHECIMENTO?.toLowerCase().includes(area.toLowerCase()) ||
        record.NM_GRANDE_AREA_CONHECIMENTO?.toLowerCase().includes(area.toLowerCase())
      );
    }

    if (institution) {
      filteredRecords = filteredRecords.filter(record =>
        record.NM_ENTIDADE_ENSINO?.toLowerCase().includes(institution.toLowerCase())
      );
    }

    if (year) {
      filteredRecords = filteredRecords.filter(record =>
        record.AN_BASE?.toString() === year
      );
    }

    // Mapear os registros CAPES para o formato CAPESStudy
    const mappedStudies: CAPESStudy[] = filteredRecords.map(record => {
      const palavrasChave = record.DS_PALAVRA_CHAVE
        ? record.DS_PALAVRA_CHAVE.split(/[;,]/).map(k => k.trim()).filter(k => k)
        : [];

      const tipo = record.NM_GRAU_ACADEMICO?.toUpperCase().includes('DOUTORADO')
        ? 'TESE' as const
        : 'DISSERTAÇÃO' as const;

      return {
        id: record._id.toString(),
        titulo: record.NM_PRODUCAO || 'Sem título',
        resumo: record.DS_RESUMO,
        urlTextoCompleto: record.DS_URL_TEXTO_COMPLETO,
        autor: record.NM_DISCENTE || 'Autor não informado',
        orientador: record.NM_ORIENTADOR,
        instituicao: record.NM_ENTIDADE_ENSINO || 'Instituição não informada',
        siglaUF: record.SG_UF_IES || '',
        programa: record.NM_PROGRAMA || '',
        areaConhecimento: record.NM_AREA_CONHECIMENTO || record.NM_AREA_AVALIACAO || '',
        grandeArea: record.NM_GRANDE_AREA_CONHECIMENTO || '',
        ano: parseInt(record.AN_BASE || '0'),
        tipo,
        palavrasChave,
        linhaPesquisa: record.NM_LINHA_PESQUISA,
      };
    });

    console.log('Mapped studies:', mappedStudies.length);
    console.log('First mapped study:', mappedStudies[0]);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          studies: mappedStudies,
          total: data.result.total,
          limit: data.result.limit,
          offset: data.result.offset,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in search-capes-studies function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao buscar estudos';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        data: {
          studies: [],
          total: 0,
          limit: 0,
          offset: 0,
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
