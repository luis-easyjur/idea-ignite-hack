import { CheckCircle2, Clock, XCircle, AlertCircle, Pause } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { SourceLink } from "./SourceLink";

interface RegulatoryRecord {
  id: string;
  product_name: string;
  company: string;
  status: string;
  registration_number: string | null;
  submission_date: string | null;
  approval_date: string | null;
  category: string;
  mapa_link: string | null;
}

interface RegulatoryTimelineProps {
  records: RegulatoryRecord[];
}

const statusConfig: Record<
  string,
  { icon: any; color: string; label: string; bgColor: string }
> = {
  approved: {
    icon: CheckCircle2,
    color: "text-green-500",
    label: "Aprovado",
    bgColor: "bg-green-500/10",
  },
  under_analysis: {
    icon: Clock,
    color: "text-yellow-500",
    label: "Em Análise",
    bgColor: "bg-yellow-500/10",
  },
  pre_registered: {
    icon: AlertCircle,
    color: "text-blue-500",
    label: "Pré-Registrado",
    bgColor: "bg-blue-500/10",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-500",
    label: "Rejeitado",
    bgColor: "bg-red-500/10",
  },
  suspended: {
    icon: Pause,
    color: "text-gray-500",
    label: "Suspenso",
    bgColor: "bg-gray-500/10",
  },
};

const categoryLabels: Record<string, string> = {
  foliar_nutrition: "Nutrição Foliar",
  biostimulants: "Bioestimulantes",
  biodefensives: "Biodefensivos",
  adjuvants: "Adjuvantes",
  biofertilizers: "Biofertilizantes",
};

export const RegulatoryTimeline = ({ records }: RegulatoryTimelineProps) => {
  return (
    <div className="space-y-4">
      {records.map((record, index) => {
        const config = statusConfig[record.status] || statusConfig.under_analysis;
        const Icon = config.icon;

        return (
          <Card key={record.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${config.bgColor}`}>
                <Icon className={`h-6 w-6 ${config.color}`} />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {record.product_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{record.company}</p>
                  </div>
                  <Badge variant="outline" className={config.color}>
                    {config.label}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {categoryLabels[record.category] || record.category}
                  </Badge>
                  {record.registration_number && (
                    <Badge variant="outline" className="text-xs">
                      {record.registration_number}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                  {record.submission_date && (
                    <span>
                      Submetido: {new Date(record.submission_date).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  {record.approval_date && (
                    <span>
                      Aprovado: {new Date(record.approval_date).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
                
                {record.mapa_link && (
                  <div className="mt-2">
                    <SourceLink url={record.mapa_link} label="Ver no MAPA" source="MAPA" />
                  </div>
                )}
              </div>
            </div>

            {index < records.length - 1 && (
              <div className="ml-9 mt-4 border-l-2 border-muted h-4"></div>
            )}
          </Card>
        );
      })}
    </div>
  );
};