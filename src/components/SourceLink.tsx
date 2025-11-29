import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface SourceLinkProps {
  url: string;
  label: string;
  source?: string;
}

export const SourceLink = ({ url, label, source }: SourceLinkProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-xs"
      asChild
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="h-3 w-3" />
        {label}
        {source && <span className="text-muted-foreground">({source})</span>}
      </a>
    </Button>
  );
};
