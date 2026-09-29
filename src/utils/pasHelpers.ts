import { PasDiretriz, PasMeta, SelectedYear, StatusAtingimento, YEAR_OPTIONS } from "@/types/pas";

export const STATUS_LABELS: Record<StatusAtingimento, string> = {
  otimo: "Ótimo",
  bom: "Bom",
  suficiente: "Suficiente",
  regular: "Regular",
  nao_alcancado: "Não Alcançado",
  nao_avaliado: "Não Avaliado",
  sem_criterio: "Sem Critério",
};

const STATUS_ALIASES: Record<string, StatusAtingimento> = {
  otimo: "otimo",
  bom: "bom",
  suficiente: "suficiente",
  regular: "regular",
};

function stripAccents(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeComparisonSegment(segment: string): string {
  return stripAccents(segment)
    .toLowerCase()
    .replace(/,/g, ".")
    .replace(/%/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function createStableKey(value: string): string {
  return stripAccents(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseNumericValue(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;

  const normalized = String(value)
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^0-9.+-]/g, "");

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getMetaTarget(meta: PasMeta, year: SelectedYear): string {
  switch (year) {
    case 2026:
      return meta.meta_2026;
    case 2027:
      return meta.meta_2027;
    case 2028:
      return meta.meta_2028;
    case 2029:
      return meta.meta_2029;
    default:
      return meta.meta_2026;
  }
}

export function getMetaPlan(meta: PasMeta): string {
  return meta.meta_plano_2026_2029;
}

export function getMetaPas2026(meta: PasMeta): string {
  return meta.meta_pas_2026;
}

export function formatTargetValue(value: string | number | null | undefined, unidadeMedida?: string): string {
  if (value === null || value === undefined || value === "") return "-";
  const stringValue = String(value);

  if (stringValue.includes("%")) return stringValue;
  if (unidadeMedida && /percentual|%/i.test(unidadeMedida)) return `${stringValue}%`;

  return stringValue;
}

export function extractIndicatorAndCriteria(indicadorCompleto: string): {
  indicador: string;
  criteriosAvaliacao: string;
} {
  const normalized = indicadorCompleto.replace(/\s+/g, " ").trim();
  const criteriaMatch = normalized.match(/\b(Ótimo|Otimo|Bom|Suficiente|Regular)\s*:/i);

  if (!criteriaMatch || criteriaMatch.index === undefined) {
    return {
      indicador: normalized,
      criteriosAvaliacao: "",
    };
  }

  return {
    indicador: normalized.slice(0, criteriaMatch.index).trim().replace(/[.;]\s*$/, ""),
    criteriosAvaliacao: normalized.slice(criteriaMatch.index).trim(),
  };
}

function evaluateSingleComparison(value: number, operator: string, expected: number): boolean {
  switch (operator) {
    case ">":
      return value > expected;
    case ">=":
      return value >= expected;
    case "<":
      return value < expected;
    case "<=":
      return value <= expected;
    default:
      return false;
  }
}

function evaluateAndComparison(value: number, segment: string): boolean | null {
  const normalized = normalizeComparisonSegment(segment);
  if (!normalized) return null;

  const rangeMatch = normalized.match(/(>=|>|<=|<)?\s*(-?\d+(?:\.\d+)?)\s*(?:a|ate)\s*(>=|>|<=|<)?\s*(-?\d+(?:\.\d+)?)/i);
  if (rangeMatch) {
    const lowerOperator = rangeMatch[1] || ">=";
    const lowerValue = Number.parseFloat(rangeMatch[2]);
    const upperOperator = rangeMatch[3] || "<=";
    const upperValue = Number.parseFloat(rangeMatch[4]);

    const lowerMatchesUpper = lowerValue === upperValue;
    const satisfiable = lowerValue < upperValue || (
      lowerMatchesUpper && lowerOperator === ">=" && upperOperator === "<="
    );

    if (!satisfiable) return null;

    return (
      evaluateSingleComparison(value, lowerOperator, lowerValue) &&
      evaluateSingleComparison(value, upperOperator, upperValue)
    );
  }

  const comparisons = [...normalized.matchAll(/(>=|<=|>|<)\s*(-?\d+(?:\.\d+)?)/g)];
  if (comparisons.length > 0) {
    const lowerBounds = comparisons
      .filter((comparison) => comparison[1] === ">" || comparison[1] === ">=")
      .map((comparison) => ({ value: Number.parseFloat(comparison[2]), inclusive: comparison[1] === ">=" }));
    const upperBounds = comparisons
      .filter((comparison) => comparison[1] === "<" || comparison[1] === "<=")
      .map((comparison) => ({ value: Number.parseFloat(comparison[2]), inclusive: comparison[1] === "<=" }));

    if (lowerBounds.length > 0 && upperBounds.length > 0) {
      const lower = lowerBounds.reduce((current, candidate) => candidate.value > current.value ? candidate : current);
      const upper = upperBounds.reduce((current, candidate) => candidate.value < current.value ? candidate : current);
      if (lower.value > upper.value || (
        lower.value === upper.value && (!lower.inclusive || !upper.inclusive)
      )) {
        return null;
      }
    }

    return comparisons.every((comparison) =>
      evaluateSingleComparison(value, comparison[1], Number.parseFloat(comparison[2])),
    );
  }

  const exactMatch = normalized.match(/^-?\d+(?:\.\d+)?$/);
  if (exactMatch) {
    return value === Number.parseFloat(exactMatch[0]);
  }

  return null;
}

function evaluateCriterionSegment(value: number, segment: string): boolean | null {
  const alternatives = normalizeComparisonSegment(segment)
    .split(/\bou\b/g)
    .map((alternative) => alternative.trim())
    .filter(Boolean);

  let hasValidAlternative = false;
  for (const alternative of alternatives) {
    const result = evaluateAndComparison(value, alternative);
    if (result === true) return true;
    if (result === false) hasValidAlternative = true;
  }

  return hasValidAlternative ? false : null;
}

export function resolveStatusByCriteria(criteria: string, value: number | null | undefined): StatusAtingimento {
  const normalized = criteria.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "sem_criterio";
  }

  if (value === null || value === undefined || Number.isNaN(value)) {
    return "nao_avaliado";
  }

  const matches = [...normalized.matchAll(/(Ótimo|Otimo|Bom|Suficiente|Regular)\s*:\s*(.*?)(?=(?:Ótimo|Otimo|Bom|Suficiente|Regular)\s*:|$)/gi)];
  let hasValidCriterion = false;

  for (const match of matches) {
    const label = stripAccents(match[1]).toLowerCase();
    const status = STATUS_ALIASES[label];
    if (!status) continue;

    const expression = match[2]
      .replace(/^[,.;\s]+/, "")
      .replace(/[.;\s]+$/, "")
      .trim();

    const result = evaluateCriterionSegment(value, expression);
    if (result !== null) hasValidCriterion = true;
    if (result === true) {
      return status;
    }
  }

  return hasValidCriterion ? "nao_alcancado" : "sem_criterio";
}

export function getMetaStatus(meta: PasMeta, valorRealizado: number | null | undefined): StatusAtingimento {
  return resolveStatusByCriteria(meta.criterios_avaliacao, valorRealizado);
}

export function flattenMetas(diretrizes: PasDiretriz[]) {
  return diretrizes.flatMap((diretriz) =>
    diretriz.objetivos.flatMap((objetivo) =>
      objetivo.metas.map((meta) => ({
        ...meta,
        diretriz,
        objetivo,
      })),
    ),
  );
}

export function getAvailableResponsaveis(diretrizes: PasDiretriz[]): string[] {
  return Array.from(
    new Set(
      flattenMetas(diretrizes)
        .map((meta) => meta.responsavel)
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function isSelectedYear(value: number): value is SelectedYear {
  return YEAR_OPTIONS.includes(value as SelectedYear);
}
