import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCategory } from "@/hooks/useMasterProgramData";

interface MasterCreditsChartProps {
  categories: CreditCategory[];
}

// Color palette for pie chart segments
const COLORS = [
  "hsl(262, 83%, 58%)", // purple/primary
  "hsl(217, 91%, 60%)", // blue
  "hsl(142, 71%, 45%)", // green
  "hsl(38, 92%, 50%)",  // orange
  "hsl(340, 82%, 52%)", // pink
  "hsl(190, 90%, 50%)", // cyan
  "hsl(280, 65%, 60%)", // violet
  "hsl(160, 60%, 45%)", // teal
];

export const MasterCreditsChart = ({ categories }: MasterCreditsChartProps) => {
  if (!categories || categories.length === 0) return null;

  const pieData = categories.map((c, idx) => ({
    name: c.category_name,
    value: c.credits,
    color: COLORS[idx % COLORS.length],
  }));

  const totalCredits = categories.reduce((sum, c) => sum + c.credits, 0);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Credits Distribution</span>
          <span className="text-sm font-normal text-muted-foreground">
            Total: {totalCredits} ECTS
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => 
                  percent > 0.08 ? `${value}` : ""
                }
                outerRadius={100}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} ECTS (${Math.round((value / totalCredits) * 100)}%)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "10px",
                }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom"
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
