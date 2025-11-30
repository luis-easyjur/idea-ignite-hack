import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Lightbulb, FileCheck, Rocket, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { useDataCorrelations, type CorrelationEvent } from "@/hooks/useDataCorrelations";

export const CorrelationTimeline = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { data, isLoading, error } = useDataCorrelations();

  const iconMap = {
    science: FileText,
    patent: Lightbulb,
    regulatory: FileCheck,
    launch: Rocket,
    prediction: TrendingUp,
  };

  const colorMap = {
    science: "text-blue-500",
    patent: "text-yellow-500",
    regulatory: "text-green-500",
    launch: "text-purple-500",
    prediction: "text-orange-500 opacity-60",
  };

  const labelMap = {
    science: "Ciência",
    patent: "Patente",
    regulatory: "Regulatório",
    launch: "Lançamento",
    prediction: "Previsão",
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar correlações. Tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </Card>
    );
  }

  const correlations = data?.correlations || [];
  const selectedCorrelation = correlations[0]; // Show first correlation

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-primary/5">
      <div className="space-y-4">
        {/* Header with Toggle */}
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">
              Correlação Inteligente
            </h3>
            <Badge variant="outline" className="text-xs">
              IA
            </Badge>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>

        {/* Timeline Content */}
        {isOpen && selectedCorrelation && (
          <div className="space-y-3">
            {/* Correlation Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {selectedCorrelation.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedCorrelation.company}
                </p>
              </div>
              {selectedCorrelation.confidence && (
                <Badge variant="secondary" className="text-xs">
                  {selectedCorrelation.confidence}% confiança
                </Badge>
              )}
            </div>
            
            {/* Timeline Items */}
            <div className="relative pl-8 space-y-4">
              {/* Vertical Line */}
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
              
              {selectedCorrelation.events.map((event: CorrelationEvent, idx: number) => {
                const Icon = iconMap[event.type];
                const isPrediction = event.type === 'prediction';
                
                return (
                  <div key={idx} className="relative">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-6 ${colorMap[event.type]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    {/* Event Card */}
                    <div className={`p-3 rounded-lg border ${
                      isPrediction 
                        ? 'border-dashed bg-muted/30 border-orange-500/30' 
                        : 'bg-card border-border'
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={isPrediction ? "outline" : "secondary"} className="text-xs">
                              {labelMap[event.type]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {event.date}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {event.title}
                          </p>
                          {event.description && (
                            <p className="text-xs text-muted-foreground">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Prediction Note */}
            {selectedCorrelation.prediction && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-xs text-foreground font-medium mb-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  Previsão de IA
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedCorrelation.prediction}
                </p>
                {selectedCorrelation.timeline_months && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Timeline estimado: {selectedCorrelation.timeline_months} meses
                  </p>
                )}
              </div>
            )}

            {/* Data Source */}
            {data?.metadata && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Análise baseada em {data.metadata.data_analyzed.patents} patentes e {data.metadata.data_analyzed.regulatory} registros regulatórios
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
