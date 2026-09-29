import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ProgressChartDatum {
  name: string;
  avaliadas: number;
  pendentes: number;
  total: number;
}

interface ProgressChartProps {
  data: ProgressChartDatum[];
  selectedYear: number;
}

export function ProgressChart({ data, selectedYear }: ProgressChartProps) {
  return (
    <div className="card-elevated p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Progresso por Diretriz</h3>
        <p className="text-sm text-muted-foreground">
          Metas avaliadas e pendentes no ano de referência {selectedYear}
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
              }}
              formatter={(value: number, label: string) => [
                value,
                label === "avaliadas" ? "Metas avaliadas" : "Metas pendentes",
              ]}
            />
            <Bar dataKey="avaliadas" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            <Bar dataKey="pendentes" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
