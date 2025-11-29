import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Building2, Users, Download, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PatentClassifications } from "./patent/PatentClassifications";
import { PatentCitations } from "./patent/PatentCitations";
import { PatentWorldwideFamily } from "./patent/PatentWorldwideFamily";
import { PatentTimeline } from "./patent/PatentTimeline";
import { PatentDescription } from "./patent/PatentDescription";
import { PatentClaims } from "./patent/PatentClaims";
import { PatentImageGallery } from "./patent/PatentImageGallery";

interface Patent {
  id: string;
  patent_number: string;
  publication_number?: string;
  title: string;
  abstract?: string;
  company: string;
  inventors?: string[];
  filing_date: string;
  priority_date?: string;
  publication_date?: string;
  grant_date?: string;
  expiry_date?: string;
  status: string;
  category: string;
  google_patents_link?: string;
  inpi_link?: string;
  pdf_url?: string;
  thumbnail_url?: string;
  claims?: string;
  country_status?: Record<string, string>;
  figures?: Array<{ url: string; caption?: string }>;
  language?: string;
  // New detailed fields
  application_number?: string;
  description?: string;
  classifications?: any;
  cited_by?: any;
  similar_documents?: any;
  legal_events?: any;
  worldwide_applications?: any;
  external_links?: any;
  prior_art_keywords?: string[];
  all_images?: string[];
  events?: any;
  details_loaded?: boolean;
  details_loaded_at?: string;
}

