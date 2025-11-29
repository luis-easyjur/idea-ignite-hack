import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumber, getFWCIColor } from "@/lib/research-utils";
import { TrendingUp, Award } from "lucide-react";

interface ImpactMetricsProps {
  citedByCount: number;
  fwci?: number;
  citationPercentile?: {
    value: number;
    is_in_top_1_percent: boolean;
    is_in_top_10_percent: boolean;
  };
}

export function ImpactMetrics({ citedByCount, fwci, citationPercentile }: ImpactMetricsProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Citações */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              {formatNumber(citedByCount)} {citedByCount === 1 ? "citação" : "citações"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Número de vezes que este trabalho foi citado</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* FWCI */}
      {fwci !== undefined && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="gap-1">
                <span className={getFWCIColor(fwci)}>
                  FWCI: {fwci.toFixed(2)}
                </span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold mb-1">Índice de Citação Ponderado por Campo</p>
              <p className="text-xs">
                Compara as citações recebidas com a média mundial do campo.
                Valores acima de 1.0 indicam desempenho acima da média.
              </p>
              <div className="mt-2">
                <Progress value={Math.min((fwci / 3) * 100, 100)} className="h-1" />
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Top Percentile */}
      {citationPercentile && (
        <>
          {citationPercentile.is_in_top_1_percent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="default" className="gap-1 bg-success text-success-foreground">
                    <Award className="h-3 w-3" />
                    Top 1%
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Este trabalho está entre os 1% mais citados em seu campo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {citationPercentile.is_in_top_10_percent && !citationPercentile.is_in_top_1_percent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="default" className="gap-1 bg-primary text-primary-foreground">
                    <Award className="h-3 w-3" />
                    Top 10%
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Este trabalho está entre os 10% mais citados em seu campo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </>
      )}
    </div>
  );
}
