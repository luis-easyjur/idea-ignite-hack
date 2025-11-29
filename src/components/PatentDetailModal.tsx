import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Calendar, Building2, Users, Globe, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
}

interface PatentDetailModalProps {
  patent: Patent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PatentDetailModal = ({ patent, open, onOpenChange }: PatentDetailModalProps) => {
  if (!patent) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="space-y-3">
            <div className="flex items-start gap-2 flex-wrap">
              <Badge variant="outline">{patent.patent_number}</Badge>
              {patent.publication_number && patent.publication_number !== patent.patent_number && (
                <Badge variant="outline">Pub: {patent.publication_number}</Badge>
              )}
              <Badge>{categoryLabels[patent.category] || patent.category}</Badge>
              <Badge variant={patent.status === 'Granted' ? 'default' : 'secondary'}>
                {patent.status}
              </Badge>
            </div>
            <DialogTitle className="text-2xl leading-tight">{patent.title}</DialogTitle>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="claims">Reivindicações</TabsTrigger>
            <TabsTrigger value="figures">Figuras</TabsTrigger>
            <TabsTrigger value="links">Acesso</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] w-full pr-4">
            <TabsContent value="overview" className="space-y-4">
              {patent.thumbnail_url && (
                <div className="flex justify-center p-4 bg-muted rounded-lg">
                  <img 
                    src={patent.thumbnail_url} 
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
                  {patent.abstract || 'Resumo não disponível'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Titular
                  </p>
                  <p className="text-sm text-muted-foreground">{patent.company}</p>
                </div>

                {patent.inventors && patent.inventors.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Inventores
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {patent.inventors.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data de Depósito
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(patent.filing_date)}
                    </p>
                  </div>

                  {patent.priority_date && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Data de Prioridade</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(patent.priority_date)}
                      </p>
                    </div>
                  )}

                  {patent.publication_date && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Data de Publicação</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(patent.publication_date)}
                      </p>
                    </div>
                  )}

                  {patent.grant_date && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Data de Concessão</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(patent.grant_date)}
                      </p>
                    </div>
                  )}

                  {patent.expiry_date && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Data de Expiração</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(patent.expiry_date)}
                      </p>
                    </div>
                  )}

                  {patent.language && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Idioma
                      </p>
                      <p className="text-sm text-muted-foreground uppercase">
                        {patent.language}
                      </p>
                    </div>
                  )}
                </div>

                {patent.country_status && Object.keys(patent.country_status).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Status por País</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(patent.country_status).map(([country, status]) => (
                        <Badge key={country} variant="outline">
                          {country}: {status}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="claims" className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Reivindicações</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {patent.claims || 'Reivindicações não disponíveis. Acesse o documento completo através dos links disponíveis na aba "Acesso".'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="figures" className="space-y-4">
              {patent.figures && patent.figures.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {patent.figures.map((figure, index) => (
                    <div key={index} className="space-y-2">
                      <img 
                        src={figure.url} 
                        alt={figure.caption || `Figura ${index + 1}`}
                        className="w-full rounded-lg border"
                      />
                      {figure.caption && (
                        <p className="text-xs text-muted-foreground text-center">
                          {figure.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Figuras não disponíveis. Acesse o documento completo para visualizar as imagens.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="links" className="space-y-4">
              <div className="space-y-3">
                {patent.google_patents_link && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href={patent.google_patents_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver no Google Patents
                    </a>
                  </Button>
                )}

                {patent.pdf_url && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href={patent.pdf_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      Baixar PDF
                    </a>
                  </Button>
                )}

                {patent.inpi_link && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href={patent.inpi_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver no INPI
                    </a>
                  </Button>
                )}

                {!patent.google_patents_link && !patent.pdf_url && !patent.inpi_link && (
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
