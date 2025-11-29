import { Card } from "./ui/card";
import { FileText, Shield, CheckCircle, ArrowRight } from "lucide-react";
import { Badge } from "./ui/badge";

interface TimelineEvent {
  type: "science" | "patent" | "regulatory";
  title: string;
  date: string;
  company: string;
}

const events: TimelineEvent[] = [
  {
    type: "science",
    title: "Artigo sobre nova molécula bioestimulante",
    date: "Jan 2023",
    company: "Universidade Federal"
  },
  {
    type: "patent",
    title: "Patente depositada no INPI",
    date: "Jul 2023",
    company: "Competidor X"
  },
  {
    type: "regulatory",
    title: "Registro aprovado no MAPA",
    date: "Dez 2024",
    company: "Competidor X"
  }
];

export const CorrelationTimeline = () => {
  const icons = {
    science: FileText,
    patent: Shield,
    regulatory: CheckCircle,
  };

  const colors = {
    science: "--chart-4",
    patent: "--chart-3",
    regulatory: "--chart-2",
  };

  const labels = {
    science: "Científico",
    patent: "Patente",
    regulatory: "Registro",
  };

  return (
    <Card className="p-6 animate-in">
      <h3 className="text-lg font-bold text-foreground mb-2">Correlação de Dados</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Rastreamento da jornada de produtos concorrentes
      </p>

      <div className="space-y-6">
        {events.map((event, index) => {
          const Icon = icons[event.type];
          return (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: `hsl(var(${colors[event.type]}) / 0.1)` }}
                >
                  <Icon className="h-5 w-5" style={{ color: `hsl(var(${colors[event.type]}))` }} />
                </div>
                {index < events.length - 1 && (
                  <div className="w-0.5 h-12 bg-border mt-2"></div>
                )}
              </div>

              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" style={{ 
                    backgroundColor: `hsl(var(${colors[event.type]}) / 0.1)`,
                    borderColor: `hsl(var(${colors[event.type]}) / 0.2)`,
                    color: `hsl(var(${colors[event.type]}))`
                  }}>
                    {labels[event.type]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{event.date}</span>
                </div>
                <h4 className="font-semibold text-foreground mb-1">{event.title}</h4>
                <p className="text-sm text-muted-foreground">{event.company}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2 text-primary">
          <ArrowRight className="h-5 w-5" />
          <p className="text-sm font-medium">
            Previsão: Lançamento comercial em Q2 2025
          </p>
        </div>
      </div>
    </Card>
  );
};
