import { Card } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PatentYearChartProps {
  data: { year: number; count: number }[];
  onYearClick?: (year: number) => void;
}

export const PatentYearChart = ({ data, onYearClick }: PatentYearChartProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        📊 Depósitos por Ano
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} onClick={(e) => e?.activeLabel && onYearClick?.(parseInt(e.activeLabel))}>
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
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Bar 
            dataKey="count" 
            fill="hsl(var(--chart-3))" 
            radius={[8, 8, 0, 0]}
            cursor="pointer"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
