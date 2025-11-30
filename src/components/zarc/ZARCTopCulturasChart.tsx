import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useZARCTopCulturas } from "@/hooks/useZARCData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const ZARCTopCulturasChart = () => {
  const { data, isLoading, error } = useZARCTopCulturas();

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar culturas</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 15 Culturas por Abrangência</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.map((item) => ({
    cultura: item.key,
    abrangencia: item.doc_count,
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 15 Culturas por Abrangência</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
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
              formatter={(value: number) => [`${value.toLocaleString()} registros`, 'Abrangência']}
            />
            <Bar
              dataKey="abrangencia"
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Culturas com maior cobertura = maior mercado endereçável
        </p>
      </CardContent>
    </Card>
  );
};