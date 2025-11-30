import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Thermometer, 
  Droplets, 
  CloudRain, 
  MapPin, 
  Leaf, 
  TrendingUp, 
  Map, 
  Satellite 
} from "lucide-react";

const climApiStats = [
  {
    label: "Temp. Média",
    value: "28.5°C",
    icon: Thermometer,
    color: "bg-chart-2/10 text-chart-2"
  },
  {
    label: "Umidade",
    value: "72%",
    icon: Droplets,
    color: "bg-chart-2/10 text-chart-2"
  },
  {
    label: "Precipitação 7d",
    value: "45mm",
    icon: CloudRain,
    color: "bg-chart-2/10 text-chart-2"
  },
  {
    label: "Pontos LAT/LONG",
    value: "1.247",
    icon: MapPin,
    color: "bg-chart-2/10 text-chart-2"
  }
];

const satVegStats = [
  {
    label: "NDVI Médio",
    value: "0.82",
    icon: Leaf,
    color: "bg-chart-1/10 text-chart-1"
  },
  {
    label: "EVI Médio",
    value: "0.71",
    icon: TrendingUp,
    color: "bg-chart-1/10 text-chart-1"
  },
  {
    label: "Área Monitorada",
    value: "2.5M ha",
    icon: Map,
    color: "bg-chart-1/10 text-chart-1"
  },
  {
    label: "Imagens MODIS",
    value: "8.432",
    icon: Satellite,
    color: "bg-chart-1/10 text-chart-1"
  }
];

export const ExternalApisStatsGrid = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">
          Fontes de Dados Externas
        </h3>
        <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
          Dados Mockados
        </Badge>
      </div>

      {/* ClimAPI Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CloudRain className="h-5 w-5 text-chart-2" />
          <h4 className="text-lg font-semibold text-foreground">
            ClimAPI - Dados Climáticos GFS/NOAA
          </h4>
          <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/30 text-xs">
            API Externa
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {climApiStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* SATVeg API Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Satellite className="h-5 w-5 text-chart-1" />
          <h4 className="text-lg font-semibold text-foreground">
            SATVeg API - Índices Vegetativos Embrapa
          </h4>
          <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/30 text-xs">
            API Externa
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {satVegStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
