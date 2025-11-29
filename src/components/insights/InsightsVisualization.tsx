import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InsightCard, Insight } from "./InsightCard";

export type { Insight };
import { Download, Filter, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InsightsVisualizationProps {
  insights: Insight[];
  onInsightSelect?: (insight: Insight) => void;
}

export const InsightsVisualization = ({ insights, onInsightSelect }: InsightsVisualizationProps) => {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [impactFilter, setImpactFilter] = useState<string>("all");

  const filteredInsights = insights.filter(insight => {
    if (typeFilter !== "all" && insight.type !== typeFilter) return false;
    if (impactFilter !== "all" && insight.impact !== impactFilter) return false;
    return true;
  });

  const insightsByType = {
    opportunity: filteredInsights.filter(i => i.type === "opportunity"),
    trend: filteredInsights.filter(i => i.type === "trend"),
    warning: filteredInsights.filter(i => i.type === "warning"),
    recommendation: filteredInsights.filter(i => i.type === "recommendation")
  };

  const stats = {
    total: insights.length,
    opportunities: insightsByType.opportunity.length,
    trends: insightsByType.trend.length,
    warnings: insightsByType.warning.length,
    recommendations: insightsByType.recommendation.length
  };

  const exportInsights = () => {
    const dataStr = JSON.stringify(insights, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `insights-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (insights.length === 0) {
    return (
      <Card className="p-12">
        <CardContent className="flex flex-col items-center justify-center text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum insight gerado ainda</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Use o chat ao lado para fazer perguntas e solicitar análises. Os insights gerados aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Oportunidades
            </CardDescription>
            <CardTitle className="text-2xl">{stats.opportunities}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Tendências
            </CardDescription>
            <CardTitle className="text-2xl">{stats.trends}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Alertas
            </CardDescription>
            <CardTitle className="text-2xl">{stats.warnings}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Insights Gerados</CardTitle>
              <CardDescription>
                {filteredInsights.length} de {insights.length} insights
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="opportunity">Oportunidades</SelectItem>
                  <SelectItem value="trend">Tendências</SelectItem>
                  <SelectItem value="warning">Alertas</SelectItem>
                  <SelectItem value="recommendation">Recomendações</SelectItem>
                </SelectContent>
              </Select>
              <Select value={impactFilter} onValueChange={setImpactFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Impacto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={exportInsights}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Todos ({filteredInsights.length})</TabsTrigger>
              <TabsTrigger value="opportunity">
                Oportunidades ({insightsByType.opportunity.length})
              </TabsTrigger>
              <TabsTrigger value="trend">
                Tendências ({insightsByType.trend.length})
              </TabsTrigger>
              <TabsTrigger value="warning">
                Alertas ({insightsByType.warning.length})
              </TabsTrigger>
              <TabsTrigger value="recommendation">
                Recomendações ({insightsByType.recommendation.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onSelect={onInsightSelect}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="opportunity" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insightsByType.opportunity.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onSelect={onInsightSelect}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trend" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insightsByType.trend.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onSelect={onInsightSelect}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="warning" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insightsByType.warning.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onSelect={onInsightSelect}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommendation" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insightsByType.recommendation.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onSelect={onInsightSelect}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

