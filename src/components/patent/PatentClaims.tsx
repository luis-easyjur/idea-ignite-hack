import { List } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PatentClaimsProps {
  claims?: string;
}

export const PatentClaims = ({ claims }: PatentClaimsProps) => {
  if (!claims) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma reivindicação disponível
      </div>
    );
  }

  // Split claims by double newline (each claim is separated)
  const claimsList = claims.split('\n\n').filter(c => c.trim());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <List className="h-6 w-6 text-primary" />
        <div>
          <h3 className="font-semibold">Reivindicações</h3>
          <p className="text-sm text-muted-foreground">
            {claimsList.length} {claimsList.length === 1 ? 'reivindicação' : 'reivindicações'} registrada{claimsList.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {claimsList.map((claim, idx) => {
          const isIndependent = idx === 0 || !claim.match(/^\d+\.\s+.*de acordo com.*reivindicação/i);
          
          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                isIndependent 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'bg-card'
              }`}
            >
              <div className="flex items-start gap-3">
                <Badge 
                  variant={isIndependent ? 'default' : 'outline'}
                  className="mt-0.5 shrink-0"
                >
                  {idx + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  {isIndependent && (
                    <Badge variant="secondary" className="text-xs mb-2">
                      Independente
                    </Badge>
                  )}
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {claim.replace(/^\d+\.\s*/, '')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};