import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Search, Trash2, Edit2, Loader2, Plus, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SearchTerm {
  id: string;
  term: string;
  category: string;
  description: string | null;
  is_active: boolean;
  last_searched_at: string | null;
  results_count: number;
  created_at: string;
  start_date?: string;
  end_date?: string;
}

const categories = [
  { value: "foliar_nutrition", label: "Nutrição Foliar" },
  { value: "biostimulants", label: "Bioestimulantes" },
  { value: "biodefensives", label: "Biodefensivos" },
  { value: "adjuvants", label: "Adjuvantes" },
  { value: "biofertilizers", label: "Biofertilizantes" },
  { value: "custom", label: "Personalizado" },
];

// Default to last 5 years for BigQuery optimization
const defaultStartDate = new Date(new Date().setFullYear(new Date().getFullYear() - 5))
  .toISOString()
  .split('T')[0];
const defaultEndDate = new Date().toISOString().split('T')[0];

export function PatentTermsManager() {
  const [terms, setTerms] = useState<SearchTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [newTerm, setNewTerm] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStartDate, setNewStartDate] = useState(defaultStartDate);
  const [newEndDate, setNewEndDate] = useState(defaultEndDate);

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("patent_search_terms")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTerms(data || []);
    } catch (error) {
      console.error("Error fetching terms:", error);
      toast.error("Erro ao carregar termos de busca");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTerm = async () => {
    if (!newTerm || !newCategory) {
      toast.error("Preencha o termo e a categoria");
      return;
    }

    if (!newStartDate || !newEndDate) {
      toast.error("Selecione o período de busca");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("patent_search_terms")
        .insert({
          user_id: user.id,
          term: newTerm,
          category: newCategory,
          description: newDescription || null,
        });

      if (error) throw error;

      toast.success("Termo adicionado com sucesso!");
      setNewTerm("");
      setNewCategory("");
      setNewDescription("");
      setNewStartDate(defaultStartDate);
      setNewEndDate(defaultEndDate);
      setShowAddForm(false);
      fetchTerms();
    } catch (error) {
      console.error("Error adding term:", error);
      toast.error("Erro ao adicionar termo");
    }
  };

  const handleSearch = async (termId: string, searchTerm: string) => {
    setSearching(termId);
    try {
      let patents: any[] = [];
      let source = "";
      let searchSuccess = false;

      // First, check local database cache
      const { data: cachedPatents, error: cacheError } = await supabase
        .from("patents")
        .select("*")
        .or(`title.ilike.%${searchTerm}%,abstract.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,patent_number.ilike.%${searchTerm}%`)
        .limit(50);

      if (!cacheError && cachedPatents && cachedPatents.length > 0) {
        patents = cachedPatents;
        source = "Cache local";
        searchSuccess = true;
        console.log(`Found ${patents.length} patents in local cache`);
      } else {
        // If not in cache, query BigQuery with optimized parameters
        const term = terms.find(t => t.id === termId);
        const startDate = term?.start_date || defaultStartDate;
        const endDate = term?.end_date || defaultEndDate;
        
        // Convert YYYY-MM-DD to YYYYMMDD
        const formattedStartDate = startDate.replace(/-/g, '');
        const formattedEndDate = endDate.replace(/-/g, '');
        
        console.log(`Querying BigQuery with date range: ${formattedStartDate} - ${formattedEndDate}`);
        
        const bigQueryResult = await supabase.functions.invoke("search-patents-bigquery", {
          body: { 
            query: searchTerm,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            limit: 50
          },
        });

        // Check if BigQuery succeeded
        if (!bigQueryResult.error && !bigQueryResult.data?.error) {
          patents = bigQueryResult.data?.results || [];
          source = "BigQuery (otimizado)";
          searchSuccess = true;
        } else {
          console.log("BigQuery failed:", bigQueryResult.error || bigQueryResult.data?.error);
          toast.error("Erro ao buscar no BigQuery. Usando cache local apenas.");
        }
      }

      if (!searchSuccess || patents.length === 0) {
        toast.warning("Nenhuma patente encontrada para este termo.");
        
        // Update search term with zero results
        await supabase
          .from("patent_search_terms")
          .update({
            last_searched_at: new Date().toISOString(),
            results_count: 0,
          })
          .eq("id", termId);
        
        fetchTerms();
        return;
      }
      
      // Update patents in database (only if from external sources, not cache)
      if (source !== "Cache local") {
        console.log(`Updating ${patents.length} patents in local database`);
        for (const patent of patents) {
          await supabase.from("patents").upsert({
            patent_number: patent.patent_number,
            title: patent.title,
            company: patent.company,
            filing_date: patent.filing_date,
            status: patent.status,
            category: patent.category || "biostimulants",
            abstract: patent.abstract,
            inventors: patent.inventors,
            grant_date: patent.grant_date,
            publication_date: patent.publication_date,
            priority_date: patent.priority_date,
            application_number: patent.application_number,
          }, {
            onConflict: "patent_number"
          });
        }
      }

      // Update search term stats
      await supabase
        .from("patent_search_terms")
        .update({
          last_searched_at: new Date().toISOString(),
          results_count: patents.length,
        })
        .eq("id", termId);

      toast.success(`${patents.length} patentes encontradas via ${source}!`);
      fetchTerms();
    } catch (error) {
      console.error("Error searching patents:", error);
      toast.error("Erro ao buscar patentes. Tente novamente mais tarde.");
    } finally {
      setSearching(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("patent_search_terms")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Termo removido");
      fetchTerms();
    } catch (error) {
      console.error("Error deleting term:", error);
      toast.error("Erro ao remover termo");
    }
  };

  const handleSearchAll = async () => {
    const activeTerms = terms.filter(t => t.is_active);
    for (const term of activeTerms) {
      await handleSearch(term.id, term.term);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Termos de Busca de Patentes
              </CardTitle>
              <CardDescription>
                Gerencie seus termos de busca e execute buscas automáticas
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Termo
            </Button>
          </div>
        </CardHeader>

        {showAddForm && (
          <CardContent>
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Termo de Busca</label>
                  <Input
                    placeholder="Ex: bioestimulante à base de algas"
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição (Opcional)</label>
                <Textarea
                  placeholder="Descreva o objetivo desta busca..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Inicial</label>
                  <Input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Final</label>
                  <Input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Período menor = menos dados escaneados no BigQuery
              </p>
              <div className="flex gap-2">
                <Button onClick={handleAddTerm} size="sm">
                  Salvar Termo
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        <CardContent>
          {terms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum termo de busca cadastrado ainda
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Termo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Última Busca</TableHead>
                    <TableHead className="text-right">Resultados</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {terms.map((term) => (
                    <TableRow key={term.id}>
                      <TableCell className="font-medium">
                        <div>
                          {term.term}
                          {term.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {term.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categories.find((c) => c.value === term.category)?.label || term.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {term.last_searched_at
                          ? format(new Date(term.last_searched_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">{term.results_count}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSearch(term.id, term.term)}
                            disabled={searching === term.id}
                          >
                            {searching === term.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(term.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {terms.filter(t => t.is_active).length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button onClick={handleSearchAll} disabled={searching !== null}>
                    {searching ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Executar Busca para Todos os Termos
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
  );
}