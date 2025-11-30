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
  return;
};