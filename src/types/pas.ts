export const YEAR_OPTIONS = [2026, 2027, 2028, 2029] as const;

export type SelectedYear = (typeof YEAR_OPTIONS)[number];

export type StatusAtingimento =
  | "otimo"
  | "bom"
  | "suficiente"
  | "regular"
  | "nao_alcancado"
  | "nao_avaliado"
  | "sem_criterio";

export interface PasAcao {
  id: string;
  meta_id: string;
  numero: number;
  descricao: string;
}

export interface PasMeta {
  id: string;
  objetivo_id: string;
  numero: number;
  descricao: string;
  indicador: string;
  criterios_avaliacao: string;
  meta_2026: string;
  meta_2027: string;
  meta_2028: string;
  meta_2029: string;
  meta_plano_2026_2029: string;
  meta_pas_2026: string;
  unidade_medida: string;
  responsavel: string;
  acoes: PasAcao[];
}

export interface PasObjetivo {
  id: string;
  diretriz_id: string;
  numero: number;
  nome: string;
  descricao: string;
  metas: PasMeta[];
}

export interface PasDiretriz {
  id: string;
  numero: number;
  nome: string;
  objetivos: PasObjetivo[];
}

export interface ResponsavelSector {
  id: string;
  nome: string;
  nome_normalizado: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvaliacaoAnual {
  id: string;
  meta_id: string;
  ano_referencia: SelectedYear;
  valor_realizado: number | null;
  analise_qualitativa: string | null;
  status_atingimento: StatusAtingimento;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AcaoStatusAnual {
  id: string;
  acao_id: string;
  meta_id: string;
  ano_referencia: SelectedYear;
  concluida: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}
