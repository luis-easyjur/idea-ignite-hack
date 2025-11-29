import { Topic } from "@/types/research";
import { Badge } from "@/components/ui/badge";
import { translateDomain, translateField } from "@/lib/research-utils";
import { ChevronRight } from "lucide-react";

interface TopicHierarchyProps {
  topic: Topic;
  showScore?: boolean;
}

export function TopicHierarchy({ topic, showScore = false }: TopicHierarchyProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-sm">
      <Badge variant="outline" className="text-xs">
        {translateDomain(topic.domain.display_name)}
      </Badge>
      <ChevronRight className="h-3 w-3 text-muted-foreground" />
      <Badge variant="outline" className="text-xs">
        {translateField(topic.field.display_name)}
      </Badge>
      <ChevronRight className="h-3 w-3 text-muted-foreground" />
      <Badge variant="outline" className="text-xs">
        {topic.subfield.display_name}
      </Badge>
      <ChevronRight className="h-3 w-3 text-muted-foreground" />
      <Badge variant="secondary" className="text-xs font-semibold">
        {topic.display_name}
      </Badge>
      {showScore && (
        <span className="text-xs text-muted-foreground ml-1">
          ({(topic.score * 100).toFixed(0)}%)
        </span>
      )}
    </div>
  );
}
