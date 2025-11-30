import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, User, GraduationCap, Building2, Calendar, Tag, Award } from "lucide-react";
import { CAPESStudy } from "@/types/capes";
import { qualisColors } from "@/lib/qualis-utils";
import { cn } from "@/lib/utils";

interface CAPESStudyCardProps {
  study: CAPESStudy;
  onViewDetails: (study: CAPESStudy) => void;
}

export const CAPESStudyCard = ({ study, onViewDetails }: CAPESStudyCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-border/50">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start gap-2 flex-wrap">
          <Badge 
            variant={study.tipo === 'TESE' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {study.tipo}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            {study.ano}
          </Badge>
          {study.qualis && (
            <Badge className={cn("text-xs font-bold", qualisColors[study.qualis])}>
              <Award className="w-3 h-3 mr-1" />
              Qualis {study.qualis}
            </Badge>
          )}
          {study.grandeArea && (
            <Badge variant="outline" className="text-xs">
              {study.grandeArea}
            </Badge>
          )}
        </div>
        
        <h3 className="text-lg font-semibold leading-tight line-clamp-2 text-foreground">
          {study.titulo}
        </h3>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2 text-muted-foreground">
            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{study.autor}</span>
          </div>
          
          {study.orientador && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <GraduationCap className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">Orientador: {study.orientador}</span>
            </div>
          )}
          
          <div className="flex items-start gap-2 text-muted-foreground">
            <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">
              {study.instituicao}
              {study.siglaUF && ` - ${study.siglaUF}`}
            </span>
          </div>

          {study.areaConhecimento && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{study.areaConhecimento}</span>
            </div>
          )}
        </div>

        {study.palavrasChave.length > 0 && (
          <div className="flex items-start gap-2">
            <Tag className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {study.palavrasChave.slice(0, 3).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {study.palavrasChave.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{study.palavrasChave.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(study)}
          >
            Ver detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
