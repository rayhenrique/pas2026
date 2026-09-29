import { AcaoStatusAnual, AvaliacaoAnual, PasDiretriz, PasMeta, SelectedYear } from "@/types/pas";
import { flattenMetas, getMetaStatus, getMetaTarget, parseNumericValue } from "@/utils/pasHelpers";

export function getMetaValue(meta: PasMeta, year: SelectedYear): number {
  return parseNumericValue(getMetaTarget(meta, year));
}

export function isMetaAtingida(meta: PasMeta, year: SelectedYear, avaliacao?: AvaliacaoAnual | null): boolean {
  if (!avaliacao || avaliacao.valor_realizado === null || avaliacao.valor_realizado === undefined) {
    return false;
  }

  const targetValue = getMetaValue(meta, year);
  return avaliacao.valor_realizado >= targetValue;
}

export function calculateTotalMetas(diretrizes: PasDiretriz[]): number {
  return flattenMetas(diretrizes).length;
}

export function calculateMetasAtingidas(
  diretrizes: PasDiretriz[],
  year: SelectedYear,
  getAvaliacao: (metaId: string) => AvaliacaoAnual | null,
): number {
  return flattenMetas(diretrizes).filter((meta) => isMetaAtingida(meta, year, getAvaliacao(meta.id))).length;
}

export function calculateStatusCounts(
  diretrizes: PasDiretriz[],
  getAvaliacao: (metaId: string) => AvaliacaoAnual | null,
) {
  return flattenMetas(diretrizes).reduce(
    (acc, meta) => {
      const avaliacao = getAvaliacao(meta.id);
      const status = avaliacao?.valor_realizado !== null && avaliacao?.valor_realizado !== undefined
        ? getMetaStatus(meta, avaliacao.valor_realizado)
        : getMetaStatus(meta, null);

      acc[status] += 1;
      return acc;
    },
    {
      otimo: 0,
      bom: 0,
      suficiente: 0,
      regular: 0,
      nao_alcancado: 0,
      nao_avaliado: 0,
      sem_criterio: 0,
    },
  );
}

export function calculateAcoesStats(diretrizes: PasDiretriz[], acoesStatus: AcaoStatusAnual[]) {
  const statusMap = new Map(acoesStatus.map((acao) => [acao.acao_id, acao.concluida]));

  let total = 0;
  let completed = 0;

  flattenMetas(diretrizes).forEach((meta) => {
    meta.acoes.forEach((acao) => {
      total += 1;
      if (statusMap.get(acao.id)) {
        completed += 1;
      }
    });
  });

  return {
    total,
    completed,
    pending: Math.max(total - completed, 0),
  };
}
