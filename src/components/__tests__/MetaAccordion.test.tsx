import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MetaAccordion } from "../MetaAccordion";
import { PasMeta, SelectedYear } from "@/types/pas";

const selectedYearState: { value: SelectedYear } = {
  value: 2026,
};

vi.mock("@/contexts/SelectedYearContext", () => ({
  useSelectedYear: () => ({
    selectedYear: selectedYearState.value,
  }),
}));

vi.mock("../HistoricoDialog", () => ({
  HistoricoDialog: () => <div>Historico</div>,
}));

const metaMock: PasMeta = {
  id: "meta-1",
  objetivo_id: "obj-1",
  numero: 1,
  descricao: "Meta anual",
  indicador: "Indicador teste",
  criterios_avaliacao: "Ótimo: >50 Bom: >30 Suficiente: >10 Regular: >=70",
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

describe("MetaAccordion", () => {
  it("atualiza o alvo exibido quando o ano global muda", () => {
    const noop = vi.fn(async () => {});
    const { rerender } = render(
      <MetaAccordion
        meta={metaMock}
        valorRealizado={null}
        analiseQualitativa={null}
        isAcaoConcluida={() => false}
        onSave={noop}
        onToggleAcao={noop}
        saving={false}
      />,
    );

    expect(screen.getByText(/Meta 2026: 35%/i)).toBeInTheDocument();

    selectedYearState.value = 2027;
    rerender(
      <MetaAccordion
        meta={metaMock}
        valorRealizado={null}
        analiseQualitativa={null}
        isAcaoConcluida={() => false}
        onSave={noop}
        onToggleAcao={noop}
        saving={false}
      />,
    );

    expect(screen.getByText(/Meta 2027: 45%/i)).toBeInTheDocument();
  });
});
