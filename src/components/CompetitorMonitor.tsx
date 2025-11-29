import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, FileText, Shield } from "lucide-react";
import { DataSourceBadge } from "./DataSourceBadge";

interface CompetitorActivity {
  company: string;
  activityScore: number;
  recentMoves: {
    type: "registro" | "patente" | "lancamento";
    description: string;
    date: string;
    source?: "MAPA" | "INPI" | "Abisolo" | "IBGE";
  }[];
}

const competitors: CompetitorActivity[] = [
  {
    company: "Stoller do Brasil",
    activityScore: 95,
    recentMoves: [
      { type: "lancamento", description: "Novo bioestimulante para soja - Stimulate Max", date: "3 dias", source: "MAPA" },
      { type: "registro", description: "2 registros MAPA aprovados para linha foliar", date: "1 semana", source: "MAPA" },
      { type: "patente", description: "Patente de formulação com extrato de algas", date: "2 semanas", source: "INPI" },
    ]
  },
  {
    company: "FMC Agricultural Solutions",
    activityScore: 87,
    recentMoves: [
      { type: "patente", description: "Tecnologia de microencapsulação aprovada", date: "5 dias", source: "INPI" },
      { type: "registro", description: "Biodefensivo para controle de pragas", date: "1 semana", source: "MAPA" },
      { type: "lancamento", description: "Adjuvante de nova geração lançado", date: "3 semanas", source: "MAPA" },
    ]
  },
  {
    company: "UPL Brasil",
    activityScore: 82,
    recentMoves: [
      { type: "registro", description: "Biofertilizante à base de Azospirillum", date: "1 semana", source: "MAPA" },
      { type: "lancamento", description: "Linha completa de nutrição foliar", date: "2 semanas", source: "MAPA" },
    ]
  },
  {
    company: "BASF Agricultural Solutions",
    activityScore: 78,
    recentMoves: [
      { type: "patente", description: "Bioestimulante com tecnologia exclusiva", date: "4 dias", source: "INPI" },
      { type: "registro", description: "Expansão de portfólio de biológicos", date: "10 dias", source: "MAPA" },
    ]
  },
  {
    company: "Koppert Brasil",
    activityScore: 73,
    recentMoves: [
      { type: "lancamento", description: "Biodefensivo para doenças foliares", date: "1 semana", source: "MAPA" },
      { type: "registro", description: "Novo inoculante para leguminosas", date: "3 semanas", source: "MAPA" },
    ]
  },
];

const getActivityColor = (score: number) => {
  if (score >= 90) return "text-destructive";
  if (score >= 80) return "text-warning";
  return "text-success";
};

const getActivityLabel = (score: number) => {
  if (score >= 90) return "Muito Alta";
  if (score >= 80) return "Alta";
  return "Moderada";
};

const getMoveIcon = (type: string) => {
  switch (type) {
    case "registro": return <FileText className="h-4 w-4" />;
    case "patente": return <Shield className="h-4 w-4" />;
    case "lancamento": return <TrendingUp className="h-4 w-4" />;
    default: return null;
  }
};

const getMoveColor = (type: string) => {
  switch (type) {
    case "registro": return "bg-chart-2/10 text-chart-2";
    case "patente": return "bg-chart-3/10 text-chart-3";
    case "lancamento": return "bg-chart-1/10 text-chart-1";
    default: return "bg-muted";
  }
};

export const CompetitorMonitor = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Monitoramento de Concorrentes</h3>
            <p className="text-sm text-muted-foreground">Principais players e atividades recentes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {competitors.map((competitor, idx) => (
          <div key={idx} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-foreground mb-1">{competitor.company}</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Índice de Atividade:</span>
                  <span className={`text-sm font-bold ${getActivityColor(competitor.activityScore)}`}>
                    {competitor.activityScore}/100
                  </span>
                  <Badge variant="outline" className={getActivityColor(competitor.activityScore)}>
                    {getActivityLabel(competitor.activityScore)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {competitor.recentMoves.map((move, moveIdx) => (
                <div key={moveIdx} className="flex items-start gap-3 text-sm">
                  <div className={`p-1.5 rounded ${getMoveColor(move.type)}`}>
                    {getMoveIcon(move.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-foreground">{move.description}</p>
                      {move.source && <DataSourceBadge source={move.source} size="sm" />}
                    </div>
                    <span className="text-xs text-muted-foreground">há {move.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
