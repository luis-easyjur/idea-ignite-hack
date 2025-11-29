import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Loader2, Calendar, ExternalLink, FileText, TrendingUp, Target, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MarketResearchReport } from "@/types/market-research";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const MarketResearchPanel = () => {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [reports, setReports] = useState<MarketResearchReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MarketResearchReport | null>(null);
  const { toast } = useToast();

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("market_research_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
      return;
    }

    setReports((data || []) as MarketResearchReport[]);
    
    // Select first report by default
    if (data && data.length > 0 && !selectedReport) {
      setSelectedReport(data[0] as MarketResearchReport);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResearch = async () => {
    if (!title.trim() || !prompt.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e o prompt para pesquisa.",
        variant: "destructive",
      });
      return;
    }

    setIsResearching(true);

    try {
      const { data, error } = await supabase.functions.invoke("market-deep-research", {
        body: {
          title: title.trim(),
          prompt: prompt.trim(),
        },
      });

      if (error) throw error;

      toast({
        title: "Pesquisa concluída",
        description: "O estudo de mercado foi gerado com sucesso.",
      });

      // Refresh reports and select the new one
      await fetchReports();
      
      if (data?.report) {
        setSelectedReport(data.report);
      }

      // Clear form
      setTitle("");
      setPrompt("");
    } catch (error) {
      console.error("Research error:", error);
      toast({
        title: "Erro na pesquisa",
        description: "Não foi possível realizar o estudo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsResearching(false);
    }
  };

  const examplePrompts = [
    "Analise o mercado de bioestimulantes no Brasil: principais players, tendências, oportunidades e tamanho de mercado",
    "Compare tecnologias de nutrição foliar dos principais fabricantes no agronegócio brasileiro",
    "Mapeie lançamentos de produtos biológicos para controle de pragas nos últimos 12 meses",
    "Estude o mercado de biofertilizantes: regulamentação, principais empresas e perspectivas de crescimento",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Deep Research de Mercado</CardTitle>
              <CardDescription>
                Estudos de mercado aprofundados com IA + Google Search
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título do Estudo</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Análise do Mercado de Bioestimulantes 2025"
              disabled={isResearching}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt de Pesquisa</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva o que você deseja pesquisar..."
              rows={4}
              disabled={isResearching}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Exemplos de prompts:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPrompt(example);
                    setTitle(example.split(":")[0].trim());
                  }}
                  disabled={isResearching}
                  className="text-xs h-auto py-2 whitespace-normal text-left"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleResearch}
            disabled={isResearching || !title.trim() || !prompt.trim()}
            className="w-full"
          >
            {isResearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Realizando pesquisa aprofundada...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Iniciar Deep Research
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estudos Realizados ({reports.length})</CardTitle>
            <CardDescription>Histórico de pesquisas de mercado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                {reports.map((report) => (
                  <Button
                    key={report.id}
                    variant={selectedReport?.id === report.id ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{report.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(report.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              {selectedReport && (
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{selectedReport.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(selectedReport.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="summary">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="summary">
                            <FileText className="h-4 w-4 mr-1" />
                            Resumo
                          </TabsTrigger>
                          <TabsTrigger value="findings">
                            <Target className="h-4 w-4 mr-1" />
                            Principais
                          </TabsTrigger>
                          <TabsTrigger value="details">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Detalhes
                          </TabsTrigger>
                          <TabsTrigger value="sources">
                            <Lightbulb className="h-4 w-4 mr-1" />
                            Fontes
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="summary" className="space-y-4 mt-4">
                          <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap">{selectedReport.summary}</p>
                          </div>
                        </TabsContent>

                        <TabsContent value="findings" className="space-y-2 mt-4">
                          {selectedReport.key_findings && selectedReport.key_findings.length > 0 ? (
                            <ul className="space-y-2">
                              {selectedReport.key_findings.map((finding, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Badge variant="outline" className="mt-0.5">
                                    {idx + 1}
                                  </Badge>
                                  <span className="text-sm">{finding}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Nenhuma descoberta específica registrada
                            </p>
                          )}
                        </TabsContent>

                        <TabsContent value="details" className="mt-4">
                          {selectedReport.result_json && (
                            <Accordion type="single" collapsible className="w-full">
                              {selectedReport.result_json.market_analysis && (
                                <AccordionItem value="market">
                                  <AccordionTrigger>Análise de Mercado</AccordionTrigger>
                                  <AccordionContent className="prose prose-sm max-w-none">
                                    <div className="space-y-3">
                                      <div>
                                        <strong>Tamanho:</strong>{" "}
                                        {selectedReport.result_json.market_analysis.size}
                                      </div>
                                      <div>
                                        <strong>Crescimento:</strong>{" "}
                                        {selectedReport.result_json.market_analysis.growth}
                                      </div>
                                      {selectedReport.result_json.market_analysis.trends && (
                                        <div>
                                          <strong>Tendências:</strong>
                                          <ul>
                                            {selectedReport.result_json.market_analysis.trends.map(
                                              (trend, idx) => (
                                                <li key={idx}>{trend}</li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              )}

                              {selectedReport.result_json.strategic_insights && (
                                <AccordionItem value="insights">
                                  <AccordionTrigger>Insights Estratégicos</AccordionTrigger>
                                  <AccordionContent className="prose prose-sm max-w-none">
                                    <div className="space-y-3">
                                      {selectedReport.result_json.strategic_insights.recommendations && (
                                        <div>
                                          <strong>Recomendações:</strong>
                                          <ul>
                                            {selectedReport.result_json.strategic_insights.recommendations.map(
                                              (rec, idx) => (
                                                <li key={idx}>{rec}</li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              )}

                              {selectedReport.result_json.raw_analysis && (
                                <AccordionItem value="raw">
                                  <AccordionTrigger>Análise Completa</AccordionTrigger>
                                  <AccordionContent className="prose prose-sm max-w-none">
                                    <p className="whitespace-pre-wrap">
                                      {selectedReport.result_json.raw_analysis}
                                    </p>
                                  </AccordionContent>
                                </AccordionItem>
                              )}
                            </Accordion>
                          )}
                        </TabsContent>

                        <TabsContent value="sources" className="mt-4">
                          {selectedReport.sources && selectedReport.sources.length > 0 ? (
                            <ul className="space-y-2">
                              {selectedReport.sources.map((source, idx) => (
                                <li key={idx}>
                                  <a
                                    href={source}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {source}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Nenhuma fonte específica registrada
                            </p>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
