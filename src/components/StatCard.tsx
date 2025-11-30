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
export const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
  source
}: StatCardProps) => {
  const changeColors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground"
  };
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-foreground">{value}</h3>
          <p className={`text-xs mt-2 ${changeColors[changeType]}`}>{change}</p>
        </div>
        <div className={`p-3 rounded-lg ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {source && (
        <div className="mt-4 pt-4 border-t">
          <DataSourceBadge source={source} />
        </div>
      )}
    </Card>
  );
};