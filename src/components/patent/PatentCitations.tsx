import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Citation {
  publication_number: string;
  title: string;
  assignee_original: string;
  priority_date: string;
  link: string;
}

interface SimilarDocument {
  publication_number: string;
  title: string;
  publication_date: string;
  link: string;
}

interface PatentCitationsProps {
  citedBy?: {
    family_to_family?: Citation[];
  };
  similarDocuments?: SimilarDocument[];
}

export const PatentCitations = ({ citedBy, similarDocuments }: PatentCitationsProps) => {
  const citations = citedBy?.family_to_family || [];
  const similar = similarDocuments || [];

  if (citations.length === 0 && similar.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma citação ou documento similar disponível
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {citations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            📊 Citado por ({citations.length} {citations.length === 1 ? 'patente' : 'patentes'})
          </h3>
          <div className="space-y-3">
            {citations.map((citation, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        {citation.publication_number}
                      </Badge>
                      {citation.priority_date && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(citation.priority_date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">
                      {citation.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {citation.assignee_original}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="shrink-0"
                  >
                    <a
                      href={citation.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir no Google Patents"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            🔗 Documentos Similares ({similar.length})
          </h3>
          <div className="space-y-3">
            {similar.map((doc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {doc.publication_number}
                      </Badge>
                      {doc.publication_date && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.publication_date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-sm line-clamp-2">
                      {doc.title}
                    </h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="shrink-0"
                  >
                    <a
                      href={doc.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir no Google Patents"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};