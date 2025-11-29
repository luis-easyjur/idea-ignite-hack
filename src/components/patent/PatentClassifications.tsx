import { Badge } from "@/components/ui/badge";

interface Classification {
  code: string;
  description: string;
  leaf: boolean;
  first_code: boolean;
}

interface PatentClassificationsProps {
  classifications: Classification[];
}

export const PatentClassifications = ({ classifications }: PatentClassificationsProps) => {
  if (!classifications || classifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma classificação disponível
      </div>
    );
  }

  const primaryClassifications = classifications.filter(c => c.first_code);
  const otherClassifications = classifications.filter(c => !c.first_code);

  return (
    <div className="space-y-6">
      {primaryClassifications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-primary">★</span> Classificações Principais
          </h3>
          <div className="space-y-3">
            {primaryClassifications.map((classification, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5"
              >
                <div className="flex items-start gap-3">
                  <Badge variant="default" className="text-sm font-mono">
                    {classification.code}
                  </Badge>
                  {classification.leaf && (
                    <Badge variant="secondary" className="text-xs">
                      Leaf
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-sm text-foreground/80">
                  {classification.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {otherClassifications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Classificações Secundárias ({otherClassifications.length})
          </h3>
          <div className="space-y-2">
            {otherClassifications.map((classification, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border bg-card"
              >
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="text-xs font-mono">
                    {classification.code}
                  </Badge>
                  {classification.leaf && (
                    <Badge variant="secondary" className="text-xs">
                      Leaf
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {classification.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};