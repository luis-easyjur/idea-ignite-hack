import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useZARCCulturasPorUF } from "@/hooks/useZARCData";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  'hsl(142, 50%, 40%)', // Green
  'hsl(200, 60%, 45%)', // Blue
  'hsl(45, 80%, 50%)',  // Yellow
  'hsl(280, 50%, 50%)', // Purple
  'hsl(10, 70%, 55%)',  // Red-orange
  'hsl(175, 50%, 45%)', // Teal
  'hsl(320, 50%, 50%)', // Pink
  'hsl(60, 60%, 45%)',  // Olive
  'hsl(220, 50%, 55%)', // Blue-gray
  'hsl(30, 70%, 50%)',  // Orange
];

export const ZARCMinasGeraisChart = () => {
  const { data, isLoading, error } = useZARCCulturasPorUF('MG');

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/30">
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar dados de MG</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/30">
        <CardHeader>
          <CardTitle>Perfil Agronômico de Minas Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Top 10 + Others
  const top10 = data?.slice(0, 10) || [];
  const othersCount = data?.slice(10).reduce((sum, item) => sum + item.doc_count, 0) || 0;
  const total = data?.reduce((sum, item) => sum + item.doc_count, 0) || 0;

  const chartData = [
    ...top10.map((item) => ({
      name: item.key,
      value: item.doc_count,
      percentage: ((item.doc_count / total) * 100).toFixed(1),
    })),
    ...(othersCount > 0
      ? [{ name: 'Outras', value: othersCount, percentage: ((othersCount / total) * 100).toFixed(1) }]
      : []),
  ];

  return (
    <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Perfil Agronômico de Minas Gerais
              <Badge variant="outline" className="ml-2">Nossa Base Operacional</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {total.toLocaleString()} registros de zoneamento em {data?.length || 0} culturas
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="w-full lg:w-1/2">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percentage }) => `${percentage}%`}
                  labelLine={false}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString()} registros (${((value / total) * 100).toFixed(1)}%)`,
                    name,
                  ]}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full lg:w-1/2 space-y-3">
            <h4 className="font-semibold text-sm">Insights para Estratégia de Produtos</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">•</span>
                MG é nosso estado-base com maior cobertura de zoneamento
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                Culturas no topo indicam maior demanda por insumos
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 font-bold">•</span>
                Culturas sub-representadas podem ser oportunidades de nicho
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">•</span>
                Priorizar P&D de bioestimulantes para culturas líderes
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};