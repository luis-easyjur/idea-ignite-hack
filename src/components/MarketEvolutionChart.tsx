import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const data = [
  { year: "2020", value: 1.8, growth: 8.5 },
  { year: "2021", value: 2.0, growth: 11.1 },
  { year: "2022", value: 2.3, growth: 15.0 },
  { year: "2023", value: 2.6, growth: 13.0 },
  { year: "2024", value: 3.0, growth: 15.4 },
];

const chartConfig = {
  value: {
    label: "Mercado (R$ Bilhões)",
    color: "hsl(var(--chart-1))",
  },
  growth: {
    label: "Crescimento (%)",
    color: "hsl(var(--chart-2))",
  },
};

export const MarketEvolutionChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do Mercado</CardTitle>
        <CardDescription>
          Crescimento de especialidades agrícolas nos últimos 5 anos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="year" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="growth"
                stroke="var(--color-growth)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
