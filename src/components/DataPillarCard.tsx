import { Card } from "./ui/card";
import { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { DataSourceBadge } from "./DataSourceBadge";

interface DataPillarCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  stats: Array<{ label: string; value: string }>;
  color: string;
  sources?: Array<"MAPA" | "INPI" | "Abisolo" | "IBGE" | "Embrapa" | "ANVISA" | "IBAMA">;
}

export const DataPillarCard = ({ title, description, icon: Icon, stats, color, sources }: DataPillarCardProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 animate-in border-l-4" style={{ borderLeftColor: `hsl(var(${color}))` }}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-lg`} style={{ backgroundColor: `hsl(var(${color}) / 0.1)` }}>
          <Icon className="h-6 w-6" style={{ color: `hsl(var(${color}))` }} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          {sources && sources.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {sources.map((source, idx) => (
                <DataSourceBadge key={idx} source={source} size="sm" />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <Button variant="ghost" className="w-full justify-between" size="sm">
        Ver detalhes
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Card>
  );
};
