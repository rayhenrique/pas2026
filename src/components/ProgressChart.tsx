import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePasData } from '@/hooks/usePasData';

interface Lancamento {
  id: string;
  meta_id: string;
  quadrimestre: number;
  ano: number;
  resultado: number | null;
}

interface ProgressChartProps {
  lancamentos?: Lancamento[];
}

const COLORS = ['hsl(211, 100%, 35%)', 'hsl(44, 87%, 62%)'];

export function ProgressChart({ lancamentos = [] }: ProgressChartProps) {
  const { eixos } = usePasData();

  // Helper para obter resultado do banco (sem fallback para dados estáticos)
  const getResultado = (metaId: string, quad: number) => {
    const lancamento = lancamentos.find(
      l => l.meta_id === metaId && l.quadrimestre === quad
    );
    return lancamento?.resultado ?? null;
  };

  const data = eixos.map(eixo => {
    let metasAtingidas = 0;
    let totalMetas = 0;
    
    eixo.diretrizes.forEach(diretriz => {
      diretriz.metas.forEach(meta => {
        totalMetas++;
        // Usa apenas dados do banco
        const resultado2 = getResultado(meta.id, 2);
        const resultado1 = getResultado(meta.id, 1);
        const resultado = resultado2 ?? resultado1;
        
        if (resultado !== null && resultado !== undefined) {
          const metaStr = (meta as any).meta_plano_2025 || (meta as any).metaPlano2026 || '0';
          const metaValue = parseFloat(String(metaStr).replace('%', '').replace(',', '.'));
          if (resultado >= metaValue) {
            metasAtingidas++;
          }
        }
      });
    });

    return {
      name: `Eixo ${eixo.numero}`,
      atingidas: metasAtingidas,
      pendentes: totalMetas - metasAtingidas,
      total: totalMetas,
      percentual: totalMetas > 0 ? Math.round((metasAtingidas / totalMetas) * 100) : 0,
    };
  });

  return (
    <div className="card-elevated p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Progresso por Eixo</h3>
        <p className="text-sm text-muted-foreground">Acompanhamento das metas atingidas por eixo estratégico</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              width={60}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number, name: string) => [value, name === 'atingidas' ? 'Metas Atingidas' : 'Metas Pendentes']}
            />
            <Bar dataKey="atingidas" stackId="a" fill={COLORS[0]} radius={[0, 4, 4, 0]} name="Atingidas" />
            <Bar dataKey="pendentes" stackId="a" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} name="Pendentes" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Metas Atingidas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted" />
          <span className="text-sm text-muted-foreground">Metas Pendentes</span>
        </div>
      </div>
    </div>
  );
}
