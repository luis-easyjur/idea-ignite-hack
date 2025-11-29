import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Calendar, FileText, Lightbulb, Briefcase, Newspaper } from "lucide-react";
import { CompetitorResearch } from "@/types/competitor";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CompetitorResearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  research: CompetitorResearch | null;
  companyName: string;
}

export const CompetitorResearchModal = ({
  open,
  onOpenChange,
  research,
  companyName,
}: CompetitorResearchModalProps) => {
  if (!research) return null;

  const result = research.result_json;

  const getActivityColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 60) return "text-orange-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{companyName}</DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Pesquisa realizada em{" "}
            {format(new Date(research.researched_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </div>
          <div className="pt-2">
            <Badge variant="outline" className={getActivityColor(research.activity_score)}>
              Índice de Atividade: {research.activity_score}/100
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="regulatory" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="regulatory">
              <FileText className="h-4 w-4 mr-1" />
              Regulatório
            </TabsTrigger>
            <TabsTrigger value="patents">
              <Lightbulb className="h-4 w-4 mr-1" />
              Patentes
            </TabsTrigger>
            <TabsTrigger value="market">
              <Briefcase className="h-4 w-4 mr-1" />
              Mercado
            </TabsTrigger>
            <TabsTrigger value="news">
              <Newspaper className="h-4 w-4 mr-1" />
              Notícias
            </TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
          </TabsList>

          <TabsContent value="regulatory" className="space-y-4 mt-4">
            {result.regulatory && result.regulatory.length > 0 ? (
              result.regulatory.map((reg, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{reg.product_name}</CardTitle>
                    <CardDescription>
                      {reg.registration_number} • {reg.status}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{reg.date}</span>
                      {reg.source_url && (
                        <a
                          href={reg.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          Ver fonte <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum registro regulatório encontrado
              </p>
            )}
          </TabsContent>

          <TabsContent value="patents" className="space-y-4 mt-4">
            {result.patents && result.patents.length > 0 ? (
              result.patents.map((patent, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{patent.title}</CardTitle>
                    <CardDescription>
                      {patent.patent_number} • {patent.status}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Depositada em {patent.filing_date}
                      </span>
                      {patent.source_url && (
                        <a
                          href={patent.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          Ver fonte <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma patente encontrada
              </p>
            )}
          </TabsContent>

          <TabsContent value="market" className="space-y-4 mt-4">
            {result.market_moves && result.market_moves.length > 0 ? (
              result.market_moves.map((move, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge>{move.type}</Badge>
                      <CardDescription>{move.date}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{move.description}</p>
                    {move.source_url && (
                      <a
                        href={move.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Ver fonte <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma movimentação de mercado encontrada
              </p>
            )}
          </TabsContent>

          <TabsContent value="news" className="space-y-4 mt-4">
            {result.news && result.news.length > 0 ? (
              result.news.map((newsItem, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{newsItem.title}</CardTitle>
                    <CardDescription>{newsItem.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{newsItem.summary}</p>
                    {newsItem.source_url && (
                      <a
                        href={newsItem.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Ler notícia completa <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma notícia encontrada
              </p>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise Estratégica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{result.strategic_analysis}</p>
                </div>
              </CardContent>
            </Card>

            {research.sources && research.sources.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Fontes Consultadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {research.sources.map((source, idx) => (
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
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
