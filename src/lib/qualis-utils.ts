import { CAPESStudy } from "@/types/capes";

export type QualisClassification = 'A1' | 'A2' | 'B1' | 'B2' | 'B3' | 'B4' | 'C';

// Cores para cada classificação Qualis
export const qualisColors: Record<QualisClassification, string> = {
  'A1': 'bg-emerald-600 text-white border-emerald-600',
  'A2': 'bg-green-600 text-white border-green-600',
  'B1': 'bg-blue-600 text-white border-blue-600',
  'B2': 'bg-sky-600 text-white border-sky-600',
  'B3': 'bg-amber-600 text-white border-amber-600',
  'B4': 'bg-orange-600 text-white border-orange-600',
  'C': 'bg-gray-600 text-white border-gray-600',
};

// Instituições de prestígio que tendem a ter notas maiores
const prestigiousInstitutions = [
  'USP', 'UNICAMP', 'UFRJ', 'UFRGS', 'UFMG', 'UnB', 'UFSC',
  'UNESP', 'UFC', 'UFPE', 'UFSCar', 'PUC-RIO', 'PUC-SP'
];

// Gerar Qualis mockado baseado em critérios
export const generateMockQualis = (study: CAPESStudy): QualisClassification => {
  let score = 0;
  
  // Pontuação baseada no tipo (TESE tem maior pontuação)
  if (study.tipo === 'TESE') {
    score += 2;
  } else {
    score += 1;
  }
  
  // Pontuação baseada na instituição
  const hasPrestigiousInstitution = prestigiousInstitutions.some(
    inst => study.instituicao.toUpperCase().includes(inst)
  );
  
  if (hasPrestigiousInstitution) {
    score += 2;
  } else {
    score += 1;
  }
  
  // Pontuação baseada na grande área (algumas áreas tendem a ter mais publicações A1/A2)
  const highImpactAreas = ['CIÊNCIAS DA SAÚDE', 'ENGENHARIAS', 'CIÊNCIAS EXATAS E DA TERRA'];
  if (highImpactAreas.some(area => study.grandeArea?.includes(area))) {
    score += 1;
  }
  
  // Adicionar variação aleatória (baseada no ID para manter consistência)
  const randomVariation = parseInt(study.id.slice(-2), 16) % 3;
  score += randomVariation;
  
  // Mapear pontuação para classificação Qualis
  if (score >= 6) return 'A1';
  if (score >= 5) return 'A2';
  if (score >= 4) return 'B1';
  if (score >= 3) return 'B2';
  if (score >= 2) return 'B3';
  if (score >= 1) return 'B4';
  return 'C';
};

// Descrição do que significa cada classificação
export const qualisDescriptions: Record<QualisClassification, string> = {
  'A1': 'Excelência máxima - Periódicos de maior prestígio e impacto na área',
  'A2': 'Excelente - Periódicos de alta qualidade e relevância científica',
  'B1': 'Muito bom - Periódicos reconhecidos com boa avaliação',
  'B2': 'Bom - Periódicos de qualidade satisfatória',
  'B3': 'Regular - Periódicos com qualidade mínima aceitável',
  'B4': 'Regular baixo - Periódicos com menor impacto',
  'C': 'Básico - Periódicos com impacto limitado',
};
