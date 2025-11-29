import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Lightbulb, Sparkles, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const projectionData = [
  { year: '2024', nutrição: 2.8, bioestimulantes: 1.9, biodefensivos: 1.5, adjuvantes: 0.9, biofertilizantes: 0.7 },
  { year: '2025', nutrição: 3.1, bioestimulantes: 2.3, biodefensivos: 1.9, adjuvantes: 1.0, biofertilizantes: 0.9 },
  { year: '2026', nutrição: 3.4, bioestimulantes: 2.8, biodefensivos: 2.4, adjuvantes: 1.2, biofertilizantes: 1.2 },
  { year: '2027', nutrição: 3.7, bioestimulantes: 3.4, biodefensivos: 3.0, adjuvantes: 1.4, biofertilizantes: 1.5 },
];

const opportunities = [
  {
    title: "Bioestimulantes com Nanotecnologia",
    confidence: 92,
    impact: "Alto",
    description: "Tendência crescente em publicações científicas sobre nano-formulações",
    source: "23 artigos científicos + 5 patentes recentes"
  },
  {
    title: "Biofertilizantes para Cana-de-Açúcar",
    confidence: 88,
    impact: "Alto",
    description: "Gap de mercado identificado no Centro-Sul",
    source: "Análise de mercado + dados MAPA"
  },
  {
    title: "Adjuvantes Sustentáveis",
    confidence: 85,
    impact: "Médio",
    description: "Pressão regulatória favorece produtos eco-friendly",
    source: "Normas IBAMA + tendências ESG"
  },
];

const emergingTechs = [
  {
    tech: "RNA Interferência (RNAi)",
    area: "Biodefensivos",
    maturity: "Emergente",
    timeline: "2-3 anos"
  },
  {
    tech: "CRISPR para Bioinsumos",
    area: "Bioestimulantes",
    maturity: "Pesquisa",
    timeline: "3-5 anos"
  },
  {
    tech: "IA para Formulação Personalizada",
    area: "Nutrição Foliar",
    maturity: "Desenvolvimento",
    timeline: "1-2 anos"
  },
];

export const TrendForecast = () => {
  return (
    <div className="space-y-6">
      {/* Projeção de Crescimento */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Projeção de Mercado 2024-2027</CardTitle>
              <p className="text-sm text-muted-foreground">Previsão baseada em IA e dados históricos (em bilhões R$)</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="bioestimulantes" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Bioestimulantes" />
              <Line type="monotone" dataKey="biodefensivos" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Biodefensivos" />
              <Line type="monotone" dataKey="nutrição" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Nutrição Foliar" />
              <Line type="monotone" dataKey="biofertilizantes" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Biofertilizantes" />
              <Line type="monotone" dataKey="adjuvantes" stroke="hsl(var(--chart-5))" strokeWidth={2} name="Adjuvantes" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-2">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Insight da IA</p>
                <p className="text-sm text-muted-foreground">Bioestimulantes apresentam maior potencial de crescimento (79% até 2027), seguidos por biodefensivos (100%) e biofertilizantes (114%).</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oportunidades Identificadas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Target className="h-5 w-5 text-warning" />
            </div>
            <div>
              <CardTitle>Oportunidades Identificadas</CardTitle>
              <p className="text-sm text-muted-foreground">Gaps de mercado e tendências emergentes</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunities.map((opp, idx) => (
              <div key={idx} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-1">{opp.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{opp.description}</p>
                    <p className="text-xs text-muted-foreground italic">Fonte: {opp.source}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <Badge variant={opp.impact === "Alto" ? "default" : "secondary"}>
                      {opp.impact} Impacto
                    </Badge>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Confiança</span>
                      <p className="text-lg font-bold text-primary">{opp.confidence}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tecnologias Emergentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Lightbulb className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <CardTitle>Tecnologias Emergentes</CardTitle>
              <p className="text-sm text-muted-foreground">Inovações com potencial disruptivo</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emergingTechs.map((tech, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{tech.tech}</h4>
                  <p className="text-sm text-muted-foreground">{tech.area}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Maturidade</p>
                    <Badge variant="outline">{tech.maturity}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                    <span className="text-sm font-semibold text-foreground">{tech.timeline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
