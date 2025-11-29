import { Badge } from "./ui/badge";
import { Database, FileText, Building2, BarChart3 } from "lucide-react";

interface DataSourceBadgeProps {
  source: "MAPA" | "INPI" | "Abisolo" | "IBGE" | "Embrapa" | "ANVISA" | "IBAMA";
  size?: "sm" | "default";
}

export const DataSourceBadge = ({ source, size = "default" }: DataSourceBadgeProps) => {
  const sourceConfig = {
    MAPA: {
      icon: FileText,
      color: "bg-chart-2/10 text-chart-2 border-chart-2/30",
      label: "MAPA"
    },
    INPI: {
      icon: Database,
      color: "bg-chart-3/10 text-chart-3 border-chart-3/30",
      label: "INPI"
    },
    Abisolo: {
      icon: Building2,
      color: "bg-chart-1/10 text-chart-1 border-chart-1/30",
      label: "Abisolo"
    },
    IBGE: {
      icon: BarChart3,
      color: "bg-chart-4/10 text-chart-4 border-chart-4/30",
      label: "IBGE"
    },
    Embrapa: {
      icon: Database,
      color: "bg-chart-5/10 text-chart-5 border-chart-5/30",
      label: "Embrapa"
    },
    ANVISA: {
      icon: FileText,
      color: "bg-secondary/10 text-secondary border-secondary/30",
      label: "ANVISA"
    },
    IBAMA: {
      icon: FileText,
      color: "bg-accent/10 text-accent border-accent/30",
      label: "IBAMA"
    }
  };

  const config = sourceConfig[source];
  const Icon = config.icon;
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const textSize = size === "sm" ? "text-xs" : "text-xs";

  return (
    <Badge variant="outline" className={`${config.color} ${textSize} gap-1`}>
      <Icon className={iconSize} />
      {config.label}
    </Badge>
  );
};
