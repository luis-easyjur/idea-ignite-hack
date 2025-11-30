import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useZARCCulturaRisco } from "@/hooks/useZARCData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const ZARCRiskMatrix = () => {
  const { data, isLoading, error } = useZARCCulturaRisco();

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar matriz de risco</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matrix de Risco Climático</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Group data by culture and risk level
  const groupedData: Record<string, { cultura: string; risco20: number; risco30: number }> = {};
  
  data?.forEach((item) => {
    const cultura = item.key.cultura;
    const risco = item.key.risco;
    
    if (!groupedData[cultura]) {
      groupedData[cultura] = { cultura, risco20: 0, risco30: 0 };
    }
    
    if (risco === '20' || risco === '20%') {
      groupedData[cultura].risco20 = item.doc_count;
    } else if (risco === '30' || risco === '30%') {
      groupedData[cultura].risco30 = item.doc_count;
    }
  });

  const chartData = Object.values(groupedData)
    .sort((a, b) => (b.risco20 + b.risco30) - (a.risco20 + a.risco30))
    .slice(0, 12);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Matrix de Risco Climático
            <Badge variant="outline">Cultura x Risco</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Dados de risco climático não disponíveis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Matrix de Risco Climático
          <Badge variant="outline">Cultura x Risco</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="fill-muted-foreground" tick={{ fontSize: 10 }} />
            <YAxis
              dataKey="cultura"
              type="category"
              width={100}
              tick={{ fontSize: 9 }}
              className="fill-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar
              dataKey="risco20"
              name="Risco 20%"
              fill="hsl(45, 80%, 50%)"
              stackId="risk"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="risco30"
              name="Risco 30%"
              fill="hsl(10, 70%, 55%)"
              stackId="risk"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Culturas em zonas de alto risco = maior necessidade de bioestimulantes
        </p>
      </CardContent>
    </Card>
  );
};