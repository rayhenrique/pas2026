import { z } from "zod";

export type FormType = "eixo" | "diretriz" | "meta" | "acao";
export type FormMode = "create" | "edit";

// Schemas de validação
export const baseSchema = z.object({
    numero: z.string().trim().min(1, "Número é obrigatório").refine(
        (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
        "Número deve ser maior que zero"
    ),
});

export const eixoSchema = baseSchema.extend({
    nome: z.string().trim().min(1, "Nome é obrigatório").max(200, "Nome deve ter no máximo 200 caracteres"),
});

export const diretrizSchema = baseSchema.extend({
    nome: z.string().trim().min(1, "Nome é obrigatório").max(300, "Nome deve ter no máximo 300 caracteres"),
});

export const metaSchema = baseSchema.extend({
    descricao: z.string().trim().min(1, "Descrição é obrigatória").max(500, "Descrição deve ter no máximo 500 caracteres"),
    indicador: z.string().trim().min(1, "Indicador é obrigatório").max(200, "Indicador deve ter no máximo 200 caracteres"),
    metaPlano2026: z.string().trim().min(1, "Meta 2026 é obrigatória").max(50, "Meta deve ter no máximo 50 caracteres"),
    unidadeMedida: z.string().trim().min(1, "Unidade é obrigatória").max(50, "Unidade deve ter no máximo 50 caracteres"),
});

export const acaoSchema = baseSchema.extend({
    descricao: z.string().trim().min(1, "Descrição é obrigatória").max(500, "Descrição deve ter no máximo 500 caracteres"),
});

export interface FormData {
    id?: string;
    parentId?: string;
    numero: string;
    nome: string;
    descricao?: string;
    indicador?: string;
    metaPlano2026?: string;
    unidadeMedida?: string;
}

export interface FormErrors {
    numero?: string;
    nome?: string;
    descricao?: string;
    indicador?: string;
    metaPlano2026?: string;
    unidadeMedida?: string;
}

export const initialFormData: FormData = {
    numero: "",
    nome: "",
    descricao: "",
    indicador: "",
    metaPlano2026: "",
    unidadeMedida: "%",
};

// Função para escolher schema por tipo
export function getSchemaByType(type: FormType) {
    switch (type) {
        case "eixo":
            return eixoSchema;
        case "diretriz":
            return diretrizSchema;
        case "meta":
            return metaSchema;
        case "acao":
            return acaoSchema;
    }
}

export function getFormTitle(mode: FormMode, type: FormType) {
    const action = mode === "create" ? "Novo" : "Editar";
    const labels = { eixo: "Eixo", diretriz: "Diretriz", meta: "Meta", acao: "Ação" };
    return `${action} ${labels[type]}`;
}
