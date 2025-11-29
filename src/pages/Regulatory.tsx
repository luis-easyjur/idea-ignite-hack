import { useEffect, useState } from "react";
import { FileText, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { RegulatoryTimeline } from "@/components/RegulatoryTimeline";
import { FilterBar, FilterState } from "@/components/FilterBar";
import { ExportButton } from "@/components/ExportButton";
import { DataSyncButton } from "@/components/DataSyncButton";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Regulatory = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegulatoryRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, records]);

  const fetchRegulatoryRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("regulatory_records")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
      setFilteredRecords(data || []);
    } catch (error) {
      console.error("Error fetching regulatory records:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    if (filters.category) {
      filtered = filtered.filter((r) => r.category === filters.category);
    }

    setFilteredRecords(filtered);
  };

  const stats = {
    total: records.length,
    approved: records.filter((r) => r.status === "approved").length,
    underAnalysis: records.filter((r) => r.status === "under_analysis").length,
    preRegistered: records.filter((r) => r.status === "pre_registered").length,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Inteligência Regulatória
              </h2>
              <p className="text-muted-foreground">
                Acompanhamento completo de registros no MAPA
              </p>
            </div>
            <div className="flex gap-2">
              <DataSyncButton />
              <ExportButton data={filteredRecords} filename="registros-regulatorios" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total de Registros"
              value={stats.total.toString()}
              change="Monitorados"
              changeType="neutral"
              icon={FileText}
              iconColor="bg-primary/10 text-primary"
              source="MAPA"
            />
            <StatCard
              title="Aprovados"
              value={stats.approved.toString()}
              change={`${((stats.approved / stats.total) * 100).toFixed(0)}% do total`}
              changeType="positive"
              icon={CheckCircle2}
              iconColor="bg-green-500/10 text-green-500"
              source="MAPA"
            />
            <StatCard
              title="Em Análise"
              value={stats.underAnalysis.toString()}
              change="Aguardando aprovação"
              changeType="neutral"
              icon={Clock}
              iconColor="bg-yellow-500/10 text-yellow-500"
              source="MAPA"
            />
            <StatCard
              title="Pré-Registrados"
              value={stats.preRegistered.toString()}
              change="Aguardando submissão"
              changeType="neutral"
              icon={TrendingUp}
              iconColor="bg-blue-500/10 text-blue-500"
              source="MAPA"
            />
          </div>

          <FilterBar onFilterChange={setFilters} />

          <Tabs defaultValue="timeline" className="space-y-6">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="by-status">Por Status</TabsTrigger>
              <TabsTrigger value="by-company">Por Empresa</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Timeline de Registros
                </h3>
                {loading ? (
                  <p className="text-muted-foreground text-center py-8">
                    Carregando dados...
                  </p>
                ) : (
                  <RegulatoryTimeline records={filteredRecords} />
                )}
              </Card>
            </TabsContent>

            <TabsContent value="by-status" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Registros por Status
                </h3>
                <div className="space-y-6">
                  {["approved", "under_analysis", "pre_registered"].map((status) => {
                    const statusRecords = filteredRecords.filter(
                      (r) => r.status === status
                    );
                    return statusRecords.length > 0 ? (
                      <div key={status}>
                        <h4 className="font-medium mb-3 text-muted-foreground">
                          {status === "approved"
                            ? "Aprovados"
                            : status === "under_analysis"
                            ? "Em Análise"
                            : "Pré-Registrados"}
                        </h4>
                        <RegulatoryTimeline records={statusRecords} />
                      </div>
                    ) : null;
                  })}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="by-company" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Registros por Empresa
                </h3>
                <div className="space-y-6">
                  {[...new Set(filteredRecords.map((r) => r.company))].map(
                    (company) => {
                      const companyRecords = filteredRecords.filter(
                        (r) => r.company === company
                      );
                      return (
                        <div key={company}>
                          <h4 className="font-medium mb-3 text-muted-foreground">
                            {company}
                          </h4>
                          <RegulatoryTimeline records={companyRecords} />
                        </div>
                      );
                    }
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Regulatory;