interface PatentDetailModalProps {
  patent: Patent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PatentDetailModal = ({ patent, open, onOpenChange }: PatentDetailModalProps) => {
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [localPatent, setLocalPatent] = useState<Patent | null>(patent);
  const { toast } = useToast();

  // Sync local state with prop changes
  useEffect(() => {
    setLocalPatent(patent);
  }, [patent]);

  if (!localPatent) return null;

  const categoryLabels: Record<string, string> = {
    foliar_nutrition: 'Nutrição Foliar',
    biostimulants: 'Bioestimulantes',
    biodefensives: 'Biodefensivos',
    adjuvants: 'Adjuvantes',
    biofertilizers: 'Biofertilizantes',
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const loadPatentDetails = async () => {
    if (!localPatent.patent_number) return;

    setIsLoadingDetails(true);
    try {
      // Create patent_id in the format expected by SearchAPI (e.g., "patent/BR102020018xxx/en")
      const patentId = `patent/${localPatent.patent_number}/pt`;
      
      const { data, error } = await supabase.functions.invoke('get-patent-details', {
        body: { patent_id: patentId }
      });

      if (error) throw error;

      if (data?.patent) {
        setLocalPatent(data.patent);
        toast({
          title: "Detalhes carregados!",
          description: "Informações completas da patente foram carregadas com sucesso.",
        });
      }
    } catch (error) {
      console.error('Error loading patent details:', error);
      toast({
        title: "Erro ao carregar detalhes",
        description: error instanceof Error ? error.message : "Não foi possível carregar os detalhes completos.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <div className="space-y-3">
            <div className="flex items-start gap-2 flex-wrap">
              <Badge variant="outline">{localPatent.patent_number}</Badge>
              {localPatent.publication_number && localPatent.publication_number !== localPatent.patent_number && (
                <Badge variant="outline">Pub: {localPatent.publication_number}</Badge>
              )}
              <Badge>{categoryLabels[localPatent.category] || localPatent.category}</Badge>
              <Badge variant={localPatent.status === 'Granted' ? 'default' : 'secondary'}>
                {localPatent.status}
              </Badge>
              {localPatent.details_loaded && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Detalhes Completos
                </Badge>
              )}
            </div>
            <DialogTitle className="text-2xl leading-tight">{localPatent.title}</DialogTitle>
            
            {!localPatent.details_loaded && (
              <Button
                onClick={loadPatentDetails}
                disabled={isLoadingDetails}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {isLoadingDetails ? 'Carregando detalhes completos...' : 'Carregar Detalhes Completos'}
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="resumo" className="w-full">
          <TabsList className="grid w-full grid-cols-8 h-auto">
            <TabsTrigger value="resumo" className="text-xs">Resumo</TabsTrigger>
            <TabsTrigger value="tecnico" className="text-xs">Técnico</TabsTrigger>
            <TabsTrigger value="reivind" className="text-xs">Reivindicações</TabsTrigger>
            <TabsTrigger value="classif" className="text-xs">Classificações</TabsTrigger>
            <TabsTrigger value="citacoes" className="text-xs">Citações</TabsTrigger>
            <TabsTrigger value="familia" className="text-xs">Família Global</TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
            <TabsTrigger value="acesso" className="text-xs">Acesso</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] w-full pr-4">
            {/* Aba 1: Resumo */}
            <TabsContent value="resumo" className="space-y-4">
              {localPatent.thumbnail_url && (
                <div className="flex justify-center p-4 bg-muted rounded-lg">
                  <img 
                    src={localPatent.thumbnail_url} 
                    alt="Patent thumbnail" 
                    className="max-h-48 object-contain"
                  />
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Resumo
                </h3>
                <p className="text-sm text-muted-foreground">
                  {localPatent.abstract || 'Resumo não disponível'}
                </p>
              </div>

              {localPatent.prior_art_keywords && localPatent.prior_art_keywords.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Palavras-chave</h3>
                  <div className="flex flex-wrap gap-2">
                    {localPatent.prior_art_keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Titular
                  </p>
                  <p className="text-sm text-muted-foreground">{localPatent.company}</p>
                </div>

                {localPatent.inventors && localPatent.inventors.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Inventores
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {localPatent.inventors.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Aba 2: Técnico */}
            <TabsContent value="tecnico" className="space-y-4">
              <PatentDescription 
                description={localPatent.description}
                abstract={localPatent.abstract}
              />
              
              {localPatent.all_images && localPatent.all_images.length > 0 && (
                <div className="mt-6">
                  <PatentImageGallery images={localPatent.all_images} />
                </div>
              )}
            </TabsContent>

            {/* Aba 3: Reivindicações */}
            <TabsContent value="reivind" className="space-y-4">
              <PatentClaims claims={localPatent.claims} />
            </TabsContent>

            {/* Aba 4: Classificações */}
            <TabsContent value="classif" className="space-y-4">
              <PatentClassifications classifications={localPatent.classifications || []} />
            </TabsContent>

            {/* Aba 5: Citações */}
            <TabsContent value="citacoes" className="space-y-4">
              <PatentCitations 
                citedBy={localPatent.cited_by}
                similarDocuments={localPatent.similar_documents}
              />
            </TabsContent>

            {/* Aba 6: Família Global */}
            <TabsContent value="familia" className="space-y-4">
              <PatentWorldwideFamily worldwideApplications={localPatent.worldwide_applications} />
            </TabsContent>

            {/* Aba 7: Timeline */}
            <TabsContent value="timeline" className="space-y-4">
              <PatentTimeline 
                events={localPatent.events}
                legalEvents={localPatent.legal_events}
              />
            </TabsContent>

            {/* Aba 8: Acesso */}
            <TabsContent value="acesso" className="space-y-4">
              <div className="space-y-3">
                {localPatent.google_patents_link && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href={localPatent.google_patents_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver no Google Patents
                    </a>
                  </Button>
                )}

                {localPatent.pdf_url && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href={localPatent.pdf_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      Baixar PDF
                    </a>
                  </Button>
                )}

                {localPatent.inpi_link && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href={localPatent.inpi_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver no INPI
                    </a>
                  </Button>
                )}

                {localPatent.external_links && localPatent.external_links.length > 0 && (
                  <>
                    <div className="my-4 border-t" />
                    <h3 className="font-semibold mb-2">Links Externos</h3>
                    {localPatent.external_links.map((link: any, idx: number) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <a href={link.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {link.text}
                        </a>
                      </Button>
                    ))}
                  </>
                )}

                {!localPatent.google_patents_link && !localPatent.pdf_url && !localPatent.inpi_link && (!localPatent.external_links || localPatent.external_links.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum link disponível para esta patente.
                  </p>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
