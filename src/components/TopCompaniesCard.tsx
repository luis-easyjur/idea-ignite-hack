import { Card } from "./ui/card";
import { Building2 } from "lucide-react";
import { Badge } from "./ui/badge";

interface TopCompaniesCardProps {
  companies: { company: string; count: number }[];
  onCompanyClick?: (company: string) => void;
}

export const TopCompaniesCard = ({ companies, onCompanyClick }: TopCompaniesCardProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-chart-3" />
        Top Empresas
      </h3>
      <div className="space-y-3">
        {companies.map((company, index) => (
          <div
            key={company.company}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            onClick={() => onCompanyClick?.(company.company)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Badge variant="outline" className="shrink-0 w-6 h-6 flex items-center justify-center p-0">
                {index + 1}
              </Badge>
              <span className="text-sm font-medium truncate">{company.company}</span>
            </div>
            <Badge className="shrink-0 ml-2">{company.count}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
