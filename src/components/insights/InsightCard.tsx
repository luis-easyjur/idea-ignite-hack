import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb, Target, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: "opportunity" | "trend" | "warning" | "recommendation";
  confidence?: number;
  impact?: "low" | "medium" | "high";
  category?: string;
  sources?: string[];
  createdAt: string;
  metadata?: Record<string, any>;
}

interface InsightCardProps {
  insight: Insight;
  onSelect?: (insight: Insight) => void;
}

const typeConfig = {
  opportunity: {
    icon: Lightbulb,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    label: "Oportunidade"
  },
  trend: {
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Tendência"
  },
  warning: {
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    label: "Atenção"
  },
  recommendation: {
    icon: Target,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    label: "Recomendação"
  }
};

const impactConfig = {
  low: { label: "Baixo", color: "bg-gray-100 text-gray-700" },
  medium: { label: "Médio", color: "bg-yellow-100 text-yellow-700" },
  high: { label: "Alto", color: "bg-red-100 text-red-700" }
};

export const InsightCard = ({ insight, onSelect }: InsightCardProps) => {
  const config = typeConfig[insight.type];
  const Icon = config.icon;

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all cursor-pointer",
        config.borderColor && `border-2 ${config.borderColor}`
      )}
      onClick={() => onSelect?.(insight)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>
            <div>
              <CardTitle className="text-lg">{insight.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {config.label}
                </Badge>
                {insight.category && (
                  <Badge variant="secondary" className="text-xs">
                    {insight.category}
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {insight.description}
        </p>
        
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            {insight.confidence !== undefined && (
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {insight.confidence}% confiança
                </span>
              </div>
            )}
            {insight.impact && (
              <Badge 
                variant="outline" 
                className={cn("text-xs", impactConfig[insight.impact].color)}
              >
                Impacto: {impactConfig[insight.impact].label}
              </Badge>
            )}
          </div>
          
          {insight.sources && insight.sources.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Fontes:</span>
              <div className="flex gap-1">
                {insight.sources.slice(0, 2).map((source, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {source}
                  </Badge>
                ))}
                {insight.sources.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{insight.sources.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          {new Date(insight.createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </div>
      </CardContent>
    </Card>
  );
};

