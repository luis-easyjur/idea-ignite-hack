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
    toast.info("🔄 Buscando patentes reais da API...", { duration: 3000 });

    try {
      // Call the data scheduler function
      const { data, error } = await supabase.functions.invoke('data-scheduler');

      if (error) throw error;

      const results = data?.results || {};
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      // Patent results
      if (results.patents?.success) {
        const { inserted, updated } = results.patents;
        const total = inserted + updated;
        
        if (total > 0) {
          toast.success(
            `✅ Patentes: ${inserted} novas, ${updated} atualizadas (${total} total em ${duration}s)`,
            { duration: 5000 }
          );
        } else {
          toast.info(`ℹ️ Nenhuma patente nova encontrada (${duration}s)`, { duration: 4000 });
        }
      } else if (results.patents?.message) {
        toast.warning(`⚠️ Patentes: ${results.patents.message}`);
      }
      
      // AGROFIT results
      if (results.agrofit?.success) {
        toast.success(`✅ MAPA: ${results.agrofit.inserted} novos, ${results.agrofit.updated} atualizados`);
      } else if (results.agrofit?.error) {
        console.error('AGROFIT sync failed:', results.agrofit.error);
      }

      // Reload the page to show updated data
      if (results.patents?.success && (results.patents.inserted > 0 || results.patents.updated > 0)) {
        setTimeout(() => window.location.reload(), 2000);
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
