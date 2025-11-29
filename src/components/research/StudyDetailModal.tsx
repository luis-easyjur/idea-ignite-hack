import { Study } from "@/types/research";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AuthorList } from "./AuthorList";
import { ImpactMetrics } from "./ImpactMetrics";
import { TopicHierarchy } from "./TopicHierarchy";
import { AbstractSection } from "./AbstractSection";
import { LocationLinks } from "./LocationLinks";
import { SDGBadges } from "./SDGBadges";
import { Book, Users, Tag, Globe, Link as LinkIcon, FileText } from "lucide-react";
import { formatNumber } from "@/lib/research-utils";

interface StudyDetailModalProps {
  study: Study | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudyDetailModal({ study, open, onOpenChange }: StudyDetailModalProps) {
  if (!study) return null;

  const typeTranslations: Record<string, string> = {
    "article": "Artigo",
    "review": "Revisão",
    "book-chapter": "Capítulo",
    "preprint": "Preprint",
  };

  const oaStatusColors = {
    gold: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    green: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    hybrid: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    bronze: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    closed: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  };

  const oaStatusTranslations: Record<string, string> = {
    gold: "Ouro",
    green: "Verde",
    hybrid: "Híbrido",
    bronze: "Bronze",
    closed: "Restrito",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={oaStatusColors[study.open_access.oa_status]}>
              {oaStatusTranslations[study.open_access.oa_status]}
            </Badge>
            <Badge variant="secondary">
              {typeTranslations[study.type] || study.type}
            </Badge>
            <Badge variant="outline">
              {study.publication_year}
            </Badge>
          </div>
          <DialogTitle className="text-2xl leading-tight pr-8">
            {study.title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-140px)]">
          <div className="p-6 pt-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">
                  <FileText className="h-4 w-4 mr-2" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="authors">
                  <Users className="h-4 w-4 mr-2" />
                  Autores
                </TabsTrigger>
                <TabsTrigger value="classification">
                  <Tag className="h-4 w-4 mr-2" />
                  Classificação
                </TabsTrigger>
                <TabsTrigger value="sdgs">
                  <Globe className="h-4 w-4 mr-2" />
                  ODS
                </TabsTrigger>
                <TabsTrigger value="access">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Acesso
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    Resumo
                  </h4>
                  <AbstractSection abstractInvertedIndex={study.abstract_inverted_index} />
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Métricas de Impacto</h4>
                  <ImpactMetrics
                    citedByCount={study.cited_by_count}
                    fwci={study.fwci}
                    citationPercentile={study.citation_normalized_percentile}
                  />
                </div>

                {study.referenced_works_count > 0 && (
                  <div className="text-sm text-muted-foreground">
                    📚 Referências: {formatNumber(study.referenced_works_count)}
                  </div>
                )}
              </TabsContent>

              {/* Authors Tab */}
              <TabsContent value="authors" className="space-y-4 mt-6">
                <div>
                  <h4 className="font-semibold mb-3">
                    Autores ({study.authorships.length})
                  </h4>
                  <AuthorList authorships={study.authorships} maxAuthors={999} />
                </div>

                {study.corresponding_author_ids?.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    ✉ {study.corresponding_author_ids.length} autor(es) correspondente(s)
                  </div>
                )}

                {study.countries_distinct_count > 0 && (
                  <div className="text-sm text-muted-foreground">
                    🌍 Colaboração internacional: {study.countries_distinct_count} países
                  </div>
                )}
              </TabsContent>

              {/* Classification Tab */}
              <TabsContent value="classification" className="space-y-6 mt-6">
                {study.primary_topic && (
                  <div>
                    <h4 className="font-semibold mb-3">Tópico Principal</h4>
                    <TopicHierarchy topic={study.primary_topic} showScore />
                  </div>
                )}

                {study.topics && study.topics.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">
                      Todos os Tópicos ({study.topics.length})
                    </h4>
                    <div className="space-y-2">
                      {study.topics.map((topic, i) => (
                        <TopicHierarchy key={i} topic={topic} showScore />
                      ))}
                    </div>
                  </div>
                )}

                {study.keywords && study.keywords.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">
                      Palavras-chave ({study.keywords.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {study.keywords.map((keyword, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {keyword.display_name}
                          <span className="ml-1 text-muted-foreground">
                            ({(keyword.score * 100).toFixed(0)}%)
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {study.mesh && study.mesh.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">
                      Termos MeSH ({study.mesh.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {study.mesh.map((term, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {term.descriptor_name}
                          {term.is_major_topic && " ⭐"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* SDGs Tab */}
              <TabsContent value="sdgs" className="space-y-4 mt-6">
                {study.sustainable_development_goals && study.sustainable_development_goals.length > 0 ? (
                  <>
                    <h4 className="font-semibold mb-3">
                      Objetivos de Desenvolvimento Sustentável (ODS)
                    </h4>
                    <SDGBadges sdgs={study.sustainable_development_goals} />
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    Nenhum ODS associado a este estudo.
                  </div>
                )}
              </TabsContent>

              {/* Access Tab */}
              <TabsContent value="access" className="space-y-6 mt-6">
                <div>
                  <h4 className="font-semibold mb-3">Links de Acesso</h4>
                  <LocationLinks
                    primaryLocation={study.primary_location}
                    locations={study.locations}
                    doi={study.doi}
                  />
                </div>

                {study.apc_paid && (
                  <div>
                    <h4 className="font-semibold mb-3">Taxa de Publicação (APC)</h4>
                    <div className="space-y-1 text-sm">
                      <p>Valor: {study.apc_paid.value} {study.apc_paid.currency}</p>
                      <p>Valor em USD: ${study.apc_paid.value_usd.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>📅 Data de publicação: {study.publication_date}</p>
                  {study.language && <p>🗣️ Idioma: {study.language}</p>}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
