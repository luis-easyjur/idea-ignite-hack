import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { AlertItem } from "@/components/AlertItem";
import { DataPillarCard } from "@/components/DataPillarCard";
import { CorrelationTimeline } from "@/components/CorrelationTimeline";
import { CompetitorMonitor } from "@/components/CompetitorMonitor";
import { TrendForecast } from "@/components/TrendForecast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  TrendingUp, 
  FileText, 
  Shield, 
  FlaskConical,
  BarChart3,
  Leaf,
  Sprout,
  Bug,
  Droplets,
  Wheat
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketEvolutionChart } from "@/components/MarketEvolutionChart";
import { RegionalGrowthChart } from "@/components/RegionalGrowthChart";

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8 animate-in">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Inteligência Competitiva
          </h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real do mercado de Especialidades Agrícolas
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Novos Registros (30d)"
            value="24"
            change="+12% vs mês anterior"
            changeType="positive"
            icon={FileText}
            iconColor="bg-chart-2/10"
            source="MAPA"
          />
          <StatCard
            title="Patentes Monitoradas"
            value="156"
            change="+8 novas patentes"
            changeType="positive"
            icon={Shield}
            iconColor="bg-chart-3/10"
            source="INPI"
          />
          <StatCard
            title="Artigos Científicos"
            value="89"
            change="+5% este trimestre"
            changeType="positive"
            icon={FlaskConical}
            iconColor="bg-chart-4/10"
            source="Embrapa"
          />
          <StatCard
            title="Crescimento Mercado"
            value="18.2%"
            change="Bioestimulantes 2024"
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-chart-1/10"
            source="IBGE"
          />
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
                <AlertItem
                  title="Novo registro MAPA - Biodefensivo"
                  description="Competidor Y registrou novo produto para controle biológico em soja"
                  time="2h atrás"
                  type="regulatory"
                  priority="high"
                  source="MAPA"
                />
                <AlertItem
                  title="Patente aprovada - Adjuvante inovador"
                  description="INPI aprovou patente de formulação com nanotecnologia"
                  time="5h atrás"
                  type="patent"
                  priority="high"
                  source="INPI"
                />
                <AlertItem
                  title="Publicação científica relevante"
                  description="Estudo sobre eficiência de bioestimulantes em condições de estresse"
                  time="1d atrás"
                  type="science"
                  priority="medium"
                  source="Embrapa"
                />
                <AlertItem
                  title="Crescimento de mercado - Nordeste"
                  description="Região apresenta 23% de crescimento em biofertilizantes"
                  time="2d atrás"
                  type="market"
                  priority="medium"
                  source="IBGE"
                />
              </div>
            </Card>
          </div>

          {/* Right Column - Correlation */}
          <div>
            <CorrelationTimeline />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <MarketEvolutionChart />
          <RegionalGrowthChart />
        </div>

        {/* Competitor Monitor Section */}
        <div className="mb-8">
          <CompetitorMonitor />
        </div>

        {/* AI Trend Forecast Section */}
        <div className="mb-8">
          <TrendForecast />
        </div>

        {/* Data Pillars Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">Pilares de Inteligência</h3>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="specialties">Especialidades</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataPillarCard
                  title="Inteligência de Mercado"
                  description="Análise de tamanho de mercado e crescimento regional"
                  icon={BarChart3}
                  color="--chart-1"
                  stats={[
                    { label: "Mercado Total", value: "R$ 2.8B" },
                    { label: "Crescimento", value: "+15.3%" }
                  ]}
                  sources={["IBGE", "Abisolo"]}
                />
                
                <DataPillarCard
                  title="Dados Regulatórios"
                  description="Monitoramento de registros e normas MAPA/ANVISA/IBAMA"
                  icon={FileText}
                  color="--chart-2"
                  stats={[
                    { label: "Registros 2024", value: "142" },
                    { label: "Pendentes", value: "38" }
                  ]}
                  sources={["MAPA", "ANVISA", "IBAMA"]}
                />
                
                <DataPillarCard
                  title="Propriedade Intelectual"
                  description="Rastreamento de patentes e liberdade de operação"
                  icon={Shield}
                  color="--chart-3"
                  stats={[
                    { label: "Patentes Ativas", value: "234" },
                    { label: "Vencendo 2025", value: "12" }
                  ]}
                  sources={["INPI"]}
                />
                
                <DataPillarCard
                  title="Ciência & Tecnologia"
                  description="Tendências em publicações científicas e P&D"
                  icon={FlaskConical}
                  color="--chart-4"
                  stats={[
                    { label: "Papers 2024", value: "89" },
                    { label: "Alto Impacto", value: "23" }
                  ]}
                  sources={["Embrapa"]}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="specialties" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6 hover:shadow-lg transition-shadow animate-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Leaf className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-bold text-foreground">Nutrição Foliar</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produtos ativos</span>
                      <span className="font-semibold">87</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Crescimento</span>
                      <span className="font-semibold text-success">+12%</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow animate-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Sprout className="h-5 w-5 text-secondary" />
                    </div>
                    <h4 className="font-bold text-foreground">Bioestimulantes</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produtos ativos</span>
                      <span className="font-semibold">64</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Crescimento</span>
                      <span className="font-semibold text-success">+18%</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow animate-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Bug className="h-5 w-5 text-warning" />
                    </div>
                    <h4 className="font-bold text-foreground">Biodefensivos</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produtos ativos</span>
                      <span className="font-semibold">52</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Crescimento</span>
                      <span className="font-semibold text-success">+25%</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow animate-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Droplets className="h-5 w-5 text-accent" />
                    </div>
                    <h4 className="font-bold text-foreground">Adjuvantes</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produtos ativos</span>
                      <span className="font-semibold">43</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Crescimento</span>
                      <span className="font-semibold text-success">+9%</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow animate-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-chart-5/10 rounded-lg">
                      <Wheat className="h-5 w-5" style={{ color: 'hsl(var(--chart-5))' }} />
                    </div>
                    <h4 className="font-bold text-foreground">Biofertilizantes</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produtos ativos</span>
                      <span className="font-semibold">38</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Crescimento</span>
                      <span className="font-semibold text-success">+21%</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
};

export default Index;
