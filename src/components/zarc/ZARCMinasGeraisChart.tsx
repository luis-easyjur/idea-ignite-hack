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
import { ZARCMinasGeraisMap } from "./ZARCMinasGeraisMap";

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mapa detalhado de MG por município */}
          <div className="lg:col-span-1">
            <ZARCMinasGeraisMap className="h-full" />
          </div>

          {/* Coluna direita: Gráfico + Insights */}
          <div className="lg:col-span-1 space-y-4">
            {/* Gráfico de Pizza */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Distribuição por Cultura</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ percentage }) => `${percentage}%`}
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
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2">
                {chartData.slice(0, 6).map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 culturas + Insights */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div>
                <h5 className="text-xs font-semibold mb-2">Top 5 Culturas</h5>
                <div className="space-y-1">
                  {chartData.slice(0, 5).map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{index + 1}.</span>
                        <span className="truncate max-w-[80px]">{item.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {item.percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-xs font-semibold mb-2">Insights</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-start gap-1">
                    <span className="text-green-500">•</span>
                    Base operacional
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-blue-500">•</span>
                    Maior cobertura ZARC
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-yellow-500">•</span>
                    Oportunidades nicho
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-purple-500">•</span>
                    Foco em P&D
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};