import { useEffect, useState } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";

interface Alert {
  id: string;
  alert_type: string;
  priority: string;
  title: string;
  description: string | null;
  is_read: boolean;
  created_at: string;
}

interface AlertsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnreadCountChange?: (count: number) => void;
}

const alertTypeLabels: Record<string, string> = {
  regulatory_approval: "Aprovação Regulatória",
  patent_expiry: "Expiração de Patente",
  competitor_launch: "Lançamento Concorrente",
  market_change: "Mudança de Mercado",
  new_publication: "Nova Publicação",
  price_change: "Mudança de Preço",
};

const priorityColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
};

export const AlertsPanel = ({ open, onOpenChange, onUnreadCountChange }: AlertsPanelProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAlerts(data || []);
      const unreadCount = data?.filter((a) => !a.is_read).length || 0;
      onUnreadCountChange?.(unreadCount);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast({
        title: "Erro ao carregar alertas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAlerts();
    }
  }, [open]);

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("alerts")
        .update({ is_read: true })
        .eq("id", alertId);

      if (error) throw error;

      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, is_read: true } : alert
        )
      );

      const unreadCount = alerts.filter((a) => !a.is_read && a.id !== alertId).length;
      onUnreadCountChange?.(unreadCount);
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;

      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      const unreadCount = alerts.filter((a) => !a.is_read && a.id !== alertId).length;
      onUnreadCountChange?.(unreadCount);

      toast({
        title: "Alerta excluído",
      });
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast({
        title: "Erro ao excluir alerta",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas e Notificações
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">
              Carregando alertas...
            </p>
          ) : alerts.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Nenhum alerta no momento
              </p>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`p-4 ${!alert.is_read ? "border-primary" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {alertTypeLabels[alert.alert_type] || alert.alert_type}
                      </Badge>
                      <Badge className={priorityColors[alert.priority]}>
                        {alert.priority}
                      </Badge>
                      {!alert.is_read && (
                        <Badge variant="default" className="text-xs">
                          Novo
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {alert.title}
                    </h4>
                    {alert.description && (
                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(alert.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!alert.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => markAsRead(alert.id)}
                        title="Marcar como lido"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteAlert(alert.id)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};