import { Authorship } from "@/types/research";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { translateCountry, getCountryFlag, translateAuthorPosition } from "@/lib/research-utils";
import { ExternalLink } from "lucide-react";

interface AuthorListProps {
  authorships: Authorship[];
  maxAuthors?: number;
}

export function AuthorList({ authorships, maxAuthors = 5 }: AuthorListProps) {
  const displayAuthors = authorships.slice(0, maxAuthors);
  const remainingCount = authorships.length - maxAuthors;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {displayAuthors.map((authorship, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Badge 
                  variant={authorship.is_corresponding ? "default" : "secondary"}
                  className="font-normal text-xs"
                >
                  {authorship.author.display_name}
                  {authorship.author.orcid && (
                    <a
                      href={authorship.author.orcid}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 inline-flex"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </Badge>
                {authorship.is_corresponding && (
                  <span className="text-xs text-primary font-semibold">✉</span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm">
              <div className="space-y-1">
                <p className="font-semibold">{authorship.author.display_name}</p>
                <p className="text-xs text-muted-foreground">
                  {translateAuthorPosition(authorship.author_position)}
                  {authorship.is_corresponding && " • Autor Correspondente"}
                </p>
                {authorship.institutions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {authorship.institutions.map((inst, i) => (
                      <p key={i} className="text-xs">
                        {inst.display_name}
                        <br />
                        <span className="text-muted-foreground">
                          {getCountryFlag(inst.country_code)} {translateCountry(inst.country_code)}
                        </span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount} {remainingCount === 1 ? "autor" : "autores"}
        </Badge>
      )}
    </div>
  );
}
