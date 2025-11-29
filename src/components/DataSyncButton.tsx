import { useState } from "react";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const DataSyncButton = () => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    const startTime = Date.now();
    toast.info("🔄 Buscando patentes brasileiras via BigQuery...", { duration: 3000 });

    try {
      // Call the BigQuery search function
      const { data, error } = await supabase.functions.invoke('search-patents-bigquery', {
        body: {
          query: 'agricultura sustentável',
          limit: 100,
        },
      });

      if (error) throw error;

      const results = data?.results || [];
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (results.length > 0) {
        // Save patents to database with date validation
        const { error: upsertError } = await supabase.from('patents').upsert(
          results.map((patent: any) => ({
            patent_number: patent.patent_number,
            publication_number: patent.publication_number,
            title: patent.title,
            abstract: patent.abstract,
            company: patent.company || 'Não informado',
            inventors: patent.inventors || [],
            filing_date: patent.filing_date || '1900-01-01', // Fallback obrigatório
            priority_date: patent.priority_date || null,
            publication_date: patent.publication_date || null,
            grant_date: patent.grant_date || null,
            status: patent.status,
            category: patent.category || 'biostimulants',
            google_patents_link: patent.google_patents_link,
            language: 'pt',
          })),
          { onConflict: 'patent_number' }
        );

        if (upsertError) {
          throw upsertError;
        }

        toast.success(
          `✅ ${results.length} patentes brasileiras sincronizadas do BigQuery em ${duration}s!`,
          { duration: 5000 }
        );
        
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.info(`ℹ️ Nenhuma patente encontrada no BigQuery (${duration}s)`, { duration: 4000 });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error("❌ Erro ao sincronizar dados. Verifique os logs.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={syncing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
      {syncing ? 'Sincronizando...' : 'Atualizar Dados'}
    </Button>
  );
};
