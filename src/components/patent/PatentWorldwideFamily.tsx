import { ExternalLink, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Application {
  country_code: string;
  application_number: string;
  legal_status: string;
  legal_status_cat: string;
  filing_date: string;
  link: string;
}

interface YearGroup {
  year: string;
  applications: Application[];
}

interface PatentWorldwideFamilyProps {
  worldwideApplications?: YearGroup[];
}

const getStatusColor = (statusCat: string) => {
  switch (statusCat?.toLowerCase()) {
    case 'active':
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
    case 'expired':
    case 'abandoned':
      return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
  }
};

export const PatentWorldwideFamily = ({ worldwideApplications }: PatentWorldwideFamilyProps) => {
  if (!worldwideApplications || worldwideApplications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma aplicação internacional disponível
      </div>
    );
  }

  const allApplications = worldwideApplications.flatMap(group => group.applications);
  const activeCount = allApplications.filter(a => a.legal_status_cat?.toLowerCase() === 'active').length;
  const pendingCount = allApplications.filter(a => a.legal_status_cat?.toLowerCase() === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <Globe className="h-8 w-8 text-primary" />
        <div>
          <h3 className="font-semibold">Presença Global</h3>
          <p className="text-sm text-muted-foreground">
            {allApplications.length} {allApplications.length === 1 ? 'país' : 'países'} • 
            {activeCount > 0 && ` ${activeCount} ativa${activeCount !== 1 ? 's' : ''}`}
            {pendingCount > 0 && ` • ${pendingCount} pendente${pendingCount !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {worldwideApplications.map((yearGroup, groupIdx) => (
        <div key={groupIdx}>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            Ano {yearGroup.year}
          </h4>
          <div className="space-y-2">
            {yearGroup.applications.map((app, appIdx) => (
              <div
                key={appIdx}
                className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-bold">
                        {app.country_code}
                      </Badge>
                      <Badge className={getStatusColor(app.legal_status_cat)}>
                        {app.legal_status_cat || 'Unknown'}
                      </Badge>
                    </div>
                    <p className="text-sm font-mono mb-1">
                      {app.application_number}
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">
                      {app.legal_status}
                    </p>
                    {app.filing_date && (
                      <p className="text-xs text-muted-foreground">
                        Filing: {new Date(app.filing_date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="shrink-0"
                  >
                    <a
                      href={app.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver detalhes"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};