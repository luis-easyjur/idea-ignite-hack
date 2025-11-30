import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FilterBar, FilterState } from "@/components/FilterBar";
import { ExportButton } from "@/components/ExportButton";
import { DataSyncButton } from "@/components/DataSyncButton";
import { QuickStatsGrid } from "@/components/QuickStatsGrid";
import { ExternalApisStatsGrid } from "@/components/ExternalApisStatsGrid";
import { ProductsIntelligenceSection } from "@/components/ProductsIntelligenceSection";
import { PatentsDashboardSection } from "@/components/PatentsDashboardSection";
import { AlertItem } from "@/components/AlertItem";
import { CorrelationTimeline } from "@/components/CorrelationTimeline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
const Index = () => {
  const [filters, setFilters] = useState<FilterState>({});
  
  return <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-6 animate-in flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Inteligência Competitiva MVP
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <DataSyncButton />
            <ExportButton filename="dashboard" />
          </div>
        </div>

        <FilterBar onFilterChange={setFilters} />

        {/* Quick Stats Grid */}
        <QuickStatsGrid />

        {/* External APIs Stats Grid */}
        <div className="mb-6">
          <ExternalApisStatsGrid />
        </div>

        {/* Products Intelligence Section - MOVED UP */}
        <div className="mb-6">
          <ProductsIntelligenceSection />
        </div>

        {/* Patents Intelligence Section */}
        <div className="mb-6">
          <PatentsDashboardSection />
        </div>

        {/* Alerts and Correlation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Recent Alerts (Limited to 3) */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">Alertas Recentes</h3>
                <Button variant="ghost" size="sm" className="text-xs">
                  Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <AlertItem 
                  title="Novo registro MAPA - Biodefensivo" 
                  description="Competidor Y registrou novo produto para controle biológico em soja" 
                  time="2h atrás" 
                  type="general" 
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
              </div>
            </Card>
          </div>

          {/* Right Column - Correlation (Collapsible) */}
          <div>
            <CorrelationTimeline />
          </div>
        </div>
      </main>
    </div>
  </ProtectedRoute>;
};

export default Index;