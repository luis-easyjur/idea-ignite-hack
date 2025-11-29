import { Calendar, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Event {
  date: string;
  title: string;
  type?: string;
  critical?: boolean;
}

interface LegalEvent {
  date: string;
  code: string;
  title: string;
}

interface PatentTimelineProps {
  events?: Event[];
  legalEvents?: LegalEvent[];
}

export const PatentTimeline = ({ events = [], legalEvents = [] }: PatentTimelineProps) => {
  // Combine and sort all events by date
  const allEvents = [
    ...events.map(e => ({ ...e, source: 'event' as const })),
    ...legalEvents.map(e => ({ ...e, source: 'legal' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (allEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum evento disponível
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <Calendar className="h-6 w-6 text-primary" />
        <div>
          <h3 className="font-semibold">Histórico de Eventos</h3>
          <p className="text-sm text-muted-foreground">
            {allEvents.length} {allEvents.length === 1 ? 'evento registrado' : 'eventos registrados'}
          </p>
        </div>
      </div>

      <div className="relative pl-8 space-y-6">
        {/* Timeline line */}
        <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border" />

        {allEvents.map((event, idx) => {
          const isCritical = 'critical' in event && event.critical;
          const isLegal = event.source === 'legal';

          return (
            <div key={idx} className="relative">
              {/* Timeline dot */}
              <div className={`absolute left-[-31px] top-1.5 ${
                isCritical 
                  ? 'text-destructive' 
                  : isLegal 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}>
                <Circle 
                  className={`h-5 w-5 ${isCritical || isLegal ? 'fill-current' : ''}`} 
                />
              </div>

              {/* Event content */}
              <div className={`p-4 rounded-lg border ${
                isCritical 
                  ? 'bg-destructive/5 border-destructive/20' 
                  : 'bg-card'
              }`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={isCritical ? 'destructive' : isLegal ? 'default' : 'secondary'} className="text-xs">
                      {new Date(event.date).toLocaleDateString('pt-BR')}
                    </Badge>
                    {isLegal && 'code' in event && (
                      <Badge variant="outline" className="text-xs font-mono">
                        {event.code}
                      </Badge>
                    )}
                    {!isLegal && 'type' in event && event.type && (
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    )}
                    {isCritical && (
                      <Badge variant="destructive" className="text-xs">
                        Crítico
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium">{event.title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};