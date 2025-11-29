import { useEffect, useState } from "react";
import { FileText, Calendar, TrendingDown, Building2 } from "lucide-react";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { FilterBar, FilterState } from "@/components/FilterBar";
import { ExportButton } from "@/components/ExportButton";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Patents = () => {
  const [patents, setPatents] = useState<any[]>([]);
  const [filteredPatents, setFilteredPatents] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, patents]);

  const fetchPatents = async () => {
    try {
      const { data, error } = await supabase
        .from("patents")
        .select("*")
        .order("filing_date", { ascending: false });

      if (error) throw error;
      setPatents(data || []);
      setFilteredPatents(data || []);
    } catch (error) {
      console.error("Error fetching patents:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...patents];

    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    setFilteredPatents(filtered);
  };

  const categoryLabels: Record<string, string> = {
    foliar_nutrition: "Nutrição Foliar",
    biostimulants: "Bioestimulantes",
    biodefensives: "Biodefensivos",
    adjuvants: "Adjuvantes",
    biofertilizers: "Biofertilizantes",
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) return { status: "Expirada", color: "text-red-500" };
    if (daysUntilExpiry < 365)
      return { status: `Expira em ${daysUntilExpiry} dias`, color: "text-orange-500" };
    return {
      status: `Expira em ${Math.floor(daysUntilExpiry / 365)} anos`,
      color: "text-green-500",
    };
  };

  const stats = {
    total: patents.length,
    granted: patents.filter((p) => p.status === "Granted").length,
    pending: patents.filter((p) => p.status === "Pending").length,
    expiringSoon: patents.filter((p) => {
      if (!p.expiry_date) return false;
      const expiry = new Date(p.expiry_date);
      const today = new Date();
      const daysUntilExpiry = Math.floor(
        (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry < 365 && daysUntilExpiry > 0;
    }).length,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Análise de Patentes
              </h2>
              <p className="text-muted-foreground">
                Monitoramento de propriedade intelectual no setor
              </p>
            </div>
            <ExportButton data={filteredPatents} filename="patentes" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total de Patentes"
              value={stats.total.toString()}
              change="Monitoradas"
              changeType="neutral"
              icon={FileText}
              iconColor="bg-primary/10 text-primary"
              source="INPI"
            />
            <StatCard
              title="Concedidas"
              value={stats.granted.toString()}
              change={`${((stats.granted / stats.total) * 100).toFixed(0)}% do total`}
              changeType="positive"
              icon={Building2}
              iconColor="bg-green-500/10 text-green-500"
              source="INPI"
            />
            <StatCard
              title="Pendentes"
              value={stats.pending.toString()}
              change="Aguardando análise"
              changeType="neutral"
              icon={Calendar}
              iconColor="bg-yellow-500/10 text-yellow-500"
              source="INPI"
            />
            <StatCard
              title="Expirando em breve"
              value={stats.expiringSoon.toString()}
              change="Próximos 12 meses"
              changeType="negative"
              icon={TrendingDown}
              iconColor="bg-orange-500/10 text-orange-500"
              source="INPI"
            />
          </div>

          <FilterBar onFilterChange={setFilters} />

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="expiring">Expirando</TabsTrigger>
              <TabsTrigger value="by-category">Por Categoria</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground text-center py-8">
                  Carregando dados...
                </p>
              ) : (
                <div className="grid gap-4">
                  {filteredPatents.map((patent) => {
                    const expiryStatus = getExpiryStatus(patent.expiry_date);
                    return (
                      <Card key={patent.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                              {patent.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {patent.company}
                            </p>
                          </div>
                          <Badge
                            variant={patent.status === "Granted" ? "default" : "secondary"}
                          >
                            {patent.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline">
                            {categoryLabels[patent.category] || patent.category}
                          </Badge>
                          <Badge variant="outline">{patent.patent_number}</Badge>
                          {expiryStatus && (
                            <Badge variant="outline" className={expiryStatus.color}>
                              {expiryStatus.status}
                            </Badge>
                          )}
                        </div>

                        {patent.abstract && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {patent.abstract}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>
                            Depositada: {new Date(patent.filing_date).toLocaleDateString("pt-BR")}
                          </span>
                          {patent.grant_date && (
                            <span>
                              Concedida: {new Date(patent.grant_date).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                          {patent.expiry_date && (
                            <span>
                              Expira: {new Date(patent.expiry_date).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>

                        {patent.inventors && patent.inventors.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Inventores:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {patent.inventors.map((inventor: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {inventor}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="expiring" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Patentes Expirando nos Próximos 12 Meses
                </h3>
                <div className="space-y-4">
                  {filteredPatents
                    .filter((p) => {
                      const expiryStatus = getExpiryStatus(p.expiry_date);
                      return expiryStatus && expiryStatus.color !== "text-green-500";
                    })
                    .map((patent) => {
                      const expiryStatus = getExpiryStatus(patent.expiry_date);
                      return (
                        <div
                          key={patent.id}
                          className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {patent.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {patent.company}
                              </p>
                            </div>
                            {expiryStatus && (
                              <Badge variant="outline" className={expiryStatus.color}>
                                {expiryStatus.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="by-category" className="space-y-4">
              {Object.entries(categoryLabels).map(([key, label]) => {
                const categoryPatents = filteredPatents.filter(
                  (p) => p.category === key
                );
                return categoryPatents.length > 0 ? (
                  <Card key={key} className="p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">
                      {label} ({categoryPatents.length})
                    </h3>
                    <div className="space-y-3">
                      {categoryPatents.map((patent) => (
                        <div
                          key={patent.id}
                          className="p-3 border rounded hover:bg-accent/50 transition-colors"
                        >
                          <h4 className="font-medium text-foreground">{patent.title}</h4>
                          <p className="text-sm text-muted-foreground">{patent.company}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : null;
              })}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Patents;