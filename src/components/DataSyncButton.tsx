import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Check if BigQuery quota is exceeded
const checkQuotaStatus = () => {
  const quotaStatus = localStorage.getItem('bigquery_quota_exceeded');
  if (quotaStatus) {
    const { exceeded, month, year } = JSON.parse(quotaStatus);
    const now = new Date();
    // Check if we're in a new month (quota resets on 1st)
    if (now.getMonth() === month && now.getFullYear() === year) {
      return exceeded;
    } else {
      // New month, clear the flag
      localStorage.removeItem('bigquery_quota_exceeded');
      return false;
    }
  }
  return false;
};

const markQuotaExceeded = () => {
  const now = new Date();
  localStorage.setItem('bigquery_quota_exceeded', JSON.stringify({
    exceeded: true,
    month: now.getMonth(),
    year: now.getFullYear()
  }));
};

const getNextQuotaReset = () => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
};

export const DataSyncButton = () => {
  const [syncing, setSyncing] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(checkQuotaStatus());

  useEffect(() => {
    setQuotaExceeded(checkQuotaStatus());
  }, []);

  const handleSync = async () => {
    // Check quota before attempting sync
    if (quotaExceeded) {
      toast.error(
        `BigQuery indisponível - Quota mensal (1TB) excedida. Reset em ${getNextQuotaReset()}.`,
        { duration: 5000 }
      );
      return;
    }

    setSyncing(true);
    const startTime = Date.now();
    toast.info("🔄 Buscando patentes brasileiras via BigQuery...", { duration: 3000 });

    try {
      // Call the BigQuery search function
      const { data, error } = await supabase.functions.invoke('search-patents-bigquery', {
        body: {
          query: 'agricultura sustentável',
          startDate: '20200101', // Last 5 years
          endDate: new Date().toISOString().split('T')[0].replace(/-/g, ''),
          limit: 50,
        },
      });

      if (error) throw error;
      
      // Check if response contains quota error
      if (data?.error && data.error.includes("Quota exceeded")) {
        markQuotaExceeded();
        setQuotaExceeded(true);
        toast.error(
          `Quota mensal do BigQuery excedida (1TB). Reset em ${getNextQuotaReset()}.`,
          { duration: 6000 }
        );
        return;
      }

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
    } catch (error: any) {
      console.error('Sync error:', error);
      
      // Check if error message contains quota exceeded
      const errorMsg = error?.message || JSON.stringify(error);
      if (errorMsg.includes("Quota exceeded")) {
        markQuotaExceeded();
        setQuotaExceeded(true);
        toast.error(
          `Quota mensal do BigQuery excedida (1TB). Reset em ${getNextQuotaReset()}.`,
          { duration: 6000 }
        );
      } else {
        toast.error("❌ Erro ao sincronizar dados. Verifique os logs.");
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleSync}
        disabled={syncing || quotaExceeded}
        variant="outline"
        size="sm"
        className="gap-2"
        title={quotaExceeded ? `BigQuery indisponível até ${getNextQuotaReset()}` : 'Sincronizar dados do BigQuery'}
      >
        {quotaExceeded ? (
          <>
            <AlertCircle className="h-4 w-4" />
            BigQuery Indisponível
          </>
        ) : (
          <>
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Atualizar Dados'}
          </>
        )}
      </Button>
      {quotaExceeded && (
        <span className="text-xs text-muted-foreground">
          Reset: {getNextQuotaReset()}
        </span>
      )}
    </div>
  );
};
