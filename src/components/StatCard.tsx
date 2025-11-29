import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";
import { DataSourceBadge } from "./DataSourceBadge";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor: string;
  source?: "MAPA" | "INPI" | "Abisolo" | "IBGE" | "Embrapa" | "ANVISA" | "IBAMA";
}

export const StatCard = ({ title, value, change, changeType, icon: Icon, iconColor, source }: StatCardProps) => {
  const changeColors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300 animate-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {source && <DataSourceBadge source={source} size="sm" />}
          </div>
          <h3 className="text-3xl font-bold text-foreground mb-2">{value}</h3>
          <p className={`text-sm font-medium ${changeColors[changeType]}`}>
            {change}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
};
