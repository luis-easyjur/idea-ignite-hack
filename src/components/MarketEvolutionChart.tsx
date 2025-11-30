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
  return;
};