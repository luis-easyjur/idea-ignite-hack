import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useZARCMunicipiosPorUF } from "@/hooks/useZARCData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Color scale from light green to dark green
const getColorByCount = (count: number, max: number) => {
  const intensity = count / max;
  const hue = 142; // Green hue
  const saturation = 40 + intensity * 30; // 40-70%
  const lightness = 80 - intensity * 50; // 80-30%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const ZARCBrazilMap = () => {
  const { data, isLoading, error } = useZARCMunicipiosPorUF();

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
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.map((item) => ({
    uf: item.key,
    municipios: item.doc_count,
  })) || [];

  const maxCount = Math.max(...chartData.map((d) => d.municipios));
  const total = chartData.reduce((sum, d) => sum + d.municipios, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Potencial Agrícola por Estado</span>
          <span className="text-sm font-normal text-muted-foreground">
            {total.toLocaleString()} municípios mapeados
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="uf"
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [
                `${value.toLocaleString()} municípios (${((value / total) * 100).toFixed(1)}%)`,
                'Cobertura',
              ]}
            />
            <Bar dataKey="municipios" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColorByCount(entry.municipios, maxCount)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          MG e SP concentram a maior cobertura de zoneamento agrícola
        </p>
      </CardContent>
    </Card>
  );
};