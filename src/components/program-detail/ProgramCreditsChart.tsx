import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgramCreditComponent } from "@/hooks/useProgramStructure";

interface ProgramCreditsChartProps {
  components: ProgramCreditComponent[];
}

export const ProgramCreditsChart = ({ components }: ProgramCreditsChartProps) => {
  if (!components || components.length === 0) return null;

  const pieData = components.map((c) => ({
    name: c.name,
    value: c.credits,
    color: c.color || "hsl(var(--muted))",
  }));

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Credits Distribution</CardTitle>
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
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} ECTS`, "Credits"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "10px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
