import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Clock } from "lucide-react";

interface AlertItemProps {
  title: string;
  description: string;
  time: string;
  type: "regulatory" | "market" | "patent" | "science";
  priority: "high" | "medium" | "low";
}

export const AlertItem = ({ title, description, time, type, priority }: AlertItemProps) => {
  const typeColors = {
    regulatory: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    market: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    patent: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    science: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  };

  const priorityColors = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-warning/10 text-warning border-warning/20",
    low: "bg-muted text-muted-foreground border-border",
  };

  const typeLabels = {
    regulatory: "Regulatório",
    market: "Mercado",
    patent: "Patente",
    science: "Científico",
  };

  const priorityLabels = {
    high: "Alta",
    medium: "Média",
    low: "Baixa",
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-300 animate-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={typeColors[type]}>
              {typeLabels[type]}
            </Badge>
            <Badge variant="outline" className={priorityColors[priority]}>
              {priorityLabels[priority]}
            </Badge>
          </div>
          <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
          <Clock className="h-3 w-3" />
          {time}
        </div>
      </div>
    </Card>
  );
};
