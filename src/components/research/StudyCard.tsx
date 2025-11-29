import { Study } from "@/types/research";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users, Quote } from "lucide-react";
import { formatNumber } from "@/lib/research-utils";

interface StudyCardProps {
  study: Study;
  onViewDetails: () => void;
}

export function StudyCard({ study, onViewDetails }: StudyCardProps) {
  const oaStatusColors = {
    gold: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    green: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    hybrid: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    bronze: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    closed: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  };

  const typeTranslations: Record<string, string> = {
    "article": "Artigo",
    "review": "Revisão",
    "book-chapter": "Capítulo",
    "preprint": "Preprint",
  };

  const oaStatusTranslations: Record<string, string> = {
    gold: "Ouro",
    green: "Verde",
    hybrid: "Híbrido",
    bronze: "Bronze",
    closed: "Restrito",
  };

  const firstThreeAuthors = study.authorships.slice(0, 3);
  const hasMoreAuthors = study.authorships.length > 3;
  const topKeywords = study.keywords?.slice(0, 3) || [];

  const isTopPercentile = study.citation_normalized_percentile?.is_in_top_1_percent || study.citation_normalized_percentile?.is_in_top_10_percent;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {/* Badges Row */}
      <div className="flex flex-wrap gap-2 mb-4">
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

      {/* Title */}
      <h3 className="text-xl font-semibold mb-3 line-clamp-2 text-foreground">
        {study.title}
      </h3>

      {/* Authors */}
      <div className="flex items-start gap-2 mb-3 text-sm text-muted-foreground">
        <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>
          {firstThreeAuthors.map((auth, i) => auth.author.display_name).join(", ")}
          {hasMoreAuthors && " et al."}
        </span>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className="flex items-center gap-1.5">
          <Quote className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatNumber(study.cited_by_count)}</span>
          <span className="text-muted-foreground">citações</span>
        </div>
        {isTopPercentile && (
          <Badge variant="default" className="text-xs">
            ⭐ Top {study.citation_normalized_percentile?.is_in_top_1_percent ? "1" : "10"}%
          </Badge>
        )}
      </div>

      {/* Keywords */}
      {topKeywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {topKeywords.map((keyword, i) => (
            <span key={i} className="text-xs text-muted-foreground">
              {i > 0 && " • "}
              {keyword.display_name}
            </span>
          ))}
        </div>
      )}

      {/* View Details Button */}
      <div className="flex justify-end">
        <Button onClick={onViewDetails} variant="ghost" size="sm">
          Ver detalhes
          <ExternalLink className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
