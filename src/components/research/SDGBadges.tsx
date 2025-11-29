import { SDG } from "@/types/research";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Target } from "lucide-react";

interface SDGBadgesProps {
  sdgs: SDG[];
}

// Tradução dos ODS
const sdgTranslations: Record<string, string> = {
  "No Poverty": "Erradicação da Pobreza",
  "Zero Hunger": "Fome Zero e Agricultura Sustentável",
  "Good Health and Well-being": "Saúde e Bem-Estar",
  "Quality Education": "Educação de Qualidade",
  "Gender Equality": "Igualdade de Gênero",
  "Clean Water and Sanitation": "Água Potável e Saneamento",
  "Affordable and Clean Energy": "Energia Limpa e Acessível",
  "Decent Work and Economic Growth": "Trabalho Decente e Crescimento Econômico",
  "Industry, Innovation and Infrastructure": "Indústria, Inovação e Infraestrutura",
  "Reduced Inequalities": "Redução das Desigualdades",
  "Sustainable Cities and Communities": "Cidades e Comunidades Sustentáveis",
  "Responsible Consumption and Production": "Consumo e Produção Responsáveis",
  "Climate Action": "Ação Contra a Mudança Global do Clima",
  "Life Below Water": "Vida na Água",
  "Life on Land": "Vida Terrestre",
  "Peace, Justice and Strong Institutions": "Paz, Justiça e Instituições Eficazes",
  "Partnerships for the Goals": "Parcerias e Meios de Implementação",
};

// Cores dos ODS
const sdgColors: Record<number, string> = {
  1: "bg-[#E5243B] text-white",
  2: "bg-[#DDA63A] text-white",
  3: "bg-[#4C9F38] text-white",
  4: "bg-[#C5192D] text-white",
  5: "bg-[#FF3A21] text-white",
  6: "bg-[#26BDE2] text-white",
  7: "bg-[#FCC30B] text-white",
  8: "bg-[#A21942] text-white",
  9: "bg-[#FD6925] text-white",
  10: "bg-[#DD1367] text-white",
  11: "bg-[#FD9D24] text-white",
  12: "bg-[#BF8B2E] text-white",
  13: "bg-[#3F7E44] text-white",
  14: "bg-[#0A97D9] text-white",
  15: "bg-[#56C02B] text-white",
  16: "bg-[#00689D] text-white",
  17: "bg-[#19486A] text-white",
};

function getSDGNumber(id: string): number {
  // Extrair número do ID (formato: https://metadata.un.org/sdg/3)
  const match = id.match(/\/(\d+)$/);
  return match ? parseInt(match[1]) : 0;
}

export function SDGBadges({ sdgs }: SDGBadgesProps) {
  if (!sdgs || sdgs.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Target className="h-4 w-4 text-primary" />
      {sdgs.map((sdg) => {
        const sdgNumber = getSDGNumber(sdg.id);
        const translatedName = sdgTranslations[sdg.display_name] || sdg.display_name;
        const colorClass = sdgColors[sdgNumber] || "bg-primary text-primary-foreground";

        return (
          <TooltipProvider key={sdg.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`${colorClass} font-semibold`}>
                  ODS {sdgNumber}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{translatedName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Relevância: {(sdg.score * 100).toFixed(0)}%
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}
