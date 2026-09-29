import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function extractLiteral(source, exportName) {
  const pattern = new RegExp(
    `export const ${exportName}[^=]*=\\s*([\\s\\S]*?)\\s+as const;`,
  );
  const match = source.match(pattern);

  if (!match) {
    throw new Error(`Não foi possível localizar o literal exportado: ${exportName}`);
  }

  return match[1];
}

function stripAccents(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function createStableKey(value) {
  return stripAccents(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractIndicatorAndCriteria(indicadorCompleto) {
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

function sqlString(value) {
  return `'${String(value ?? "").replace(/'/g, "''")}'`;
}

function normalizeSetorResponsavelNome(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function getSetorResponsavelKey(value) {
  return normalizeSetorResponsavelNome(value).toLowerCase();
}

function buildDiretrizes(pasDataSeed, pasMetaDetails) {
  return pasDataSeed.map((diretriz) => ({
    numero: diretriz.numero,
    nome: diretriz.nome,
    objetivos: diretriz.diretrizes.map((objetivo) => ({
      numero: objetivo.numero,
      nome: objetivo.nome,
      descricao: objetivo.objetivo,
      metas: objetivo.metas.map((meta) => {
        const detailKey = createStableKey(`${meta.codigo}-${meta.descricao}`);
        const details = pasMetaDetails[detailKey];
        const extracted = extractIndicatorAndCriteria(meta.indicador);

        const indicador = details?.indicador || extracted.indicador || meta.indicador;
        const criteriosAvaliacao =
          details?.criteriosAvaliacao || extracted.criteriosAvaliacao;
        const meta2026 = details?.meta2026 || meta.metaPlano2026;
        const meta2027 = details?.meta2027 || meta2026;
        const meta2028 = details?.meta2028 || meta2027;
        const meta2029 = details?.meta2029 || meta2028;
        const metaPlano20262029 = details?.metaPlano20262029 || meta2029;
        const metaPas2026 = details?.metaPas2026 || meta2026;
        const unidadeMedida = details?.unidadeMedida || meta.unidadeMedida;
        const responsavel =
          details?.responsavel || "Secretaria Municipal de Saúde";

        return {
          numero: meta.numero,
          descricao: meta.descricao,
          indicador,
          criteriosAvaliacao,
          meta2026,
          meta2027,
          meta2028,
          meta2029,
          metaPlano20262029,
          metaPas2026,
          unidadeMedida,
          responsavel,
          acoes: meta.acoes.map((acao, index) => ({
            numero: index + 1,
            descricao: acao,
          })),
        };
      }),
    })),
  }));
}

async function main() {
  const pasDataSeedSource = await fs.readFile(
    path.join(repoRoot, "src/data/pasDataSeed.ts"),
    "utf8",
  );
  const pasMetaDetailsSource = await fs.readFile(
    path.join(repoRoot, "src/data/pasMetaDetails.ts"),
    "utf8",
  );

  const pasDataSeed = vm.runInNewContext(
    `(${extractLiteral(pasDataSeedSource, "pasDataSeed")})`,
  );
  const pasMetaDetails = vm.runInNewContext(
    `(${extractLiteral(pasMetaDetailsSource, "pasMetaDetails")})`,
  );

  const diretrizes = buildDiretrizes(pasDataSeed, pasMetaDetails);
  const setoresResponsaveis = Array.from(
    new Set(
      diretrizes.flatMap((diretriz) =>
        diretriz.objetivos.flatMap((objetivo) =>
          objetivo.metas.map((meta) => meta.responsavel.trim()),
        ),
      ),
    ),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const lines = [
    "-- Seed SQL gerado automaticamente a partir do arquivo oficial",
    "-- MATRIZ DOMI PMS 2026 2029 TV ATUALIZADA.docx",
    "-- Fonte intermediária: src/data/pasDataSeed.ts + src/data/pasMetaDetails.ts",
    "",
    "BEGIN;",
    "",
    "TRUNCATE TABLE public.acoes_status, public.avaliacoes_anuais, public.acoes, public.metas, public.objetivos, public.diretrizes, public.setores_responsaveis RESTART IDENTITY CASCADE;",
    "",
    ...setoresResponsaveis.map(
      (setor) =>
        `INSERT INTO public.setores_responsaveis (nome, nome_normalizado, ativo) VALUES (${sqlString(normalizeSetorResponsavelNome(setor))}, ${sqlString(getSetorResponsavelKey(setor))}, true);`,
    ),
    "",
    "DO $$",
    "DECLARE",
    "  diretriz_id uuid;",
    "  objetivo_id uuid;",
    "  meta_id uuid;",
    "BEGIN",
  ];

  for (const diretriz of diretrizes) {
    lines.push(
      `  INSERT INTO public.diretrizes (numero, nome) VALUES (${diretriz.numero}, ${sqlString(diretriz.nome)}) RETURNING id INTO diretriz_id;`,
    );

    for (const objetivo of diretriz.objetivos) {
      lines.push(
        `  INSERT INTO public.objetivos (diretriz_id, numero, nome, descricao) VALUES (diretriz_id, ${objetivo.numero}, ${sqlString(objetivo.nome)}, ${sqlString(objetivo.descricao)}) RETURNING id INTO objetivo_id;`,
      );

      for (const meta of objetivo.metas) {
        lines.push(
          `  INSERT INTO public.metas (objetivo_id, numero, descricao, indicador, criterios_avaliacao, meta_2026, meta_2027, meta_2028, meta_2029, meta_plano_2026_2029, meta_pas_2026, unidade_medida, responsavel) VALUES (objetivo_id, ${meta.numero}, ${sqlString(meta.descricao)}, ${sqlString(meta.indicador)}, ${sqlString(meta.criteriosAvaliacao)}, ${sqlString(meta.meta2026)}, ${sqlString(meta.meta2027)}, ${sqlString(meta.meta2028)}, ${sqlString(meta.meta2029)}, ${sqlString(meta.metaPlano20262029)}, ${sqlString(meta.metaPas2026)}, ${sqlString(meta.unidadeMedida)}, ${sqlString(meta.responsavel)}) RETURNING id INTO meta_id;`,
        );

        for (const acao of meta.acoes) {
          lines.push(
            `  INSERT INTO public.acoes (meta_id, numero, descricao) VALUES (meta_id, ${acao.numero}, ${sqlString(acao.descricao)});`,
          );
        }
      }
    }
  }

  lines.push("END $$;");
  lines.push("");
  lines.push("COMMIT;");
  lines.push("");

  await fs.writeFile(path.join(repoRoot, "supabase/seed.sql"), lines.join("\n"));

  const totalObjetivos = diretrizes.reduce(
    (sum, diretriz) => sum + diretriz.objetivos.length,
    0,
  );
  const totalMetas = diretrizes.reduce(
    (sum, diretriz) =>
      sum +
      diretriz.objetivos.reduce((inner, objetivo) => inner + objetivo.metas.length, 0),
    0,
  );
  const totalAcoes = diretrizes.reduce(
    (sum, diretriz) =>
      sum +
      diretriz.objetivos.reduce(
        (inner, objetivo) =>
          inner +
          objetivo.metas.reduce((metaSum, meta) => metaSum + meta.acoes.length, 0),
        0,
      ),
    0,
  );

  console.log(
    `supabase/seed.sql gerado com ${diretrizes.length} diretriz(es), ${totalObjetivos} objetivo(s), ${totalMetas} meta(s) e ${totalAcoes} ação(ões).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
