import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useZARCMunicipiosPorUF } from "@/hooks/useZARCData";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

// Brazil TopoJSON from official source
const BRAZIL_TOPO_URL = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

// State name to UF code mapping
const STATE_TO_UF: Record<string, string> = {
  "Acre": "AC",
  "Alagoas": "AL",
  "Amapá": "AP",
  "Amazonas": "AM",
  "Bahia": "BA",
  "Ceará": "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  "Goiás": "GO",
  "Maranhão": "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  "Pará": "PA",
  "Paraíba": "PB",
  "Paraná": "PR",
  "Pernambuco": "PE",
  "Piauí": "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  "Rondônia": "RO",
  "Roraima": "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  "Sergipe": "SE",
  "Tocantins": "TO",
};

// Color scale function
const getColorByCount = (count: number, max: number): string => {
  if (count === 0) return "hsl(var(--muted))";
  
  const intensity = Math.pow(count / max, 0.6); // Non-linear scale for better visibility
  const hue = 142; // Green hue
  const saturation = 45 + intensity * 25; // 45-70%
  const lightness = 75 - intensity * 45; // 75-30%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const ZARCBrazilMap = () => {
  const { data, isLoading, error } = useZARCMunicipiosPorUF();
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Create a map of UF -> count for quick lookup
  const ufDataMap = useMemo(() => {
    const map: Record<string, number> = {};
    data?.forEach((item) => {
      map[item.key] = item.doc_count;
    });
    return map;
  }, [data]);

  const maxCount = useMemo(() => {
    return Math.max(...(data?.map((d) => d.doc_count) || [1]));
  }, [data]);

  const total = useMemo(() => {
    return data?.reduce((sum, d) => sum + d.doc_count, 0) || 0;
  }, [data]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar mapa</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Potencial Agrícola por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mapa de Potencial Agrícola - Brasil</span>
          <Badge variant="outline" className="text-xs">
            {total.toLocaleString()} municípios mapeados
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {/* Tooltip */}
        {showTooltip && (
          <div
            className="absolute z-50 bg-popover border border-border rounded-lg px-3 py-2 shadow-lg pointer-events-none text-sm"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: "translate(-50%, -100%)",
            }}
          >
            {tooltipContent}
          </div>
        )}

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 650,
            center: [-54, -15],
          }}
          style={{ width: "100%", height: "400px" }}
        >
          <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={4}>
            <Geographies geography={BRAZIL_TOPO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties.name;
                  const uf = STATE_TO_UF[stateName] || "";
                  const count = ufDataMap[uf] || 0;
                  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
                  const fillColor = getColorByCount(count, maxCount);

                  return (
                    <Geography
                      key={geo.rpiKey || geo.id || stateName}
                      geography={geo}
                      fill={fillColor}
                      stroke="hsl(var(--border))"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { 
                          outline: "none", 
                          fill: "hsl(var(--primary))",
                          cursor: "pointer"
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={(evt) => {
                        const rect = (evt.target as SVGElement).closest('svg')?.getBoundingClientRect();
                        if (rect) {
                          setTooltipPosition({
                            x: evt.clientX - rect.left,
                            y: evt.clientY - rect.top - 10,
                          });
                        }
                        setTooltipContent(`${stateName} (${uf}): ${count.toLocaleString()} municípios (${percentage}%)`);
                        setShowTooltip(true);
                      }}
                      onMouseLeave={() => {
                        setShowTooltip(false);
                      }}
                      onMouseMove={(evt) => {
                        const rect = (evt.target as SVGElement).closest('svg')?.getBoundingClientRect();
                        if (rect) {
                          setTooltipPosition({
                            x: evt.clientX - rect.left,
                            y: evt.clientY - rect.top - 10,
                          });
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-xs text-muted-foreground">Menor cobertura</span>
          <div className="flex h-3 rounded overflow-hidden">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((intensity, i) => (
              <div
                key={i}
                className="w-8 h-full"
                style={{ backgroundColor: getColorByCount(intensity * maxCount, maxCount) }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Maior cobertura</span>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          MG e SP concentram a maior cobertura de zoneamento agrícola • Clique e arraste para navegar
        </p>
      </CardContent>
    </Card>
  );
};