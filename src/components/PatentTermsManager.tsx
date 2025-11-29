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
}

const categories = [
  { value: "foliar_nutrition", label: "Nutrição Foliar" },
  { value: "biostimulants", label: "Bioestimulantes" },
  { value: "biodefensives", label: "Biodefensivos" },
  { value: "adjuvants", label: "Adjuvantes" },
  { value: "biofertilizers", label: "Biofertilizantes" },
  { value: "custom", label: "Personalizado" },
];

export function PatentTermsManager() {
  const [terms, setTerms] = useState<SearchTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [newTerm, setNewTerm] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");

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
      const { data, error } = await supabase.functions.invoke("search-patents-bigquery", {
        body: { query: searchTerm },
      });

      if (error) throw error;

      const patents = data?.results || [];
      
      // Update patents in database
      for (const patent of patents) {
        await supabase.from("patents").upsert({
          patent_number: patent.patent_number,
          title: patent.title,
          company: patent.company,
          filing_date: patent.filing_date,
          status: patent.status,
          category: patent.category || "biostimulants",
        });
      }

      // Update search term stats
      await supabase
        .from("patent_search_terms")
        .update({
          last_searched_at: new Date().toISOString(),
          results_count: patents.length,
        })
        .eq("id", termId);

      toast.success(`Busca concluída! ${patents.length} patentes encontradas`);
      fetchTerms();
    } catch (error) {
      console.error("Error searching patents:", error);
      toast.error("Erro ao buscar patentes");
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
    <div className="space-y-6">
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
    </div>
  );
}