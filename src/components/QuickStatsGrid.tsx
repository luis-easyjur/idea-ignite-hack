import { Package, Shield, Building2, Sprout } from "lucide-react";
import { Card } from "./ui/card";
import { usePatentStats } from "@/hooks/usePatentStats";
import { useElasticProductStats } from "@/hooks/useElasticProductStats";
import { Skeleton } from "./ui/skeleton";

export const QuickStatsGrid = () => {
  const { data: patentStats } = usePatentStats();
  const { data: productStats, isLoading: isLoadingProducts } = useElasticProductStats();

  if (isLoadingProducts) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Produtos",
      value: productStats?.totals.total.toLocaleString('pt-BR') || "0",
      icon: Package,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      borderColor: "border-chart-1",
      iconBgColor: "bg-chart-1/20"
    },
    {
      label: "Patentes",
      value: patentStats?.total?.toString() || "0",
      icon: Shield,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      borderColor: "border-chart-3",
      iconBgColor: "bg-chart-3/20"
    },
    {
      label: "Empresas",
      value: productStats?.totals.companies.toString() || "0",
      icon: Building2,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      borderColor: "border-chart-2",
      iconBgColor: "bg-chart-2/20"
    },
    {
      label: "Culturas",
      value: productStats?.totals.cultures.toString() || "0",
      icon: Sprout,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      borderColor: "border-chart-4",
      iconBgColor: "bg-chart-4/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.label} 
            className={`p-4 hover:shadow-lg transition-all border-l-4 ${stat.borderColor} ${stat.bgColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <div className={`p-2 rounded-full ${stat.iconBgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </Card>
        );
      })}
    </div>
  );
};
