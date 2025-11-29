import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, User, GraduationCap, Building2, BookOpen, Tag, FileText } from "lucide-react";
import { CAPESStudy } from "@/types/capes";

interface CAPESStudyDetailModalProps {
  study: CAPESStudy | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CAPESStudyDetailModal = ({
  study,
  isOpen,
  onClose,
}: CAPESStudyDetailModalProps) => {
  if (!study) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-3">
            <DialogTitle className="text-2xl leading-tight pr-8">
              {study.titulo}
            </DialogTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={study.tipo === 'TESE' ? 'default' : 'secondary'}>
                {study.tipo}
              </Badge>
              <Badge variant="outline">
                <Calendar className="w-3 h-3 mr-1" />
                {study.ano}
              </Badge>
              {study.grandeArea && (
                <Badge variant="outline">{study.grandeArea}</Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="authorship">Autoria</TabsTrigger>
            <TabsTrigger value="classification">Classificação</TabsTrigger>
            <TabsTrigger value="access">Acesso</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {study.resumo && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="w-4 h-4" />
                  <span>Resumo</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {study.resumo}
                </p>
              </div>
            )}

            <Separator />

            {study.palavrasChave.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Tag className="w-4 h-4" />
                  <span>Palavras-chave</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {study.palavrasChave.map((keyword, index) => (
                    <Badge key={index} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="authorship" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <User className="w-4 h-4" />
                  <span>Autor</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">{study.autor}</p>
              </div>

              {study.orientador && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <GraduationCap className="w-4 h-4" />
                      <span>Orientador</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{study.orientador}</p>
                  </div>
                </>
              )}

              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Building2 className="w-4 h-4" />
                  <span>Instituição</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {study.instituicao}
                  {study.siglaUF && ` - ${study.siglaUF}`}
                </p>
              </div>

              {study.programa && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <BookOpen className="w-4 h-4" />
                      <span>Programa</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{study.programa}</p>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="classification" className="space-y-4 mt-4">
            <div className="space-y-4">
              {study.grandeArea && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Grande Área do Conhecimento</div>
                  <p className="text-sm text-muted-foreground pl-6">{study.grandeArea}</p>
                </div>
              )}

              {study.areaConhecimento && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Área do Conhecimento</div>
                    <p className="text-sm text-muted-foreground pl-6">{study.areaConhecimento}</p>
                  </div>
                </>
              )}

              {study.programa && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Programa de Pós-Graduação</div>
                    <p className="text-sm text-muted-foreground pl-6">{study.programa}</p>
                  </div>
                </>
              )}

              {study.linhaPesquisa && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Linha de Pesquisa</div>
                    <p className="text-sm text-muted-foreground pl-6">{study.linhaPesquisa}</p>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="access" className="space-y-4 mt-4">
            {study.urlTextoCompleto ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  O texto completo desta {study.tipo.toLowerCase()} está disponível para acesso online.
                </p>
                <Button
                  variant="default"
                  size="lg"
                  className="w-full"
                  onClick={() => window.open(study.urlTextoCompleto, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Acessar Texto Completo
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  O texto completo não está disponível online.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Entre em contato com a biblioteca da instituição para mais informações sobre acesso.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
