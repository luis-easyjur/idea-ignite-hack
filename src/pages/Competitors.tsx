import { useState, useEffect } from "react";
import { Building2, TrendingUp, Package, Users, Plus, RefreshCw, Boxes } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetitorMonitor } from "@/components/CompetitorMonitor";
import { AddCompetitorModal } from "@/components/AddCompetitorModal";
import { MarketResearchPanel } from "@/components/MarketResearchPanel";
import { ProductsPanel } from "@/components/ProductsPanel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Competitors = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    research: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const fetchStats = async () => {
    const { data: competitors } = await supabase
      .from("competitors")
      .select("id", { count: "exact" })
      .eq("is_active", true);

    const { data: research } = await supabase
      .from("competitor_research")
      .select("id", { count: "exact" });

    setStats({
      total: competitors?.length || 0,
      research: research?.length || 0,
    });
  };

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    toast({
      title: "Dados atualizados",
      description: "A lista de concorrentes foi atualizada.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Monitor de Concorrentes</h1>
          <p className="text-muted-foreground">
            Pesquisa inteligente com Gemini + Google Search Grounding
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Concorrente
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concorrentes Ativos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Monitorados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesquisas Realizadas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.research}</div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IA + Google Search</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Dados verificados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fontes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Multi</div>
            <p className="text-xs text-muted-foreground">MAPA, INPI, Web</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="competitors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="competitors">Monitor de Concorrentes</TabsTrigger>
          <TabsTrigger value="research">Deep Research de Mercado</TabsTrigger>
          <TabsTrigger value="products">
            <Boxes className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="competitors">
          <CompetitorMonitor key={refreshKey} />
        </TabsContent>

        <TabsContent value="research">
          <MarketResearchPanel />
        </TabsContent>

        <TabsContent value="products">
          <ProductsPanel />
        </TabsContent>
      </Tabs>

      <AddCompetitorModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={() => {
          handleRefresh();
        }}
      />
    </div>
  );
};

export default Competitors;
