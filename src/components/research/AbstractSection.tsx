import { useState } from "react";
import { Button } from "@/components/ui/button";
import { reconstructAbstract } from "@/lib/research-utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AbstractSectionProps {
  abstractInvertedIndex?: Record<string, number[]>;
  maxLength?: number;
}

export function AbstractSection({ abstractInvertedIndex, maxLength = 300 }: AbstractSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!abstractInvertedIndex || Object.keys(abstractInvertedIndex).length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        Resumo não disponível
      </div>
    );
  }

  const fullAbstract = reconstructAbstract(abstractInvertedIndex);
  const shouldTruncate = fullAbstract.length > maxLength;
  const displayText = shouldTruncate && !isExpanded 
    ? fullAbstract.slice(0, maxLength) + "..." 
    : fullAbstract;

  return (
    <div className="space-y-2">
      <div className="text-sm leading-relaxed text-foreground/90">
        {displayText}
      </div>
      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs h-7"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Mostrar mais
            </>
          )}
        </Button>
      )}
    </div>
  );
}
