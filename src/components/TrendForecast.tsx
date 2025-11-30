import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Lightbulb, Sparkles, Target, ExternalLink } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DataSourceBadge } from "./DataSourceBadge";
const projectionData = [{
  year: '2024',
  nutrição: 2.8,
  bioestimulantes: 1.9,
  biodefensivos: 1.5,
  adjuvantes: 0.9,
  biofertilizantes: 0.7
}, {
  year: '2025',
  nutrição: 3.1,
  bioestimulantes: 2.3,
  biodefensivos: 1.9,
  adjuvantes: 1.0,
  biofertilizantes: 0.9
}, {
  year: '2026',
  nutrição: 3.4,
  bioestimulantes: 2.8,
  biodefensivos: 2.4,
  adjuvantes: 1.2,
  biofertilizantes: 1.2
}, {
  year: '2027',
  nutrição: 3.7,
  bioestimulantes: 3.4,
  biodefensivos: 3.0,
  adjuvantes: 1.4,
  biofertilizantes: 1.5
}];
const opportunities = [{
  title: "Bioestimulantes com Nanotecnologia",
  confidence: 92,
  impact: "Alto",
  description: "Tendência crescente em publicações científicas sobre nano-formulações",
  source: "23 artigos científicos + 5 patentes recentes",
  dataSources: ["Embrapa" as const, "INPI" as const],
  url: "https://www.embrapa.br/busca-de-noticias/-/noticia/nanotecnologia"
}, {
  title: "Biofertilizantes para Cana-de-Açúcar",
  confidence: 88,
  impact: "Alto",
  description: "Gap de mercado identificado no Centro-Sul",
  source: "Análise de mercado + dados MAPA",
  dataSources: ["IBGE" as const, "MAPA" as const],
  url: "https://www.gov.br/agricultura/pt-br/assuntos/insumos-agropecuarios"
}, {
  title: "Adjuvantes Sustentáveis",
  confidence: 85,
  impact: "Médio",
  description: "Pressão regulatória favorece produtos eco-friendly",
  source: "Normas IBAMA + tendências ESG",
  dataSources: ["IBAMA" as const, "MAPA" as const],
  url: "https://www.gov.br/ibama/pt-br"
}];
const emergingTechs = [{
  tech: "RNA Interferência (RNAi)",
  area: "Biodefensivos",
  maturity: "Emergente",
  timeline: "2-3 anos",
  url: "https://www.embrapa.br/busca-de-noticias/-/noticia/biotecnologia"
}, {
  tech: "CRISPR para Bioinsumos",
  area: "Bioestimulantes",
  maturity: "Pesquisa",
  timeline: "3-5 anos",
  url: "https://www.embrapa.br/biotecnologia"
}, {
  tech: "IA para Formulação Personalizada",
  area: "Nutrição Foliar",
  maturity: "Desenvolvimento",
  timeline: "1-2 anos",
  url: "https://www.embrapa.br/agricultura-digital"
}];
export const TrendForecast = () => {
  return <div className="space-y-6">
      {/* Projeção de Crescimento */}
      <Card>
        
        
      </Card>

      {/* Oportunidades Identificadas */}
      

      {/* Tecnologias Emergentes */}
      <Card>
        
        
      </Card>
    </div>;
};