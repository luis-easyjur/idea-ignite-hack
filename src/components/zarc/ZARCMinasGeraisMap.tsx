import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useZARCMunicipiosDetalhadosUF } from "@/hooks/useZARCData";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

// GeoJSON for MG municipalities from IBGE
const MG_MUNICIPIOS_URL = "https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-31-mun.json";

// Color scale function
const getColorByCount = (count: number, max: number): string => {
  if (count === 0) return "hsl(var(--muted))";
  
  const intensity = Math.pow(count / max, 0.5); // Non-linear scale
  const hue = 142; // Green hue
  const saturation = 40 + intensity * 35;
  const lightness = 80 - intensity * 50;
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Normalize municipality names for matching
const normalizeName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s]/g, "") // Remove special chars
    .trim();
};

interface ZARCMinasGeraisMapProps {
  className?: string;
}

export const ZARCMinasGeraisMap = ({ className }: ZARCMinasGeraisMapProps) => {
  const { data, isLoading, error } = useZARCMunicipiosDetalhadosUF('MG');
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Create a normalized map of municipality -> count
  const municipioDataMap = useMemo(() => {
    const map: Record<string, number> = {};
    data?.forEach((item) => {
      const normalizedName = normalizeName(item.key);
      map[normalizedName] = item.doc_count;
      // Also store original name for display
      map[`_original_${normalizedName}`] = item.doc_count;
    });
    return map;
  }, [data]);

  const maxCount = useMemo(() => {
    return Math.max(...(data?.map((d) => d.doc_count) || [1]), 1);
  }, [data]);

  const total = useMemo(() => {
    return data?.reduce((sum, d) => sum + d.doc_count, 0) || 0;
  }, [data]);

  const totalMunicipios = data?.length || 0;

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <p className="text-destructive text-sm">Erro ao carregar mapa</p>
      </div>
    );
  }

  if (isLoading) {
    return <Skeleton className={`w-full h-full min-h-[350px] ${className}`} />;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold">Distribuição por Município</h4>
        <Badge variant="outline" className="text-xs">
          {totalMunicipios} municípios
        </Badge>
      </div>

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

      {/* Map */}
      <div className="bg-muted/20 rounded-lg overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 2800,
            center: [-44.5, -18.5],
          }}
          style={{ width: "100%", height: "350px" }}
        >
          <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={6}>
            <Geographies geography={MG_MUNICIPIOS_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const municipioName = geo.properties.name || geo.properties.nome || "";
                  const normalizedName = normalizeName(municipioName);
                  const count = municipioDataMap[normalizedName] || 0;
                  const fillColor = getColorByCount(count, maxCount);

                  return (
                    <Geography
                      key={geo.rpiKey || geo.id || municipioName}
                      geography={geo}
                      fill={fillColor}
                      stroke="hsl(var(--border))"
                      strokeWidth={0.3}
                      style={{
                        default: { outline: "none" },
                        hover: { 
                          outline: "none", 
                          fill: count > 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                          cursor: "pointer",
                          strokeWidth: 1,
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
                        const percentage = total > 0 ? ((count / total) * 100).toFixed(2) : "0";
                        setTooltipContent(
                          count > 0 
                            ? `${municipioName}: ${count} registros (${percentage}%)`
                            : `${municipioName}: Sem dados ZARC`
                        );
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
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="text-xs text-muted-foreground">Menos registros</span>
        <div className="flex h-2 rounded overflow-hidden">
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((intensity, i) => (
            <div
              key={i}
              className="w-6 h-full"
              style={{ backgroundColor: getColorByCount(intensity * maxCount, maxCount) }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">Mais registros</span>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2">
        {total.toLocaleString()} registros de zoneamento • Zoom com scroll
      </p>
    </div>
  );
};