export interface HistoricoItem {
    id: string;
    lancamento_id: string;
    user_id: string;
    meta_id: string;
    quadrimestre: number;
    ano: number;
    resultado_anterior: number | null;
    resultado_novo: number | null;
    justificativa_anterior: string | null;
    justificativa_nova: string | null;
    acao: string;
    alterado_por: string;
    alterado_em: string;
}

export interface Profile {
    user_id: string;
    nome: string;
    email: string;
}

export const acaoColors: Record<string, string> = {
    INSERT: "bg-success/10 text-success border-success/20",
    UPDATE: "bg-primary/10 text-primary border-primary/20",
    DELETE: "bg-destructive/10 text-destructive border-destructive/20",
};

export const acaoLabels: Record<string, string> = {
    INSERT: "Criação",
    UPDATE: "Alteração",
    DELETE: "Exclusão",
};
