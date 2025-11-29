import { useState } from "react";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const DataSyncButton = () => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    toast.info("Iniciando sincronização de dados...");

    try {
      // Call the data scheduler function
      const { data, error } = await supabase.functions.invoke('data-scheduler');

      if (error) throw error;

      const results = data?.results || {};
      
      if (results.agrofit?.success) {
        toast.success(`MAPA: ${results.agrofit.inserted} novos, ${results.agrofit.updated} atualizados`);
      }
      
      if (results.patents?.success) {
        toast.success(`Patentes: ${results.patents.inserted} novas, ${results.patents.updated} atualizadas`);
      } else if (results.patents?.message) {
        toast.warning(results.patents.message);
      }

      // Reload the page to show updated data
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Sync error:', error);
      toast.error("Erro ao sincronizar dados");
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
