// Tradução de tipos de publicação
export const typeTranslations: Record<string, string> = {
  "review": "Revisão",
  "article": "Artigo",
  "book-chapter": "Capítulo de Livro",
  "dissertation": "Dissertação",
  "thesis": "Tese",
  "preprint": "Pré-print",
  "dataset": "Conjunto de Dados",
  "editorial": "Editorial",
  "letter": "Carta",
  "erratum": "Errata",
  "paratext": "Paratexto",
};

// Tradução de status OA
export const oaStatusTranslations: Record<string, string> = {
  "gold": "Acesso Aberto Dourado",
  "green": "Acesso Aberto Verde",
  "hybrid": "Híbrido",
  "bronze": "Acesso Aberto Bronze",
  "closed": "Restrito",
};

// Cores para status OA
export const oaStatusColors: Record<string, string> = {
  "gold": "bg-warning text-warning-foreground",
  "green": "bg-success text-success-foreground",
  "hybrid": "bg-secondary text-secondary-foreground",
  "bronze": "bg-muted text-muted-foreground",
  "closed": "bg-destructive/20 text-destructive",
};

// Tradução de países
export const countryTranslations: Record<string, string> = {
  "BR": "Brasil",
  "US": "Estados Unidos",
  "EC": "Equador",
  "IT": "Itália",
  "GB": "Reino Unido",
  "DE": "Alemanha",
  "FR": "França",
  "ES": "Espanha",
  "CN": "China",
  "IN": "Índia",
  "JP": "Japão",
  "CA": "Canadá",
  "AU": "Austrália",
  "MX": "México",
  "AR": "Argentina",
  "CL": "Chile",
  "CO": "Colômbia",
  "PE": "Peru",
  "VE": "Venezuela",
  "PT": "Portugal",
  "NL": "Holanda",
  "CH": "Suíça",
  "SE": "Suécia",
  "NO": "Noruega",
  "DK": "Dinamarca",
  "FI": "Finlândia",
  "BE": "Bélgica",
  "AT": "Áustria",
  "PL": "Polônia",
  "RU": "Rússia",
  "ZA": "África do Sul",
  "EG": "Egito",
  "NG": "Nigéria",
  "KE": "Quênia",
  "KR": "Coreia do Sul",
  "TH": "Tailândia",
  "ID": "Indonésia",
  "MY": "Malásia",
  "SG": "Singapura",
  "NZ": "Nova Zelândia",
  "IE": "Irlanda",
  "IL": "Israel",
  "TR": "Turquia",
  "SA": "Arábia Saudita",
  "AE": "Emirados Árabes",
  "PK": "Paquistão",
  "BD": "Bangladesh",
};

// Bandeiras emoji por código de país
export const countryFlags: Record<string, string> = {
  "BR": "🇧🇷",
  "US": "🇺🇸",
  "EC": "🇪🇨",
  "IT": "🇮🇹",
  "GB": "🇬🇧",
  "DE": "🇩🇪",
  "FR": "🇫🇷",
  "ES": "🇪🇸",
  "CN": "🇨🇳",
  "IN": "🇮🇳",
  "JP": "🇯🇵",
  "CA": "🇨🇦",
  "AU": "🇦🇺",
  "MX": "🇲🇽",
  "AR": "🇦🇷",
  "CL": "🇨🇱",
  "CO": "🇨🇴",
  "PE": "🇵🇪",
  "VE": "🇻🇪",
  "PT": "🇵🇹",
  "NL": "🇳🇱",
  "CH": "🇨🇭",
  "SE": "🇸🇪",
  "NO": "🇳🇴",
  "DK": "🇩🇰",
  "FI": "🇫🇮",
  "BE": "🇧🇪",
  "AT": "🇦🇹",
  "PL": "🇵🇱",
  "RU": "🇷🇺",
  "ZA": "🇿🇦",
  "EG": "🇪🇬",
  "NG": "🇳🇬",
  "KE": "🇰🇪",
  "KR": "🇰🇷",
  "TH": "🇹🇭",
  "ID": "🇮🇩",
  "MY": "🇲🇾",
  "SG": "🇸🇬",
  "NZ": "🇳🇿",
  "IE": "🇮🇪",
  "IL": "🇮🇱",
  "TR": "🇹🇷",
  "SA": "🇸🇦",
  "AE": "🇦🇪",
  "PK": "🇵🇰",
  "BD": "🇧🇩",
};

