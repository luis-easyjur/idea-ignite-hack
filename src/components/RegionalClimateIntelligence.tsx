import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Leaf,
  TrendingUp,
  MapPin,
  Sprout,
  ShoppingBag
} from "lucide-react";
import { Progress } from "./ui/progress";

const regionsData = [
  {
    region: "Centro-Oeste",
    states: "MT, MS, GO, DF",
    color: "bg-chart-3/10 text-chart-3 border-chart-3/30",
    headerColor: "bg-chart-3/20",
    climate: {
      temp: "32°C",
      humidity: "45%",
      precipitation: "12mm",
      trend: "Clima Seco",
      icon: "☀️"
    },
    vegetation: {
      ndvi: 0.75,
      evi: 0.68,
      status: "Vegetação moderada"
    },
    recommendedCrops: [
      { name: "Soja", score: 95, season: "Plantio ideal" },
      { name: "Milho Safrinha", score: 88, season: "Janela aberta" },
      { name: "Algodão", score: 82, season: "Preparação" }
    ],
    commercialOpportunity: "Alta demanda de bioestimulantes para soja"
  },
  {
    region: "Sul",
    states: "PR, SC, RS",
    color: "bg-chart-2/10 text-chart-2 border-chart-2/30",
    headerColor: "bg-chart-2/20",
    climate: {
      temp: "22°C",
      humidity: "78%",
      precipitation: "85mm",
      trend: "Clima Úmido",
      icon: "🌧️"
    },
    vegetation: {
      ndvi: 0.89,
      evi: 0.81,
      status: "Vegetação excelente"
    },
    recommendedCrops: [
      { name: "Trigo", score: 92, season: "Colheita próxima" },
      { name: "Soja", score: 90, season: "Pré-plantio" },
      { name: "Milho", score: 85, season: "Plantio ideal" }
    ],
    commercialOpportunity: "Oportunidade para fungicidas preventivos"
  },
  {
    region: "Sudeste",
    states: "SP, MG, RJ, ES",
    color: "bg-chart-1/10 text-chart-1 border-chart-1/30",
    headerColor: "bg-chart-1/20",
    climate: {
      temp: "28°C",
      humidity: "65%",
      precipitation: "45mm",
      trend: "Clima Estável",
      icon: "⛅"
    },
    vegetation: {
      ndvi: 0.82,
      evi: 0.74,
      status: "Vegetação boa"
    },
    recommendedCrops: [
      { name: "Cana-de-açúcar", score: 94, season: "Manutenção" },
      { name: "Café", score: 91, season: "Florada" },
      { name: "Laranja", score: 87, season: "Colheita" }
    ],
    commercialOpportunity: "Demanda alta de adjuvantes para café"
  },
  {
    region: "Nordeste",
    states: "BA, PE, CE, PI, MA...",
    color: "bg-chart-5/10 text-chart-5 border-chart-5/30",
    headerColor: "bg-chart-5/20",
    climate: {
      temp: "34°C",
      humidity: "38%",
      precipitation: "8mm",
      trend: "Muito Seco",
      icon: "🔥"
    },
    vegetation: {
      ndvi: 0.58,
      evi: 0.52,
      status: "Estresse hídrico"
    },
    recommendedCrops: [
      { name: "Algodão", score: 88, season: "Plantio" },
      { name: "Sorgo", score: 85, season: "Ideal" },
      { name: "Mamona", score: 80, season: "Oportunidade" }
    ],
    commercialOpportunity: "Alta demanda para estresse hídrico"
  },
  {
    region: "Norte",
    states: "PA, AM, RO, TO, AC...",
    color: "bg-chart-4/10 text-chart-4 border-chart-4/30",
    headerColor: "bg-chart-4/20",
    climate: {
      temp: "30°C",
      humidity: "85%",
      precipitation: "180mm",
      trend: "Muito Úmido",
      icon: "🌴"
    },
    vegetation: {
      ndvi: 0.92,
      evi: 0.88,
      status: "Vegetação exuberante"
    },
    recommendedCrops: [
      { name: "Açaí", score: 96, season: "Colheita" },
      { name: "Cacau", score: 90, season: "Manutenção" },
      { name: "Soja (Matopiba)", score: 84, season: "Pré-plantio" }
    ],
    commercialOpportunity: "Mercado crescente para biodefensivos"
  }
];

export const RegionalClimateIntelligence = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Inteligência Climática Regional
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            ClimAPI + SATVeg - Análise por região brasileira
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
            Dados Mockados
          </Badge>
          <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/30">
            ClimAPI
          </Badge>
          <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/30">
            SATVeg
          </Badge>
        </div>
      </div>

      {/* Regional Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {regionsData.map((region, index) => (
          <Card 
            key={index} 
            className="overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {/* Region Header */}
            <div className={`p-4 ${region.headerColor} border-b`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="text-2xl">{region.climate.icon}</span>
                    {region.region}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">{region.states}</p>
                </div>
                <Badge variant="outline" className={region.color}>
                  {region.climate.trend}
                </Badge>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Climate Indicators */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-chart-2/10">
                    <Thermometer className="h-4 w-4 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Temperatura</p>
                    <p className="text-sm font-semibold text-foreground">{region.climate.temp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-chart-2/10">
                    <Droplets className="h-4 w-4 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Umidade</p>
                    <p className="text-sm font-semibold text-foreground">{region.climate.humidity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-chart-2/10">
                    <CloudRain className="h-4 w-4 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Precip. 7d</p>
                    <p className="text-sm font-semibold text-foreground">{region.climate.precipitation}</p>
                  </div>
                </div>
              </div>

              {/* Vegetation Indices */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-chart-1" />
                    <span className="text-xs font-medium text-muted-foreground">NDVI</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{region.vegetation.ndvi}</span>
                </div>
                <Progress value={region.vegetation.ndvi * 100} className="h-2" />
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-chart-1" />
                    <span className="text-xs font-medium text-muted-foreground">EVI</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{region.vegetation.evi}</span>
                </div>
                <Progress value={region.vegetation.evi * 100} className="h-2" />
                
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {region.vegetation.status}
                </p>
              </div>

              {/* Recommended Crops */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sprout className="h-4 w-4 text-chart-1" />
                  <h5 className="text-sm font-semibold text-foreground">Culturas Recomendadas</h5>
                </div>
                <div className="space-y-2">
                  {region.recommendedCrops.map((crop, cropIndex) => (
                    <div key={cropIndex} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{crop.name}</span>
                          <Badge variant="outline" className="text-xs bg-muted/50">
                            {crop.season}
                          </Badge>
                        </div>
                        <span className="text-xs font-bold text-foreground">{crop.score}%</span>
                      </div>
                      <Progress value={crop.score} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Commercial Opportunity */}
              <div className={`p-3 rounded-lg border ${region.color} flex items-start gap-2`}>
                <ShoppingBag className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold mb-1">Oportunidade Comercial</p>
                  <p className="text-xs">{region.commercialOpportunity}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
