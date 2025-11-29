import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/ProductCard";
import { CompetitorProduct } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Plus } from "lucide-react";
// import { supabase } from "@/integrations/supabase/client";

export const ProductsPanel = () => {
  const [products, setProducts] = useState<CompetitorProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const fetchProducts = async () => {
    setLoading(true);
    
    // TODO: Descomentar quando a tabela competitor_products estiver criada
    // try {
    //   let query = supabase
    //     .from("competitor_products")
    //     .select("*, competitors(name)")
    //     .order("name");
    //
    //   if (selectedCompetitor !== "all") {
    //     query = query.eq("competitor_id", selectedCompetitor);
    //   }
    //
    //   if (selectedCategory !== "all") {
    //     query = query.eq("category", selectedCategory);
    //   }
    //
    //   if (selectedStatus !== "all") {
    //     query = query.eq("status", selectedStatus);
    //   }
    //
    //   const { data, error } = await query;
    //
    //   if (error) throw error;
    //
    //   const formattedProducts = data?.map((p: any) => ({
    //     ...p,
    //     competitor_name: p.competitors?.name,
    //   })) || [];
    //
    //   setProducts(formattedProducts);
    // } catch (error) {
    //   console.error("Erro ao buscar produtos:", error);
    // } finally {
    //   setLoading(false);
    // }

    // Placeholder: Remover após conectar ao backend
    setTimeout(() => {
      setProducts([]);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCompetitor, selectedCategory, selectedStatus]);

  const categories = ["Bioestimulante", "Fertilizante", "Defensivo", "Adjuvante"];
  const statuses = ["Ativo", "Em registro", "Descontinuado"];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos dos Concorrentes</CardTitle>
          <CardDescription>Carregando produtos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produtos dos Concorrentes</CardTitle>
              <CardDescription>
                Catálogo de produtos monitorados da concorrência
              </CardDescription>
            </div>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os concorrentes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os concorrentes</SelectItem>
                  {/* TODO: Popular com lista real de concorrentes do banco */}
                  <SelectItem value="stoller">Stoller</SelectItem>
                  <SelectItem value="icl">ICL</SelectItem>
                  <SelectItem value="koppert">Koppert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
              <p className="text-muted-foreground max-w-md">
                Os produtos dos concorrentes aparecerão aqui após a conexão com o backend.
                Configure a tabela competitor_products no banco de dados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
