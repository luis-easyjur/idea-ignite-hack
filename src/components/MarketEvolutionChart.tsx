import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
const data = [{
  year: "2020",
  value: 1.8,
  growth: 8.5
}, {
  year: "2021",
  value: 2.0,
  growth: 11.1
}, {
  year: "2022",
  value: 2.3,
  growth: 15.0
}, {
  year: "2023",
  value: 2.6,
  growth: 13.0
}, {
  year: "2024",
  value: 3.0,
  growth: 15.4
}];
const chartConfig = {
  value: {
    label: "Mercado (R$ Bilhões)",
    color: "hsl(var(--chart-1))"
  },
  growth: {
    label: "Crescimento (%)",
    color: "hsl(var(--chart-2))"
  }
};
export const MarketEvolutionChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do Mercado</CardTitle>
        <CardDescription>Crescimento de mercado de bioinsumos (2020-2024)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="growth"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};