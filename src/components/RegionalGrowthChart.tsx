import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const data = [
  { region: "Sul", growth: 18.2, market: 0.85 },
  { region: "Sudeste", growth: 15.7, market: 1.05 },
  { region: "Centro-Oeste", growth: 22.4, market: 0.68 },
  { region: "Nordeste", growth: 23.1, market: 0.32 },
  { region: "Norte", growth: 19.5, market: 0.10 },
];

const chartConfig = {
  growth: {
    label: "Crescimento (%)",
    color: "hsl(var(--chart-3))",
  },
  market: {
    label: "Mercado (R$ Bilhões)",
    color: "hsl(var(--chart-4))",
  },
};

export const RegionalGrowthChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crescimento Regional</CardTitle>
        <CardDescription>
          Performance por região em 2024
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="region" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="growth" 
                fill="var(--color-growth)" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="market" 
                fill="var(--color-market)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
