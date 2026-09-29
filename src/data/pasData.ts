import { pasDataSeed } from "./pasDataSeed";
import { pasMetaDetails } from "./pasMetaDetails";
import { PasAcao, PasDiretriz, PasMeta, PasObjetivo, SelectedYear } from "@/types/pas";
import { createStableKey, extractIndicatorAndCriteria, getMetaStatus, getMetaTarget } from "@/utils/pasHelpers";

export type Acao = PasAcao;
export type Meta = PasMeta;
export type Objetivo = PasObjetivo;
export type Diretriz = PasDiretriz;

function buildMeta(meta: (typeof pasDataSeed)[number]["diretrizes"][number]["metas"][number], objetivoId: string): Meta {
  const detailKey = createStableKey(`${meta.codigo}-${meta.descricao}`);
  const details = pasMetaDetails[detailKey];
  const extracted = extractIndicatorAndCriteria(meta.indicador);

  const indicador = details?.indicador || extracted.indicador || meta.indicador;
  const criteriosAvaliacao = details?.criteriosAvaliacao || extracted.criteriosAvaliacao;
  const meta2026 = details?.meta2026 || meta.metaPlano2026;
  const meta2027 = details?.meta2027 || meta2026;
  const meta2028 = details?.meta2028 || meta2027;
  const meta2029 = details?.meta2029 || meta2028;
  const metaPlano20262029 = details?.metaPlano20262029 || meta2029;
  const metaPas2026 = details?.metaPas2026 || meta2026;
  const unidadeMedida = details?.unidadeMedida || meta.unidadeMedida;
  const responsavel = details?.responsavel || "Secretaria Municipal de Saúde";

  return {
    id: `meta-${detailKey}`,
    objetivo_id: objetivoId,
    numero: meta.numero,
    descricao: meta.descricao,
    indicador,
    criterios_avaliacao: criteriosAvaliacao,
    meta_2026: meta2026,
    meta_2027: meta2027,
    meta_2028: meta2028,
    meta_2029: meta2029,
    meta_plano_2026_2029: metaPlano20262029,
    meta_pas_2026: metaPas2026,
    unidade_medida: unidadeMedida,
    responsavel,
    acoes: meta.acoes.map((acao, index) => ({
      id: `acao-${detailKey}-${index + 1}`,
      meta_id: `meta-${detailKey}`,
      numero: index + 1,
      descricao: acao,
    })),
  };
}

export const pasData: Diretriz[] = pasDataSeed.map((diretriz) => {
  const diretrizId = `diretriz-${diretriz.numero}`;

  return {
    id: diretrizId,
    numero: diretriz.numero,
    nome: diretriz.nome,
    objetivos: diretriz.diretrizes.map((objetivo) => {
      const objetivoId = `objetivo-${createStableKey(`${diretriz.numero}-${objetivo.codigo}`)}`;

      return {
        id: objetivoId,
        diretriz_id: diretrizId,
        numero: objetivo.numero,
        nome: objetivo.nome,
        descricao: objetivo.objetivo,
        metas: objetivo.metas.map((meta) => buildMeta(meta, objetivoId)),
      };
    }),
  };
});

export function getTotalMetas(): number {
  return pasData.reduce(
    (total, diretriz) => total + diretriz.objetivos.reduce((subtotal, objetivo) => subtotal + objetivo.metas.length, 0),
    0,
  );
}

export function getMetasAtingidas(year: SelectedYear): number {
  return pasData.reduce(
    (total, diretriz) =>
      total +
      diretriz.objetivos.reduce(
        (subtotal, objetivo) =>
          subtotal +
          objetivo.metas.filter((meta) => {
            const target = Number.parseFloat(getMetaTarget(meta, year).replace("%", "").replace(",", "."));
            return ["otimo", "bom", "suficiente", "regular"].includes(getMetaStatus(meta, target));
          }).length,
        0,
      ),
    0,
  );
}

export function getAcoesTotal(): number {
  return pasData.reduce(
    (total, diretriz) =>
      total + diretriz.objetivos.reduce((subtotal, objetivo) => subtotal + objetivo.metas.reduce((metaTotal, meta) => metaTotal + meta.acoes.length, 0), 0),
    0,
  );
}
