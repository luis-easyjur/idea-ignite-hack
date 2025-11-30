import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sprout, Building2, Bug, Leaf, Beaker, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
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

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const ProductsIntelligenceSection = () => {
  const { data, isLoading, error } = useElasticProductStats();
  const [companiesPage, setCompaniesPage] = useState(1);
  const [chemicalGroupsPage, setChemicalGroupsPage] = useState(1);
  const companiesPerPage = 5;
  const chemicalGroupsPerPage = 5;

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
            Processando {data.totals.total.toLocaleString()} de {data.totals.totalAvailable.toLocaleString()} produtos disponíveis
          </p>
          {data.totals.other > 0 && (
            <Badge variant="outline" className="mt-1">
              {data.totals.other} produtos não categorizados
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Culturas e Pragas */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Top Cultures Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Quantidade de produtos por cultura</CardTitle>
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
                <Bar dataKey="count" fill="hsl(var(--chart-5))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rankings - Concorrentes e Grupos Químicos */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top Concorrentes Detentores</span>
              <Badge variant="outline">{data.companies.length} empresas</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                const totalCompanies = data.companies.length;
                const totalPages = Math.ceil(totalCompanies / companiesPerPage);
                const startIndex = (companiesPage - 1) * companiesPerPage;
                const endIndex = startIndex + companiesPerPage;
                const paginatedCompanies = data.companies.slice(startIndex, endIndex);
                
                return (
                  <>
                    {paginatedCompanies.map((company, index) => (
                      <div key={company.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {startIndex + index + 1}
                          </Badge>
                          <span className="text-sm font-medium truncate max-w-[200px]">
                            {company.name}
                          </span>
                        </div>
                        <Badge variant="secondary">{company.count}</Badge>
                      </div>
                    ))}
                    
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        Página {companiesPage} de {totalPages}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCompaniesPage(p => Math.max(1, p - 1))}
                          disabled={companiesPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Anterior
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCompaniesPage(p => Math.min(totalPages, p + 1))}
                          disabled={companiesPage === totalPages}
                        >
                          Próximo
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Top Chemical Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Grupos Químicos</span>
              <Badge variant="outline">{data.chemicalGroups.length} grupos</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                const totalGroups = data.chemicalGroups.length;
                const totalPages = Math.ceil(totalGroups / chemicalGroupsPerPage);
                const startIndex = (chemicalGroupsPage - 1) * chemicalGroupsPerPage;
                const endIndex = startIndex + chemicalGroupsPerPage;
                const paginatedGroups = data.chemicalGroups.slice(startIndex, endIndex);
                
                return (
                  <>
                    {paginatedGroups.map((group, index) => (
                      <div key={group.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {startIndex + index + 1}
                          </Badge>
                          <span className="text-sm font-medium truncate max-w-[200px]">
                            {group.name}
                          </span>
                        </div>
                        <Badge variant="secondary">{group.count}</Badge>
                      </div>
                    ))}
                    
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        Página {chemicalGroupsPage} de {totalPages}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setChemicalGroupsPage(p => Math.max(1, p - 1))}
                          disabled={chemicalGroupsPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Anterior
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setChemicalGroupsPage(p => Math.min(totalPages, p + 1))}
                          disabled={chemicalGroupsPage === totalPages}
                        >
                          Próximo
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ingredientes e Formulações */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Top Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-primary" />
              Top Ingredientes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.ingredients.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="fill-muted-foreground" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  fontSize={10}
                  className="fill-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Formulation Types */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Formulação</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.formulations.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="fill-muted-foreground" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={180}
                  fontSize={10}
                  className="fill-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Toxicidade e Categorias */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Toxicity Classification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-orange-500" />
              Classificação Toxicológica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.toxicityLevels}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.toxicityLevels.map((_, index) => (
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

        {/* Categories Distribution */}
        {data.categories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.categories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="fill-muted-foreground" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150}
                    fontSize={11}
                    className="fill-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--chart-4))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};