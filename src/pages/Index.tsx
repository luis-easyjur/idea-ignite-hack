import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FilterBar, FilterState } from "@/components/FilterBar";
import { ExportButton } from "@/components/ExportButton";
import { DataSyncButton } from "@/components/DataSyncButton";
import { QuickStatsGrid } from "@/components/QuickStatsGrid";
import { RegionalClimateIntelligence } from "@/components/RegionalClimateIntelligence";
import { ProductsIntelligenceSection } from "@/components/ProductsIntelligenceSection";
import { PatentsDashboardSection } from "@/components/PatentsDashboardSection";
import { CorrelationTimeline } from "@/components/CorrelationTimeline";
import { AIInsightsCard } from "@/components/AIInsightsCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Sparkles } from "lucide-react";
import { useSmartAlerts } from "@/hooks/useSmartAlerts";
const Index = () => {
  const [filters, setFilters] = useState<FilterState>({});
  const { data: alertsData, isLoading: alertsLoading } = useSmartAlerts();
  
  const alertTypeLabels: Record<string, string> = {
    regulatory_approval: "Regulatório",
    patent_expiry: "Patente",
    competitor_launch: "Lançamento",
    new_publication: "Publicação",
    market_change: "Mercado"
  };

  const priorityColors: Record<string, string> = {
    critical: "destructive",
    high: "destructive",
    medium: "default",
    low: "secondary"
  };
  
  return <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Hero Section */}
        <div className="mb-4 sm:mb-6 animate-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Inteligência Competitiva MVP
            </h2>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DataSyncButton />
            <ExportButton filename="dashboard" />
          </div>
        </div>

        <FilterBar onFilterChange={setFilters} />

        {/* Quick Stats Grid */}
        <QuickStatsGrid />

        {/* AI Insights Section */}
        <div className="mb-4 sm:mb-6">
          <AIInsightsCard />
        </div>

        {/* Alerts and Correlation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Left Column - Smart Alerts */}
          <div className="lg:col-span-2">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">Alertas Inteligentes</h3>
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    IA
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-xs hidden sm:flex">
                  Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              
              {alertsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  {alertsData?.alerts.slice(0, 5).map((alert, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={priorityColors[alert.priority] as any} className="text-xs">
                              {alertTypeLabels[alert.alert_type]}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {alert.priority}
                            </Badge>
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            {alert.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {alert.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              Fonte: {alert.source}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {alertsData?.metadata && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Baseado em {alertsData.metadata.data_sources.recent_patents} patentes recentes, {alertsData.metadata.data_sources.recent_regulatory} registros regulatórios e {alertsData.metadata.data_sources.expiring_patents} patentes expirando
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Correlation Timeline */}
          <div>
            <CorrelationTimeline />
          </div>
        </div>

        {/* Products Intelligence Section */}
        <div className="mb-4 sm:mb-6">
          <ProductsIntelligenceSection />
        </div>

        {/* Patents Intelligence Section */}
        <div className="mb-4 sm:mb-6">
          <PatentsDashboardSection />
        </div>

        {/* Regional Climate Intelligence */}
        <div className="mb-4 sm:mb-6">
          <RegionalClimateIntelligence />
        </div>
      </main>
    </div>
  </ProtectedRoute>;
};

export default Index;