// Tradução de domínios científicos
export const domainTranslations: Record<string, string> = {
  "Health Sciences": "Ciências da Saúde",
  "Life Sciences": "Ciências da Vida",
  "Physical Sciences": "Ciências Físicas",
  "Social Sciences": "Ciências Sociais",
};

// Tradução de campos científicos
export const fieldTranslations: Record<string, string> = {
  "Medicine": "Medicina",
  "Biochemistry, Genetics and Molecular Biology": "Bioquímica, Genética e Biologia Molecular",
  "Agricultural and Biological Sciences": "Ciências Agrícolas e Biológicas",
  "Environmental Science": "Ciência Ambiental",
  "Immunology and Microbiology": "Imunologia e Microbiologia",
  "Chemistry": "Química",
  "Engineering": "Engenharia",
  "Materials Science": "Ciência dos Materiais",
  "Computer Science": "Ciência da Computação",
  "Mathematics": "Matemática",
  "Physics and Astronomy": "Física e Astronomia",
  "Earth and Planetary Sciences": "Ciências da Terra e Planetárias",
  "Psychology": "Psicologia",
  "Economics, Econometrics and Finance": "Economia, Econometria e Finanças",
  "Business, Management and Accounting": "Negócios, Gestão e Contabilidade",
  "Arts and Humanities": "Artes e Humanidades",
};

// Tradução de posições de autoria
export const authorPositionTranslations: Record<string, string> = {
  "first": "Primeiro Autor",
  "middle": "Autor",
  "last": "Último Autor",
};

// Função para reconstruir abstract do índice invertido
export function reconstructAbstract(
  invertedIndex: Record<string, number[]>
): string {
  if (!invertedIndex || Object.keys(invertedIndex).length === 0) {
    return "";
  }

  // Criar array de pares [posição, palavra]
  const wordPositions: [number, string][] = [];
  
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const position of positions) {
      wordPositions.push([position, word]);
    }
  }

  // Ordenar por posição
  wordPositions.sort((a, b) => a[0] - b[0]);

  // Reconstruir texto
  return wordPositions.map(([_, word]) => word).join(" ");
}

// Função para traduzir tipo de publicação
export function translateType(type: string): string {
  return typeTranslations[type] || type;
}

// Função para traduzir status OA
export function translateOAStatus(status: string): string {
  return oaStatusTranslations[status] || status;
}

// Função para traduzir país
export function translateCountry(countryCode: string): string {
  return countryTranslations[countryCode] || countryCode;
}

// Função para traduzir domínio
export function translateDomain(domain: string): string {
  return domainTranslations[domain] || domain;
}

// Função para traduzir campo
export function translateField(field: string): string {
  return fieldTranslations[field] || field;
}

// Função para traduzir posição de autoria
export function translateAuthorPosition(position: string): string {
  return authorPositionTranslations[position] || position;
}

// Função para obter bandeira do país
export function getCountryFlag(countryCode: string): string {
  return countryFlags[countryCode] || "🌐";
}

// Função para formatar data
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Função para formatar número com separadores
export function formatNumber(num: number): string {
  return num.toLocaleString("pt-BR");
}

// Função para obter classe de cor baseada em FWCI
export function getFWCIColor(fwci: number): string {
  if (fwci >= 2) return "text-success";
  if (fwci >= 1) return "text-primary";
  if (fwci >= 0.5) return "text-warning";
  return "text-muted-foreground";
}

// Função para extrair nome curto da instituição
export function getShortInstitutionName(fullName: string): string {
  // Remove partes comuns no final
  return fullName
    .replace(/,?\s*(University|Universidade|Universidad|Università)$/i, "")
    .replace(/\s*\(.*?\)\s*/g, "")
    .trim();
}
