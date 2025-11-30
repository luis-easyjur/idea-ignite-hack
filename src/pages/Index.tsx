import { useState } from "react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/StatCard";
import { usePatentStats } from "@/hooks/usePatentStats";
import { AlertItem } from "@/components/AlertItem";
import { DataPillarCard } from "@/components/DataPillarCard";
import { CorrelationTimeline } from "@/components/CorrelationTimeline";
import { CompetitorMonitor } from "@/components/CompetitorMonitor";
import { TrendForecast } from "@/components/TrendForecast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FilterBar, FilterState } from "@/components/FilterBar";
import { ExportButton } from "@/components/ExportButton";
import { DataSyncButton } from "@/components/DataSyncButton";
import { Button } from "@/components/ui/button";
import { TrendingUp, FileText, Shield, FlaskConical, BarChart3, Leaf, Sprout, Bug, Droplets, Wheat, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketEvolutionChart } from "@/components/MarketEvolutionChart";
import { RegionalGrowthChart } from "@/components/RegionalGrowthChart";
import { PatentsDashboardSection } from "@/components/PatentsDashboardSection";
import { ProductsIntelligenceSection } from "@/components/ProductsIntelligenceSection";
import { ProductLaunchChart } from "@/components/ProductLaunchChart";
const Index = () => {
  const [filters, setFilters] = useState<FilterState>({});
  const {
    data: patentStats
  } = usePatentStats();
  return <ProtectedRoute>
      <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8 animate-in flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Inteligência Competitiva MVP
            </h2>
            
          </div>
          <div className="flex items-center gap-2">
            <DataSyncButton />
            <ExportButton filename="dashboard" />
          </div>
        </div>

        <FilterBar onFilterChange={setFilters} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Novos Registros (30d)" value="24" change="+12% vs mês anterior" changeType="positive" icon={FileText} iconColor="bg-chart-2/10" source="MAPA" />
          <Link to="/patents" className="block transition-transform hover:scale-[1.02]">
            <StatCard title="Patentes Monitoradas" value={patentStats?.total?.toString() || "0"} change={patentStats?.newLast7Days ? `+${patentStats.newLast7Days} novas esta semana` : "Dados atualizados"} changeType="positive" icon={Shield} iconColor="bg-chart-3/10" source="INPI" />
          </Link>
          <StatCard title="Artigos Científicos" value="89" change="+5% este trimestre" changeType="positive" icon={FlaskConical} iconColor="bg-chart-4/10" source="Embrapa" />
          <StatCard title="Crescimento Mercado" value="18.2%" change="Bioestimulantes 2024" changeType="positive" icon={TrendingUp} iconColor="bg-chart-1/10" source="IBGE" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Alerts */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Alertas Recentes</h3>
                <span className="text-sm text-muted-foreground">Últimas 24h</span>
              </div>
              
              <div className="space-y-4">
                <AlertItem title="Novo registro MAPA - Biodefensivo" description="Competidor Y registrou novo produto para controle biológico em soja" time="2h atrás" type="regulatory" priority="high" source="MAPA" />
                <AlertItem title="Patente aprovada - Adjuvante inovador" description="INPI aprovou patente de formulação com nanotecnologia" time="5h atrás" type="patent" priority="high" source="INPI" />
                <AlertItem title="Publicação científica relevante" description="Estudo sobre eficiência de bioestimulantes em condições de estresse" time="1d atrás" type="science" priority="medium" source="Embrapa" />
                <AlertItem title="Crescimento de mercado - Nordeste" description="Região apresenta 23% de crescimento em biofertilizantes" time="2d atrás" type="market" priority="medium" source="IBGE" />
              </div>
            </Card>
          </div>

          {/* Right Column - Correlation */}
          <div>
            <CorrelationTimeline />
          </div>
        </div>

        {/* Patents Intelligence Section */}
        <div className="mb-8">
          <PatentsDashboardSection />
        </div>

        {/* Products Intelligence Section - Elasticsearch */}
        <div className="mb-8">
          <ProductsIntelligenceSection />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <MarketEvolutionChart />
          <RegionalGrowthChart />
        </div>

        {/* Product Launch Chart */}
        <div className="mb-8">
          <ProductLaunchChart />
        </div>

        {/* Competitor Monitor Section */}
        <div className="mb-8">
          <CompetitorMonitor />
        </div>
      </main>
    </div>
    </ProtectedRoute>;
};
export default Index;