import { Study } from "@/types/research";

// Dados mock baseados em artigos reais do OpenAlex
// Traduzidos para português brasileiro
export const mockStudies: Study[] = [
  {
    id: "https://openalex.org/W4407787208",
    doi: "https://doi.org/10.3390/nu17050741",
    title: "Prevenção e Gerenciamento de Deficiências de Micronutrientes Pré e Pós-Operatórias: Um Componente Vital do Sucesso a Longo Prazo em Cirurgia Bariátrica",
    display_name: "Preventing and Managing Pre- and Postoperative Micronutrient Deficiencies: A Vital Component of Long-Term Success in Bariatric Surgery",
    relevance_score: 244.99,
    publication_year: 2025,
    publication_date: "2025-02-20",
    language: "en",
    type: "review",
    open_access: {
      is_oa: true,
      oa_status: "gold",
      oa_url: "https://doi.org/10.3390/nu17050741",
      any_repository_has_fulltext: false,
    },
    authorships: [
      {
        author_position: "first",
        author: {
          id: "https://openalex.org/A5098729423",
          display_name: "Claudia Reytor-González",
          orcid: "https://orcid.org/0009-0007-4234-5524",
        },
        institutions: [
          {
            id: "https://openalex.org/I4210091861",
            display_name: "Universidad UTE",
            ror: "https://ror.org/00dmdt028",
            country_code: "EC",
            type: "education",
            lineage: ["https://openalex.org/I4210091861"],
          },
        ],
        countries: ["EC"],
        is_corresponding: false,
        raw_author_name: "Claudia Reytor-González",
        raw_affiliation_strings: [
          "Universidad UTE, Facultad de Ciencias de la Salud Eugenio Espejo, Centro de Investigación en Salud Pública y Epidemiología Clínica (CISPEC), Quito 170527, Ecuador",
        ],
      },
      {
        author_position: "middle",
        author: {
          id: "https://openalex.org/A5037941050",
          display_name: "Evelyn Frías-Toral",
          orcid: "https://orcid.org/0000-0002-2228-0141",
        },
        institutions: [
          {
            id: "https://openalex.org/I3132284232",
            display_name: "Universidad de Especialidades Espíritu Santo",
            ror: "https://ror.org/00b210x50",
            country_code: "EC",
            type: "education",
            lineage: ["https://openalex.org/I3132284232"],
          },
          {
            id: "https://openalex.org/I13511017",
            display_name: "Texas State University",
            ror: "https://ror.org/05h9q1g27",
            country_code: "US",
            type: "education",
            lineage: ["https://openalex.org/I13511017"],
          },
        ],
        countries: ["EC", "US"],
        is_corresponding: false,
        raw_author_name: "Evelyn Frias-Toral",
        raw_affiliation_strings: [
          "Division of Research, Texas State University, 601 University Dr, San Marcos, TX 78666, USA",
          "Escuela de Medicina, Universidad Espíritu Santo, Samborondón 0901952, Ecuador",
        ],
      },
      {
        author_position: "last",
        author: {
          id: "https://openalex.org/A5083764239",
          display_name: "Luigi Schiavo",
          orcid: "https://orcid.org/0000-0003-3639-6847",
        },
        institutions: [
          {
            id: "https://openalex.org/I131729948",
            display_name: "University of Salerno",
            ror: "https://ror.org/0192m2k53",
            country_code: "IT",
            type: "education",
            lineage: ["https://openalex.org/I131729948"],
          },
        ],
        countries: ["IT"],
        is_corresponding: true,
        raw_author_name: "Luigi Schiavo",
        raw_affiliation_strings: [
          'Department of Medicine, Surgery and Dentistry "Scuola Medica Salernitana", University of Salerno, 84081 Baronissi, Italy',
        ],
      },
    ],
    institutions_distinct_count: 7,
    countries_distinct_count: 3,
    corresponding_author_ids: [
      "https://openalex.org/A5051753481",
      "https://openalex.org/A5083764239",
    ],
    cited_by_count: 18,
    fwci: 119.18,
    citation_normalized_percentile: {
      value: 0.9996,
      is_in_top_1_percent: true,
      is_in_top_10_percent: true,
    },
    cited_by_percentile_year: {
      min: 99,
      max: 100,
    },
    primary_topic: {
      id: "https://openalex.org/T10569",
      display_name: "Cirurgia Bariátrica e Resultados",
      score: 0.9999,
      subfield: {
        id: "https://openalex.org/subfields/2746",
        display_name: "Cirurgia",
      },
      field: {
        id: "https://openalex.org/fields/27",
        display_name: "Medicine",
      },
      domain: {
        id: "https://openalex.org/domains/4",
        display_name: "Health Sciences",
      },
    },
    topics: [
      {
        id: "https://openalex.org/T10569",
        display_name: "Cirurgia Bariátrica e Resultados",
        score: 0.9999,
        subfield: {
          id: "https://openalex.org/subfields/2746",
          display_name: "Cirurgia",
        },
        field: {
          id: "https://openalex.org/fields/27",
          display_name: "Medicine",
        },
        domain: {
          id: "https://openalex.org/domains/4",
          display_name: "Health Sciences",
        },
      },
      {
        id: "https://openalex.org/T10397",
        display_name: "Nutrição e Saúde no Envelhecimento",
        score: 0.9986,
        subfield: {
          id: "https://openalex.org/subfields/2737",
          display_name: "Fisiologia",
        },
        field: {
          id: "https://openalex.org/fields/27",
          display_name: "Medicine",
        },
        domain: {
          id: "https://openalex.org/domains/4",
          display_name: "Health Sciences",
        },
      },
    ],
    keywords: [
      {
        id: "https://openalex.org/keywords/medicine",
        display_name: "Medicina",
        score: 0.86,
      },
      {
        id: "https://openalex.org/keywords/micronutrient",
        display_name: "Micronutrientes",
        score: 0.78,
      },
      {
        id: "https://openalex.org/keywords/intensive-care-medicine",
        display_name: "Medicina Intensiva",
        score: 0.6,
      },
      {
        id: "https://openalex.org/keywords/sleeve-gastrectomy",
        display_name: "Gastrectomia Vertical",
        score: 0.54,
      },
      {
        id: "https://openalex.org/keywords/malnutrition",
        display_name: "Desnutrição",
        score: 0.49,
      },
    ],
    mesh: [
      {
        descriptor_ui: "D050110",
        descriptor_name: "Cirurgia Bariátrica",
        qualifier_ui: "Q000009",
        qualifier_name: "efeitos adversos",
        is_major_topic: true,
      },
      {
        descriptor_ui: "D018977",
        descriptor_name: "Micronutrientes",
        qualifier_ui: "Q000172",
        qualifier_name: "deficiência",
        is_major_topic: true,
      },
    ],
    sustainable_development_goals: [
      {
        display_name: "Fome Zero",
        id: "https://metadata.un.org/sdg/2",
        score: 0.59,
      },
    ],
    primary_location: {
      id: "doi:10.3390/nu17050741",
      is_oa: true,
      landing_page_url: "https://doi.org/10.3390/nu17050741",
      pdf_url: null,
      source: {
        id: "https://openalex.org/S110785341",
        display_name: "Nutrients",
        issn_l: "2072-6643",
        issn: ["2072-6643"],
        is_oa: true,
        is_in_doaj: false,
        is_core: true,
        type: "journal",
      },
      license: "cc-by",
      license_id: "https://openalex.org/licenses/cc-by",
      version: "publishedVersion",
      is_accepted: true,
      is_published: true,
    },
    apc_list: {
      value: 2600,
      currency: "CHF",
      value_usd: 2815,
    },
    apc_paid: {
      value: 2600,
      currency: "CHF",
      value_usd: 2815,
    },
    indexed_in: ["crossref", "pubmed"],
    is_retracted: false,
    is_paratext: false,
    referenced_works_count: 140,
  },
];
