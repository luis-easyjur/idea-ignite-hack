import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useZARCTopObtentores } from "@/hooks/useZARCData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const ZARCObtentoresChart = () => {
  const { data, isLoading, error } = useZARCTopObtentores();

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar obtentores</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Obtentores de Cultivares</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.map((item) => ({
    // Truncate long names
    obtentor: item.key.length > 25 ? item.key.substring(0, 22) + '...' : item.key,
    fullName: item.key,
    cultivares: item.doc_count,
  })) || [];

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Top Obtentores de Cultivares
            <Badge variant="outline">Empresas Desenvolvedoras</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Dados de obtentores não disponíveis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Top Obtentores de Cultivares
          <Badge variant="outline">Empresas Desenvolvedoras</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="obtentor"
              tick={{ fontSize: 9 }}
              angle={-45}
              textAnchor="end"
              height={80}
              className="fill-muted-foreground"
            />
            <YAxis className="fill-muted-foreground" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, _, props) => [
                `${value.toLocaleString()} cultivares`,
                props.payload.fullName,
              ]}
            />
            <Bar
              dataKey="cultivares"
              fill="hsl(280, 50%, 50%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Potenciais parceiros para testes de bioestimulantes
        </p>
      </CardContent>
    </Card>
  );
};