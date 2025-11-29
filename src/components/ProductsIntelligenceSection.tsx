import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sprout, Building2, Bug, Leaf } from "lucide-react";
import { useElasticProductStats } from "@/hooks/useElasticProductStats";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const ProductsIntelligenceSection = () => {
  const { data, isLoading, error } = useElasticProductStats();

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Não foi possível conectar ao Elasticsearch. Verifique as credenciais.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inteligência de Produtos Agrícolas</h2>
          <p className="text-muted-foreground">
            Dados do Agrofit e Bioinsumos via Elasticsearch
          </p>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sprout className="h-4 w-4 text-primary" />
              Defensivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totals.agrofit.toLocaleString()}</div>
            <Badge variant="secondary" className="mt-1">Agrofit</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-500" />
              Bioinsumos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totals.bioinsumos.toLocaleString()}</div>
            <Badge variant="secondary" className="mt-1">Registrados</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              Empresas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totals.companies}</div>
            <Badge variant="secondary" className="mt-1">Detentoras</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bug className="h-4 w-4 text-orange-500" />
              Culturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totals.cultures}</div>
            <Badge variant="secondary" className="mt-1">Cobertas</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cultures Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos por Cultura</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.cultures.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                  className="fill-muted-foreground"
                />
                <YAxis className="fill-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Top Empresas Detentoras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.companies.slice(0, 8).map((company, index) => (
                <div key={company.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {company.name}
                    </span>
                  </div>
                  <Badge variant="secondary">{company.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Source Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Agrofit vs Bioinsumos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.sourceComparison}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.sourceComparison.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Pests */}
        <Card>
          <CardHeader>
            <CardTitle>Pragas Mais Combatidas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.pests.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="fill-muted-foreground" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120}
                  fontSize={11}
                  className="fill-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Categories Distribution */}
      {data.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categorias de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.categories.map((category) => (
                <div key={category.name} className="p-4 border rounded-lg">
                  <div className="text-sm font-medium mb-1">{category.name}</div>
                  <div className="text-2xl font-bold text-primary">{category.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
