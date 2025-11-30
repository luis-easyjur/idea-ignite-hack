import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

const BRAZIL_TOPO_URL = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

export const ZARCMinasGeraisMap = () => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  return (
    <div className="relative w-full h-full min-h-[200px]">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1800,
          center: [-44.5, -18.5], // Center on MG
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={BRAZIL_TOPO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties.name;
              const isMG = stateName === "Minas Gerais";
              const isNeighbor = ["São Paulo", "Rio de Janeiro", "Espírito Santo", "Bahia", "Goiás", "Mato Grosso do Sul", "Distrito Federal"].includes(stateName);
              
              // Only show MG and neighboring states
              if (!isMG && !isNeighbor) return null;

              return (
                <Geography
                  key={geo.rpiKey || geo.id || stateName}
                  geography={geo}
                  fill={
                    isMG 
                      ? hoveredState === stateName 
                        ? "hsl(142, 60%, 35%)" 
                        : "hsl(142, 50%, 40%)"
                      : "hsl(var(--muted))"
                  }
                  stroke={isMG ? "hsl(142, 50%, 25%)" : "hsl(var(--border))"}
                  strokeWidth={isMG ? 2 : 0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", cursor: isMG ? "pointer" : "default" },
                    pressed: { outline: "none" },
                  }}
                  onMouseEnter={() => setHoveredState(stateName)}
                  onMouseLeave={() => setHoveredState(null)}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      
      {/* MG Label */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <span className="text-white font-bold text-lg drop-shadow-lg">MG</span>
      </div>
    </div>
  );
};