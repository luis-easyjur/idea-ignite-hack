import { Location } from "@/types/research";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, Lock, Unlock } from "lucide-react";

interface LocationLinksProps {
  primaryLocation: Location;
  locations?: Location[];
  doi?: string;
}

export function LocationLinks({ primaryLocation, locations, doi }: LocationLinksProps) {
  const allLocations = locations || [primaryLocation];
  
  // Encontrar melhor link de acesso
  const oaLocation = allLocations.find(loc => loc.is_oa && loc.pdf_url);
  const bestLink = oaLocation?.pdf_url || oaLocation?.landing_page_url || primaryLocation.landing_page_url;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Badge de Acesso Aberto */}
      {primaryLocation.is_oa ? (
        <Badge variant="secondary" className="gap-1">
          <Unlock className="h-3 w-3" />
          Acesso Aberto
        </Badge>
      ) : (
        <Badge variant="outline" className="gap-1">
          <Lock className="h-3 w-3" />
          Restrito
        </Badge>
      )}

      {/* Link DOI */}
      {doi && (
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-8"
        >
          <a
            href={doi}
            target="_blank"
            rel="noopener noreferrer"
            className="gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            DOI
          </a>
        </Button>
      )}

      {/* Link para PDF ou Landing Page */}
      {bestLink && (
        <Button
          variant={primaryLocation.is_oa ? "default" : "outline"}
          size="sm"
          asChild
          className="h-8"
        >
          <a
            href={bestLink}
            target="_blank"
            rel="noopener noreferrer"
            className="gap-1"
          >
            <FileText className="h-3 w-3" />
            {oaLocation?.pdf_url ? "Acessar PDF" : "Acessar Artigo"}
          </a>
        </Button>
      )}

      {/* Licença */}
      {primaryLocation.license && (
        <Badge variant="outline" className="text-xs uppercase">
          {primaryLocation.license}
        </Badge>
      )}

      {/* Fonte/Journal */}
      {primaryLocation.source && (
        <Badge variant="secondary" className="text-xs">
          {primaryLocation.source.display_name}
        </Badge>
      )}
    </div>
  );
}
