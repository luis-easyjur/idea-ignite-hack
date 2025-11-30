import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { fetchProductLaunches, type ElasticsearchHit } from "@/lib/elasticsearch";
import { Skeleton } from "./ui/skeleton";
import { Loader2 } from "lucide-react";

interface ChartDataPoint {
  month: string;
  [key: string]: string | number; // Empresas como chaves dinâmicas
}

// Função para processar os dados do Elasticsearch
function processElasticsearchData(hits: ElasticsearchHit[]): ChartDataPoint[] {
  // Criar um mapa para armazenar contagens por empresa e mês
  const dataMap = new Map<string, Map<string, number>>();
  
  // Gerar todos os meses de 2020 a 2025
  const months: string[] = [];
  for (let year = 2020; year <= 2025; year++) {
    for (let month = 1; month <= 12; month++) {
      months.push(`${year}-${String(month).padStart(2, '0')}`);
    }
  }

  // Inicializar o mapa com todos os meses
  months.forEach(month => {
    dataMap.set(month, new Map<string, number>());
  });

  // Processar cada hit do Elasticsearch
  hits.forEach((hit) => {
    try {
      const rawContent = hit._source?.raw_content;
      if (!rawContent) return;

      const empresa = rawContent.titular_registro;
      if (!empresa) return;

      const documentos = rawContent.documento_cadastrado || [];
      if (!Array.isArray(documentos)) return;

      documentos.forEach((doc) => {
        if (!doc?.data_inclusao) return;

        try {
          // Parse da data no formato "05/05/2025 15:44:10"
          const dateStr = doc.data_inclusao.split(' ')[0];
          const dateParts = dateStr.split('/');
          
          if (dateParts.length === 3) {
            const [, month, year] = dateParts;
            const monthKey = `${year}-${month}`;

            // Verificar se o mês está no range 2020-2025
            if (dataMap.has(monthKey)) {
              const monthData = dataMap.get(monthKey)!;
              const currentCount = monthData.get(empresa) || 0;
              monthData.set(empresa, currentCount + 1);
            }
          }
        } catch (err) {
          // Silenciosamente ignora erros de parsing de data
        }
      });
    } catch (err) {
      // Silenciosamente ignora erros de processamento de hits individuais
    }
  });

  // Converter o mapa em array de objetos para o gráfico
  const chartData: ChartDataPoint[] = months.map(month => {
    const monthData = dataMap.get(month)!;
    const dataPoint: ChartDataPoint = {
      month: month.replace(/-/, '/'), // Formato: "2020/01"
    };

    // Adicionar contagem de cada empresa
    monthData.forEach((count, empresa) => {
      dataPoint[empresa] = count;
    });

    return dataPoint;
  });

  return chartData;
}

// Função para obter todas as empresas únicas
function getUniqueCompanies(hits: ElasticsearchHit[]): string[] {
  const companies = new Set<string>();
  hits.forEach(hit => {
    const empresa = hit._source.raw_content.titular_registro;
    if (empresa) {
      companies.add(empresa);
    }
  });
  return Array.from(companies).sort();
}

// Cores para as linhas (usar cores do tema)
const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
];

export const ProductLaunchChart = () => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchProductLaunches();
        const hits = response.hits.hits;
        
        if (hits.length === 0) {
          setData([]);
          setCompanies([]);
          return;
        }
        
        const processedData = processElasticsearchData(hits);
        const uniqueCompanies = getUniqueCompanies(hits);
        
        setData(processedData);
        setCompanies(uniqueCompanies);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Criar configuração dinâmica do gráfico baseada nas empresas
  const chartConfig = companies.reduce((acc, company, index) => {
    acc[company] = {
      label: company,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  // Formatar o mês para exibição (ex: "2020/01" -> "Jan/2020")
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('/');
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthIndex = parseInt(monthNum) - 1;
    return `${monthNames[monthIndex]}/${year}`;
  };

  // Filtrar meses para mostrar apenas um por trimestre para melhor legibilidade
  const filteredData = data.filter((_, index) => index % 3 === 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lançamentos de Produtos por Empresa</CardTitle>
          <CardDescription>
            Quantidade de produtos lançados por mês (2020-2025)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Carregando dados do Elasticsearch...
            </p>
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lançamentos de Produtos por Empresa</CardTitle>
          <CardDescription>
            Quantidade de produtos lançados por mês (2020-2025)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive p-4">
            Erro ao carregar dados: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0 || companies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lançamentos de Produtos por Empresa</CardTitle>
          <CardDescription>
            Quantidade de produtos lançados por mês de 2020 a 2025
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
            <p className="text-sm text-muted-foreground">
              Nenhum dado encontrado para o período selecionado.
            </p>
            <p className="text-xs text-muted-foreground">
              Verifique se há dados no Elasticsearch para as fontes "agrofit" e "bioinsumos".
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lançamentos de Produtos por Empresa</CardTitle>
        <CardDescription>
          Quantidade de produtos lançados por mês de 2020 a 2025
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
                tickFormatter={formatMonth}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Quantidade de Produtos', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [value, 'Produtos']}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              {companies.slice(0, 10).map((company, index) => (
                <Line
                  key={company}
                  type="monotone"
                  dataKey={company}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name={company.length > 30 ? company.substring(0, 30) + '...' : company}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        {companies.length > 10 && (
          <p className="text-xs text-muted-foreground mt-2">
            Mostrando as 10 primeiras empresas. Total: {companies.length} empresas
          </p>
        )}
      </CardContent>
    </Card>
  );
};

