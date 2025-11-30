import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Wheat, Building2, BarChart3 } from "lucide-react";
import { useZARCTotals } from "@/hooks/useZARCData";
import { ZARCBrazilMap } from "./ZARCBrazilMap";
import { ZARCTopCulturasChart } from "./ZARCTopCulturasChart";
import { ZARCMinasGeraisChart } from "./ZARCMinasGeraisChart";
import { ZARCRiskMatrix } from "./ZARCRiskMatrix";
import { ZARCObtentoresChart } from "./ZARCObtentoresChart";

export const ZARCDashboard = () => {
  const { data: totals, isLoading: loadingTotals, error: totalsError } = useZARCTotals();

  if (totalsError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar dados ZARC</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Não foi possível conectar ao Elasticsearch. Verifique as credenciais.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inteligência ZARC - Zoneamento Agrícola</h2>
          <p className="text-muted-foreground">
            Dados de Risco Climático e Potencial Agrícola por Região
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Fonte: Embrapa ZARC
        </Badge>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Total de Registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTotals ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{totals?.total?.toLocaleString() || 0}</div>
            )}
            <Badge variant="secondary" className="mt-1">Zoneamentos</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wheat className="h-4 w-4 text-green-500" />
              Culturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTotals ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totals?.culturas || 0}</div>
            )}
            <Badge variant="secondary" className="mt-1">Mapeadas</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              Municípios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTotals ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totals?.municipios?.toLocaleString() || 0}</div>
            )}
            <Badge variant="secondary" className="mt-1">Cobertos</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-500" />
              Obtentores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTotals ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totals?.obtentores || 0}</div>
            )}
            <Badge variant="secondary" className="mt-1">Empresas</Badge>
          </CardContent>
        </Card>
      </div>

      {/* First Row: Brazil Map + Top Cultures */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ZARCBrazilMap />
        </div>
        <div className="lg:col-span-2">
          <ZARCTopCulturasChart />
        </div>
      </div>

      {/* Minas Gerais Detail - Full Width with Highlight */}
      <ZARCMinasGeraisChart />

      {/* Third Row: Risk Matrix + Obtentores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ZARCRiskMatrix />
        <ZARCObtentoresChart />
      </div>
    </div>
  );
};