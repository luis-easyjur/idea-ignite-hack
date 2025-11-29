import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SearchFormData {
  query: string;
  country: string;
  after_date: string;
  before_date: string;
  assignee: string;
  inventor: string;
  status: string;
}

interface PatentSearchFormProps {
  onSearchComplete: () => void;
}

export const PatentSearchForm = ({ onSearchComplete }: PatentSearchFormProps) => {
  const [formData, setFormData] = useState<SearchFormData>({
    query: "",
    country: "BR",
    after_date: "",
    before_date: "",
    assignee: "",
    inventor: "",
    status: "all",
  });
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.query && !formData.assignee && !formData.inventor) {
      toast.error("Informe pelo menos um critério de busca");
      return;
    }

    setIsSearching(true);

    try {
      const { data, error } = await supabase.functions.invoke('search-google-patents', {
        body: {
          query: formData.query || undefined,
          country: formData.country || undefined,
          after_date: formData.after_date || undefined,
          before_date: formData.before_date || undefined,
          assignee: formData.assignee || undefined,
          inventor: formData.inventor || undefined,
          status: formData.status !== 'all' ? formData.status : undefined,
          page: 1,
          limit: 50,
        },
      });

      if (error) throw error;

      if (data?.success && data?.results) {
        // Insert results into database
        const recordsToInsert = data.results.map((patent: any) => ({
          patent_number: patent.patent_number,
          publication_number: patent.publication_number,
          title: patent.title,
          abstract: patent.abstract,
          company: patent.company || 'Não informado',
          inventors: patent.inventors,
          filing_date: patent.filing_date,
          priority_date: patent.priority_date,
          publication_date: patent.publication_date,
          grant_date: patent.grant_date,
          status: patent.status,
          google_patents_link: patent.google_patents_link,
          pdf_url: patent.pdf_url,
          thumbnail_url: patent.thumbnail_url,
          category: 'foliar_nutrition' as const, // Default category
        }));

        // Use upsert to avoid duplicates
        const { error: insertError } = await supabase
          .from('patents')
          .upsert(recordsToInsert, { onConflict: 'patent_number', ignoreDuplicates: true });

        if (insertError) throw insertError;

        toast.success(`${data.results.length} patentes encontradas e salvas!`);
        onSearchComplete();
        
        // Reset form
        setFormData({
          query: "",
          country: "BR",
          after_date: "",
          before_date: "",
          assignee: "",
          inventor: "",
          status: "all",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Erro ao buscar patentes');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="query">Busca Geral</Label>
            <Input
              id="query"
              placeholder="Ex: bioestimulante, defensivo biológico..."
              value={formData.query}
              onChange={(e) => setFormData({ ...formData, query: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
              <SelectTrigger id="country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BR">Brasil (BR)</SelectItem>
                <SelectItem value="US">Estados Unidos (US)</SelectItem>
                <SelectItem value="EP">Europa (EP)</SelectItem>
                <SelectItem value="WO">Internacional (WO)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Titular</Label>
            <Input
              id="assignee"
              placeholder="Nome da empresa ou instituição"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inventor">Inventor</Label>
            <Input
              id="inventor"
              placeholder="Nome do inventor"
              value={formData.inventor}
              onChange={(e) => setFormData({ ...formData, inventor: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="after_date">Data Inicial</Label>
            <Input
              id="after_date"
              type="date"
              value={formData.after_date}
              onChange={(e) => setFormData({ ...formData, after_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="before_date">Data Final</Label>
            <Input
              id="before_date"
              type="date"
              value={formData.before_date}
              onChange={(e) => setFormData({ ...formData, before_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="granted">Concedidas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSearching}>
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Buscar Patentes
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};
