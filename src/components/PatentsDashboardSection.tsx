import { Link } from "react-router-dom";
import { Shield, Building2, Users, FileCheck, TrendingUp, Award } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { usePatentDashboardStats } from "@/hooks/usePatentDashboardStats";
import { PatentYearChart } from "./PatentYearChart";
import { TopCompaniesCard } from "./TopCompaniesCard";
export const PatentsDashboardSection = () => {
  const {
    data: stats,
    isLoading
  } = usePatentDashboardStats();
  if (isLoading) {
    return <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>;
  }
  if (!stats) return null;
  const categoryLabels: Record<string, string> = {
    foliar_nutrition: "Nutrição Foliar",
    biostimulants: "Bioestimulantes",
    biodefensives: "Biodefensivos",
    adjuvants: "Adjuvantes",
    biofertilizers: "Biofertilizantes"
  };
  return <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-chart-3/10">
            <Shield className="h-6 w-6 text-chart-3" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Inteligência de Patentes</h2>
            <p className="text-sm text-muted-foreground">Análise completa do portfólio monitorado</p>
          </div>
        </div>
        <Link to="/patents">
          <Button variant="outline" className="gap-2">
            Ver todas as patentes
            <TrendingUp className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Quick Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link to="/patents" className="block">
          <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Total de Patentes</p>
                <h3 className="text-3xl font-bold text-foreground">{stats.total}</h3>
                <p className="text-xs text-success mt-2">Portfólio completo</p>
              </div>
              <div className="p-3 rounded-lg bg-chart-3/10">
                <Shield className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </Card>
        </Link>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Patentes Concedidas</p>
              <h3 className="text-3xl font-bold text-foreground">{stats.granted}</h3>
              <p className="text-xs text-success mt-2">
                {stats.total > 0 ? Math.round(stats.granted / stats.total * 100) : 0}% do total
              </p>
            </div>
            <div className="p-3 rounded-lg bg-success/10">
              <FileCheck className="h-6 w-6 text-success" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Empresas Titulares</p>
              <h3 className="text-3xl font-bold text-foreground">{stats.uniqueCompanies}</h3>
              <p className="text-xs text-muted-foreground mt-2">Organizações únicas</p>
            </div>
            <div className="p-3 rounded-lg bg-chart-1/10">
              <Building2 className="h-6 w-6 text-chart-1" />
            </div>
          </div>
        </Card>

        
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <PatentYearChart data={stats.byYear} />
        <TopCompaniesCard companies={stats.topCompanies} />
      </div>

      {/* Insights Cards */}
      

      {/* Categories Distribution */}
      
    </div>;
};