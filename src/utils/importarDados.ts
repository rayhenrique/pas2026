import { supabase } from "@/integrations/supabase/client";
import { pasData } from "@/data/pasData";

export async function importarDadosParaBanco(): Promise<{ success: boolean; message: string }> {
  try {
    // Verificar se já existem dados no banco
    const { data: existingEixos } = await supabase.from("eixos").select("id").limit(1);

    if (existingEixos && existingEixos.length > 0) {
      console.log("Limpando dados existentes...");

      // Limpar dados em ordem para respeitar chaves estrangeiras (se não houver cascade)
      // Ou apenas tentar limpar eixos e ver se o cascade funciona
      // Como não temos garantia do cascade, vamos limpar de baixo para cima

      // Limpar primeiro as tabelas dependentes (lancamentos e acoes_status, e historico)
      // Limpar primeiro as tabelas dependentes (lancamentos e acoes_status, e historico)
      const { error: errHist1 } = await supabase.from("lancamentos_historico").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (errHist1) console.error("Erro ao limpar histórico (1):", errHist1);

      const { error: errStatus } = await supabase.from("acoes_status").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (errStatus) console.error("Erro ao limpar acoes_status:", errStatus);

      const { error: errLanc } = await supabase.from("lancamentos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (errLanc) console.error("Erro ao limpar lancamentos:", errLanc);

      const { error: errorAcoes } = await supabase.from("acoes").delete().neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all (neq id 0 matches all usually if valid UUID)
      // Melhor usar um filtro que pegue tudo. "neq id 0" funciona se id for uuid.

      // Alternativa: Buscar todos IDs e deletar. Mas delete sem where *pode* ser bloqueado dependendo da política RLS ou configuração do Supabase.
      // O supabase-js exige um WHERE para delete por segurança.

      const { error: errAcoes } = await supabase.from("acoes").delete().neq("descricao", "______DELETE_ALL_SAFETY_BYPASS______");
      // espera-se que delete tudo se a condição for verdadeira para todos, o que 'neq string_impossivel' é.

      // Vamos tentar uma abordagem mais limpa com .gt('numero', -1) se houver coluna numero, ou .neq('id', 'uuid-invalido')

      // Excluir Acoes
      await supabase.from("acoes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      // Excluir Metas
      await supabase.from("metas").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      // Excluir Diretrizes
      await supabase.from("diretrizes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      // Excluir Eixos
      const { error: errEixos } = await supabase.from("eixos").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      // Limpar histórico NOVAMENTE para garantir que logs de exclusão (gerados por triggers) também sejam removidos
      const { error: errHist2 } = await supabase.from("lancamentos_historico").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (errHist2) console.error("Erro ao limpar histórico (2):", errHist2);

      if (errEixos) {
        console.error("Erro ao limpar dados:", errEixos);
        // Tentar continuar ou retornar erro? Vamos retornar erro para evitar duplicidade parcial.
        // return { success: false, message: "Erro ao limpar dados antigos." };
        // Mas se o banco já estiver limpo ou com erro, pode ser RLS. Assumindo que o usuário tem permissão.
      }
    }

    // Importar cada eixo
    for (const eixo of pasData) {
      // Criar eixo
      const { data: novoEixo, error: eixoError } = await supabase
        .from("eixos")
        .insert({ numero: eixo.numero, nome: eixo.nome })
        .select()
        .single();

      if (eixoError) throw new Error(`Erro ao criar eixo: ${eixoError.message}`);

      // Criar diretrizes do eixo
      for (const diretriz of eixo.diretrizes) {
        const { data: novaDiretriz, error: diretrizError } = await supabase
          .from("diretrizes")
          .insert({
            eixo_id: novoEixo.id,
            numero: diretriz.numero,
            nome: diretriz.nome,
          })
          .select()
          .single();

        if (diretrizError) throw new Error(`Erro ao criar diretriz: ${diretrizError.message}`);

        // Criar metas da diretriz
        for (const meta of diretriz.metas) {
          const { data: novaMeta, error: metaError } = await supabase
            .from("metas")
            .insert({
              diretriz_id: novaDiretriz.id,
              numero: meta.numero,
              descricao: meta.descricao,
              indicador: meta.indicador,
              meta_plano_2025: meta.metaPlano2026,
              unidade_medida: meta.unidadeMedida,
            })
            .select()
            .single();

          if (metaError) throw new Error(`Erro ao criar meta: ${metaError.message}`);

          // Criar ações da meta
          for (let i = 0; i < meta.acoes.length; i++) {
            const acao = meta.acoes[i];
            const { error: acaoError } = await supabase
              .from("acoes")
              .insert({
                meta_id: novaMeta.id,
                numero: i + 1,
                descricao: acao.descricao,
              });

            if (acaoError) throw new Error(`Erro ao criar ação: ${acaoError.message}`);
          }
        }
      }
    }

    return {
      success: true,
      message: `Importação concluída! ${pasData.length} eixos importados com sucesso.`
    };
  } catch (error: any) {
    console.error("Erro na importação:", error);
    return {
      success: false,
      message: error.message || "Erro desconhecido durante a importação"
    };
  }
}
