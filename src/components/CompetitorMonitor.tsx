import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Loader2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Competitor, CompetitorResearch } from "@/types/competitor";
import { CompetitorResearchModal } from "./CompetitorResearchModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const CompetitorMonitor = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [research, setResearch] = useState<Record<string, CompetitorResearch>>({});
  const [loadingCompetitor, setLoadingCompetitor] = useState<string | null>(null);
  const [selectedResearch, setSelectedResearch] = useState<{
    research: CompetitorResearch;
    name: string;
  } | null>(null);
  const { toast } = useToast();

  const fetchCompetitors = async () => {
    const { data, error } = await supabase
      .from("competitors")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching competitors:", error);
      toast({
        title: "Erro ao carregar concorrentes",
        description: "Não foi possível carregar a lista de concorrentes.",
        variant: "destructive",
      });
      return;
    }

    setCompetitors(data || []);
  };

  const fetchLatestResearch = async () => {
    const { data, error } = await supabase
      .from("competitor_research")
      .select("*")
      .order("researched_at", { ascending: false });

    if (error) {
      console.error("Error fetching research:", error);
      return;
    }

    // Get latest research for each competitor
    const latestByCompetitor: Record<string, CompetitorResearch> = {};
    data?.forEach((r) => {
      if (!latestByCompetitor[r.competitor_id]) {
        latestByCompetitor[r.competitor_id] = {
          ...r,
          result_json: r.result_json as any,
        } as CompetitorResearch;
      }
    });

    setResearch(latestByCompetitor);
  };

  useEffect(() => {
    fetchCompetitors();
    fetchLatestResearch();
  }, []);

  const handleResearch = async (competitor: Competitor) => {
    setLoadingCompetitor(competitor.id);

    try {
      const { data, error } = await supabase.functions.invoke("research-competitor", {
        body: {
          competitorId: competitor.id,
          companyName: competitor.name,
        },
      });

      if (error) throw error;

      toast({
        title: "Pesquisa concluída",
        description: `Pesquisa sobre ${competitor.name} finalizada com sucesso.`,
      });

      // Refresh research data
      await fetchLatestResearch();
    } catch (error) {
      console.error("Research error:", error);
      toast({
        title: "Erro na pesquisa",
        description: "Não foi possível realizar a pesquisa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingCompetitor(null);
    }
  };

  const getActivityColor = (score: number) => {
    if (score >= 80) return "bg-red-100 text-red-700 border-red-300";
    if (score >= 60) return "bg-orange-100 text-orange-700 border-orange-300";
    if (score >= 40) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-green-100 text-green-700 border-green-300";
  };

  if (competitors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monitor de Concorrentes</CardTitle>
          <CardDescription>
            Nenhum concorrente cadastrado. Adicione empresas para começar o monitoramento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {competitors.map((competitor) => {
          const latestResearch = research[competitor.id];
          const isLoading = loadingCompetitor === competitor.id;

          return (
            <Card key={competitor.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{competitor.name}</CardTitle>
                    {competitor.segment && (
                      <CardDescription>{competitor.segment}</CardDescription>
                    )}
                  </div>
                  {competitor.website && (
                    <a
                      href={competitor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {latestResearch && (
                  <div className="pt-2">
                    <Badge
                      variant="outline"
                      className={getActivityColor(latestResearch.activity_score)}
                    >
                      Score: {latestResearch.activity_score}/100
                    </Badge>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {latestResearch ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Última pesquisa:{" "}
                      {format(new Date(latestResearch.researched_at), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </div>

                    <div className="space-y-1 text-sm">
                      {latestResearch.result_json.regulatory?.length > 0 && (
                        <div>• {latestResearch.result_json.regulatory.length} registros regulatórios</div>
                      )}
                      {latestResearch.result_json.patents?.length > 0 && (
                        <div>• {latestResearch.result_json.patents.length} patentes</div>
                      )}
                      {latestResearch.result_json.market_moves?.length > 0 && (
                        <div>• {latestResearch.result_json.market_moves.length} movimentações</div>
                      )}
                      {latestResearch.result_json.news?.length > 0 && (
                        <div>• {latestResearch.result_json.news.length} notícias</div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResearch(competitor)}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-1" />
                            Atualizar
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          setSelectedResearch({
                            research: latestResearch,
                            name: competitor.name,
                          })
                        }
                        className="flex-1"
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Nenhuma pesquisa realizada ainda
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleResearch(competitor)}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-1" />
                          Iniciar Pesquisa
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CompetitorResearchModal
        open={!!selectedResearch}
        onOpenChange={(open) => !open && setSelectedResearch(null)}
        research={selectedResearch?.research || null}
        companyName={selectedResearch?.name || ""}
      />
    </>
  );
};
