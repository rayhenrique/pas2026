import { Meta, Eixo } from "../data/pasData";

/**
 * Normalizes the meta value string to a number.
 * Removes '%' and converts comma to dot.
 */
export function getMetaValue(meta: Meta, year: number = 2026): number {
    // Logic to choose the correct meta field based on year
    // If year is 2025, try meta_plano_2025, otherwise fallback to metaPlano2026
    let metaStr = meta.metaPlano2026;

    if (year === 2025 && meta.meta_plano_2025) {
        metaStr = meta.meta_plano_2025;
    }

    // Default fallback if somehow both are missing/empty handled by parsing '0'
    if (!metaStr) metaStr = '0';

    return parseFloat(String(metaStr).replace('%', '').replace(',', '.'));
}

/**
 * Helper to check if a single meta is achieved based on results.
 */
export function isMetaAtingida(meta: Meta, year: number, getResultadoFn?: (metaId: string, quad: number) => number | null | undefined): boolean {
    // Determine the result to compare against
    // Priority: Database result (via getResultadoFn) -> Local static data (resultado2QDM -> resultado1QDM)

    let resultado: number | null | undefined;

    if (getResultadoFn) {
        const r2 = getResultadoFn(meta.id, 2);
        const r1 = getResultadoFn(meta.id, 1);
        resultado = r2 ?? r1;
    }

    // Fallback to static data if no DB result or fn provided
    if (resultado === null || resultado === undefined) {
        resultado = meta.resultado2QDM ?? meta.resultado1QDM;
    }

    if (resultado === null || resultado === undefined) {
        return false;
    }

    const targetValue = getMetaValue(meta, year);
    return resultado >= targetValue;
}

/**
 * Calculates total targets (metas) in the dataset.
 */
export function calculateTotalMetas(dadosPas: Eixo[]): number {
    return dadosPas.reduce((total, eixo) =>
        total + eixo.diretrizes.reduce((subtotal, diretriz) =>
            subtotal + diretriz.metas.length, 0), 0);
}

/**
 * Calculates the number of achieved targets.
 */
export function calculateMetasAtingidas(dadosPas: Eixo[], year: number, getResultadoFn?: (metaId: string, quad: number) => number | null | undefined): number {
    return dadosPas.reduce((count, eixo) => {
        return count + eixo.diretrizes.reduce((subcount, diretriz) => {
            return subcount + diretriz.metas.filter(meta => isMetaAtingida(meta, year, getResultadoFn)).length;
        }, 0);
    }, 0);
}

/**
 * Calculates action statistics (completed vs total).
 */
export function calculateAcoesStats(dadosPas: Eixo[], acoesStatus: { id: string; concluida: boolean }[]) {
    // Build a set of completed action IDs for faster lookup if needed, 
    // or just use the list length if it represents all completed actions from DB.
    // The original code filtered acoesStatus for 'concluida'.

    const completedFromDb = new Set(acoesStatus.filter(a => a.concluida).map(a => a.id));

    let total = 0;
    let completed = 0;

    dadosPas.forEach(eixo => {
        eixo.diretrizes.forEach(diretriz => {
            diretriz.metas.forEach(meta => {
                meta.acoes.forEach(acao => {
                    total++;
                    // Check if completed in DB Override OR in static definition
                    if (completedFromDb.has(acao.id) || acao.concluida) {
                        completed++;
                    }
                });
            });
        });
    });

    return {
        total,
        completed,
        pending: total - completed
    };
}
