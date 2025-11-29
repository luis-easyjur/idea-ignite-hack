import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { InsightsChat } from "@/components/insights/InsightsChat";
import { InsightsVisualization, Insight } from "@/components/insights/InsightsVisualization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, Sparkles } from "lucide-react";

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
        <main className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8 animate-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Insights Estratégicos
                </h1>
                <p className="text-muted-foreground">
                  Análise avançada com IA integrando dados de todos os módulos
                </p>
              </div>
            </div>
          </div>

          {/* Main Content - Layout Híbrido */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Section - Left Column */}
            <div className="lg:col-span-1">
              <InsightsChat onInsightGenerated={handleInsightGenerated} />
            </div>

            {/* Visualization Section - Right Columns */}
            <div className="lg:col-span-2">
              <InsightsVisualization 
                insights={insights} 
                onInsightSelect={handleInsightSelect}
              />
            </div>
          </div>

          {/* Info Card */}
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Como funciona</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">1. Faça uma pergunta</h4>
                  <p className="text-muted-foreground">
                    Use o chat para fazer perguntas ou solicitar análises sobre qualquer aspecto do mercado.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Análise com contexto completo</h4>
                  <p className="text-muted-foreground">
                    A IA analisa dados de todos os módulos: Regulatory, Patents, Market, Competitors e Research.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. Insights gerados</h4>
                  <p className="text-muted-foreground">
                    Os insights aparecem automaticamente na visualização, organizados por tipo e impacto.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
