import { describe, expect, it } from "vitest";
import { getMetaStatus, getMetaTarget, resolveStatusByCriteria } from "../pasHelpers";
import { PasMeta } from "@/types/pas";

const metaMock: PasMeta = {
  id: "meta-1",
  objetivo_id: "obj-1",
  numero: 1,
  descricao: "Meta de teste",
  indicador: "Indicador",
  criterios_avaliacao:
    "Ótimo: >50 e <=70 Bom: >30 e <=50 Suficiente: >10 e <=30 Regular: >=70",
  meta_2026: "35%",
  meta_2027: "45%",
  meta_2028: "55%",
  meta_2029: "65%",
  meta_plano_2026_2029: "65%",
  meta_pas_2026: "65%",
  unidade_medida: "Percentual",
  responsavel: "Atenção Primária",
  acoes: [],
};

describe("pasHelpers", () => {
  it("resolve o alvo anual dinamicamente", () => {
    expect(getMetaTarget(metaMock, 2026)).toBe("35%");
    expect(getMetaTarget(metaMock, 2029)).toBe("65%");
  });

  it("classifica o status pela faixa definida nos critérios", () => {
    expect(resolveStatusByCriteria(metaMock.criterios_avaliacao, 55)).toBe("otimo");
    expect(resolveStatusByCriteria(metaMock.criterios_avaliacao, 40)).toBe("bom");
    expect(resolveStatusByCriteria(metaMock.criterios_avaliacao, 20)).toBe("suficiente");
    expect(resolveStatusByCriteria(metaMock.criterios_avaliacao, 75)).toBe("regular");
  });

  it("distingue ausência de valor de resultado não alcançado", () => {
    expect(getMetaStatus(metaMock, null)).toBe("nao_avaliado");
    expect(resolveStatusByCriteria(metaMock.criterios_avaliacao, 5)).toBe("nao_alcancado");
  });

  it("não transforma meta sem critério em reprovação", () => {
    expect(resolveStatusByCriteria("", 50)).toBe("sem_criterio");
  });

  it("aceita alternativas explícitas e rejeita faixas contraditórias", () => {
    expect(resolveStatusByCriteria("Regular: <8 ou >=14", 6)).toBe("regular");
    expect(resolveStatusByCriteria("Regular: <8 e >=14", 6)).toBe("sem_criterio");
  });
});
