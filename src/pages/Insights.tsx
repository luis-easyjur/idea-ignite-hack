import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { InsightsChat } from "@/components/insights/InsightsChat";
import { Insight } from "@/components/insights/InsightsVisualization";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Insights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  const handleInsightGenerated = (insight: Insight) => {
    // Verificar se o insight já existe (por ID)
    setInsights(prev => {
      const exists = prev.find(i => i.id === insight.id);
      if (exists) return prev;
      return [insight, ...prev];
    });
  };

  const handleInsightSelect = (insight: Insight) => {
    setSelectedInsight(insight);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="w-full max-w-4xl mx-auto px-4 py-6">
          {/* Chat Centralizado */}
          <div className="h-[calc(100vh-3rem)] flex flex-col">
            <InsightsChat onInsightGenerated={handleInsightGenerated} />
          </div>

          {/* Insight Detail Dialog */}
          <Dialog open={!!selectedInsight} onOpenChange={(open) => !open && setSelectedInsight(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              {selectedInsight && (
                <>
                  <DialogHeader>
                    <DialogTitle>{selectedInsight.title}</DialogTitle>
                    <DialogDescription>
                      {new Date(selectedInsight.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Descrição</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedInsight.description}
                      </p>
                    </div>
                    
                    {selectedInsight.metadata && Object.keys(selectedInsight.metadata).length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Detalhes Adicionais</h4>
                        <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                          {JSON.stringify(selectedInsight.metadata, null, 2)}
                        </pre>
                      </div>
                    )}

                    {selectedInsight.sources && selectedInsight.sources.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Fontes</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedInsight.sources.map((source, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Insights;
