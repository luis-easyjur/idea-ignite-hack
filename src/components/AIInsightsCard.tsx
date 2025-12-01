import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketInsights } from "@/hooks/useMarketInsights";
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AIInsightsCard = () => {
  const { data, isLoading, error } = useMarketInsights();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar insights de IA. Tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </Card>
    );
  }

  if (!data?.insights) return null;

  const { insights } = data;

  const priorityColors = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-green-500"
  };

  const potentialColors = {
    high: "bg-green-500",
    medium: "bg-blue-500",
    low: "bg-gray-500"
  };

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-background to-muted/20">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h3 className="text-lg sm:text-xl font-bold text-foreground">Insights de IA</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            Gerado com IA
          </Badge>
        </div>

        {/* Main Trend */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            <h4 className="text-sm sm:text-base font-semibold text-foreground">Tendência Principal</h4>
          </div>
          <div className="pl-4 sm:pl-6 space-y-1">
            <p className="text-sm sm:text-base font-medium text-foreground">{insights.main_trend.title}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{insights.main_trend.description}</p>
            <Badge variant="secondary" className="text-xs">
              Crescimento: {insights.main_trend.growth_rate}
            </Badge>
          </div>
        </div>

        {/* Opportunities */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            <h4 className="font-semibold text-foreground">Oportunidades</h4>
          </div>
          <div className="space-y-2 pl-6">
            {insights.opportunities.map((opp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${potentialColors[opp.potential]}`} />
                  <p className="text-sm font-medium text-foreground">{opp.title}</p>
                </div>
                <p className="text-xs text-muted-foreground ml-4">{opp.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Threats */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <h4 className="font-semibold text-foreground">Ameaças</h4>
          </div>
          <div className="space-y-2 pl-6">
            {insights.threats.map((threat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${priorityColors[threat.severity]}`} />
                  <p className="text-sm font-medium text-foreground">{threat.title}</p>
                </div>
                <p className="text-xs text-muted-foreground ml-4">{threat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Forecast 3-4 Years */}
        <div className="space-y-2 bg-primary/5 p-4 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-foreground">Previsão 3-4 Anos</h4>
          </div>
          <div className="space-y-2 pl-6">
            <p className="text-sm text-foreground font-medium">{insights.forecast_3_4_years.scenario}</p>
            <div className="space-y-1">
              {insights.forecast_3_4_years.key_predictions.map((pred, idx) => (
                <p key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{pred}</span>
                </p>
              ))}
            </div>
            <Badge variant="secondary" className="text-xs mt-2">
              {insights.forecast_3_4_years.market_size_estimate}
            </Badge>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-purple-500" />
            <h4 className="font-semibold text-foreground">Recomendações</h4>
          </div>
          <div className="space-y-2 pl-6">
            {insights.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className={`h-2 w-2 rounded-full mt-1.5 ${priorityColors[rec.priority]}`} />
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{rec.action}</p>
                  <p className="text-xs text-muted-foreground">Timeline: {rec.timeline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        {data.metadata && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Análise baseada em {data.metadata.data_analyzed.patents} patentes, {data.metadata.data_analyzed.regulatory} registros regulatórios, e dados de {data.metadata.data_analyzed.companies} empresas
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
