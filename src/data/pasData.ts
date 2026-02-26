// Estrutura de dados do PAS 2026 - Teotônio Vilela

export interface Acao {
  id: string;
  descricao: string;
  concluida: boolean;
}

export interface Meta {
  id: string;
  numero: number;
  descricao: string;
  indicador: string;
  metaPlano2026: string;
  meta_plano_2025?: string;
  unidadeMedida: string;
  acoes: Acao[];
  resultado1QDM?: number | null;
  resultado2QDM?: number | null;
  resultado3QDM?: number | null;
  justificativa?: string;
}

export interface Diretriz {
  id: string;
  numero: number;
  nome: string;
  objetivo: string;
  metas: Meta[];
}

export interface Eixo {
  id: string;
  numero: number;
  nome: string;
  diretrizes: Diretriz[];
}

export const pasData: Eixo[] = [
  {
    id: "eixo-1",
    numero: 1,
    nome: "Saúde com Qualidade para Todos e Expansão dos Serviços",
    diretrizes: [
      {
        id: "diretriz-1-1",
        numero: 1,
        nome: "Atenção Primária à Saúde como Ordenadora da Rede de Atenção à Saúde",
        objetivo: "Ampliar a resolutividade das ações e serviços da Atenção Primária de forma integrada e planejada reorganizando a rede assistencial.",
        metas: [
          {
            id: "meta-1", numero: 1, descricao: "Ofertar 100% de Cobertura de Atenção Básica", indicador: "Percentual (%) de Cobertura de Atenção Básica", metaPlano2026: "100%", meta_plano_2025: "100%", unidadeMedida: "Percentual", acoes: [
              { id: "a1-1", descricao: "Atualização dos cadastramentos das pessoas/famílias residentes às equipes de Atenção Primária", concluida: false },
              { id: "a1-2", descricao: "Manutenção do número de profissionais e equipes cadastradas (eSF, eSB e eMulti) no SCNES", concluida: false },
              { id: "a1-3", descricao: "Acompanhamento quadrimestral dos indicadores de desempenho e produtividade das equipes", concluida: false },
              { id: "a1-4", descricao: "Aquisição de equipamentos de saúde e informática para as UBS", concluida: false },
              { id: "a1-5", descricao: "Capacitações voltadas para o Ciclos de Vida na Atenção Primária a Saúde", concluida: false },
              { id: "a1-6", descricao: "Manter as equipes de Atenção Básica com prontuário eletrônico", concluida: false }
            ]
          },
          {
            id: "meta-2", numero: 2, descricao: "Ofertar 98% do acompanhamento dos beneficiários do Programa Bolsa Família", indicador: "Percentual de acompanhamento das condicionalidades de Saúde do PBF", metaPlano2026: "98%", meta_plano_2025: "98%", unidadeMedida: "Percentual", acoes: [
              { id: "a2-1", descricao: "Coordenar as Ações de acompanhamento do programa Bolsa Família", concluida: false },
              { id: "a2-2", descricao: "Garantir a execução das condicionalidades pelos profissionais de Atenção Básica", concluida: false },
              { id: "a2-3", descricao: "Inserir as medidas antropométricas em tempo hábil", concluida: false }
            ]
          },
          {
            id: "meta-3", numero: 3, descricao: "Reduzir em 5% as internações por causas sensíveis à Atenção Básica", indicador: "Percentual de redução de causas sensíveis à Atenção Básica", metaPlano2026: "5%", meta_plano_2025: "5%", unidadeMedida: "Percentual", acoes: [
              { id: "a3-1", descricao: "Acompanhamento de protocolos clínicos institucionais", concluida: false },
              { id: "a3-2", descricao: "Implementar testes rápidos nas eSF para público adulto com vida sexualmente ativa", concluida: false },
              { id: "a3-3", descricao: "Atualização da classificação de risco nas eSF", concluida: false },
              { id: "a3-4", descricao: "Acompanhamento das pessoas com doenças crônicas não transmissíveis", concluida: false },
              { id: "a3-5", descricao: "Garantir o elenco de medicamentos da Farmácia Básica", concluida: false },
              { id: "a3-6", descricao: "Capacitar sobre as linhas de cuidado nas Redes de Atenção à Saúde", concluida: false },
              { id: "a3-7", descricao: "Garantir insumos para adequado atendimento à população", concluida: false },
              { id: "a3-8", descricao: "Qualificar profissionais da atenção básica para causas sensíveis", concluida: false }
            ]
          },
          {
            id: "meta-4", numero: 4, descricao: "Implantar um Comitê de Educação Permanente em Saúde", indicador: "Número de comitê implantado", metaPlano2026: "1", meta_plano_2025: "1", unidadeMedida: "Número", acoes: [
              { id: "a4-1", descricao: "Contratação de profissional de nível superior para o comitê", concluida: false },
              { id: "a4-2", descricao: "Realizar reuniões periódicas com profissionais estratégicos da rede municipal", concluida: false },
              { id: "a4-3", descricao: "Ofertar qualificações profissionais conforme necessidade", concluida: false }
            ]
          },
          {
            id: "meta-5", numero: 5, descricao: "Implementar o Programa SUS Digital no Município", indicador: "Número de plano de ação voltado ao programa SUS digital", metaPlano2026: "1", meta_plano_2025: "1", unidadeMedida: "Número", acoes: [
              { id: "a5-1", descricao: "Capacitação do uso dos sistemas PEC/e-SUS pelos profissionais das UBS", concluida: false },
              { id: "a5-2", descricao: "Manutenção de informatização das unidades de saúde", concluida: false },
              { id: "a5-3", descricao: "Garantir equipamentos para funcionamento dos sistemas", concluida: false },
              { id: "a5-4", descricao: "Educação Permanente em saúde digital", concluida: false },
              { id: "a5-5", descricao: "Qualificação dos registros em saúde", concluida: false },
              { id: "a5-6", descricao: "Suporte de melhoria da infraestrutura para sistemas digitais e conectividade", concluida: false },
              { id: "a5-7", descricao: "Fortalecimento dos mecanismos de segurança de acesso aos sistemas", concluida: false },
              { id: "a5-8", descricao: "Análise e disseminação dos dados para estratégias digital e inovação", concluida: false },
              { id: "a5-9", descricao: "Gestão e governança no compartilhamento de dados de saúde", concluida: false },
              { id: "a5-10", descricao: "Fortalecimento do uso de telessaúde no âmbito municipal", concluida: false },
              { id: "a5-11", descricao: "Preservação da autenticidade, integridade e qualidade da informação em saúde", concluida: false }
            ]
          },
          {
            id: "meta-6", numero: 6, descricao: "Implementar eixos prioritários das políticas estratégicas (Criança, adolescente, homem, mulher e idoso)", indicador: "Número de eixos prioritários implementados", metaPlano2026: "7", meta_plano_2025: "7", unidadeMedida: "Número", acoes: [
              { id: "a6-1", descricao: "Implementação do Programa Nacional de Suplementação de Ferro nas UBS", concluida: false },
              { id: "a6-2", descricao: "Ações de aleitamento materno e alimentação complementar saudável", concluida: false },
              { id: "a6-3", descricao: "Promoção e acompanhamento do crescimento e desenvolvimento de crianças de 0 a 9 anos", concluida: false },
              { id: "a6-4", descricao: "Atualização da Caderneta da criança nas consultas de puericultura", concluida: false },
              { id: "a6-5", descricao: "Captação precoce de gestantes para pelo menos 6 consultas de pré-natal", concluida: false },
              { id: "a6-6", descricao: "Realização de testes rápidos (HIV, Sífilis, hepatite B e C) em gestantes", concluida: false },
              { id: "a6-7", descricao: "Implementação de ações de violência contra a mulher nas UBS", concluida: false },
              { id: "a6-8", descricao: "Ofertar exames citopatológico em mulheres de 25 a 64 anos", concluida: false },
              { id: "a6-9", descricao: "Ofertar exames de mamografia em mulheres de 50 a 69 anos", concluida: false },
              { id: "a6-10", descricao: "Intensificação das ações de prevenção do Câncer de Colo do Útero e mama", concluida: false },
              { id: "a6-11", descricao: "Orientar sobre partos normais no SUS", concluida: false },
              { id: "a6-12", descricao: "Implementar ações de saúde do homem – Novembro Azul", concluida: false },
              { id: "a6-13", descricao: "Fortalecer o grupo de gestantes", concluida: false },
              { id: "a6-14", descricao: "Fortalecer grupo de hipertenso e diabético", concluida: false },
              { id: "a6-15", descricao: "Fortalecer a política de atenção à saúde do idoso", concluida: false },
              { id: "a6-16", descricao: "Realizar visita puerperal na primeira semana pós-parto", concluida: false }
            ]
          },
          {
            id: "meta-7", numero: 7, descricao: "Implementar 10 ações da Academia de Saúde", indicador: "Número de ações da Academia de Saúde", metaPlano2026: "10", meta_plano_2025: "10", unidadeMedida: "Número", acoes: [
              { id: "a7-1", descricao: "Implantar academia de saúde", concluida: false },
              { id: "a7-2", descricao: "Práticas corporais e atividades físicas", concluida: false },
              { id: "a7-3", descricao: "Produção do cuidado e modos de vida saudáveis", concluida: false },
              { id: "a7-4", descricao: "Promoção da alimentação saudável", concluida: false },
              { id: "a7-5", descricao: "Práticas integrativas e complementares", concluida: false },
              { id: "a7-6", descricao: "Práticas artísticas e culturais", concluida: false },
              { id: "a7-7", descricao: "Educação em Saúde", concluida: false },
              { id: "a7-8", descricao: "Planejamento e Gestão", concluida: false },
              { id: "a7-9", descricao: "Mobilização da comunidade", concluida: false }
            ]
          },
          {
            id: "meta-8", numero: 8, descricao: "Estruturar e qualificar em 100% as ações de Saúde Bucal", indicador: "Percentual de ações e serviços da saúde bucal", metaPlano2026: "100%", meta_plano_2025: "100%", unidadeMedida: "Percentual", acoes: [
              { id: "a8-1", descricao: "Implementação das ações de Saúde Bucal nas Escolas vinculadas ao PSE", concluida: false },
              { id: "a8-2", descricao: "Manutenção da cobertura de serviços odontológicos", concluida: false },
              { id: "a8-3", descricao: "Realização de atendimento odontológico às gestantes", concluida: false },
              { id: "a8-4", descricao: "Ampliar cobertura com primeira consulta odontológica programática", concluida: false },
              { id: "a8-5", descricao: "Ampliar número de pacientes com tratamentos concluídos", concluida: false },
              { id: "a8-6", descricao: "Diminuir a taxa de exodontia", concluida: false },
              { id: "a8-7", descricao: "Realizar ações de escovação supervisionada", concluida: false },
              { id: "a8-8", descricao: "Aumentar proporção de procedimentos preventivos", concluida: false },
              { id: "a8-9", descricao: "Ampliar tratamento restaurador Atraumático", concluida: false },
              { id: "a8-10", descricao: "Cuidado compartilhado da pessoa acompanhada", concluida: false },
              { id: "a8-11", descricao: "Ações de saúde bucal para trabalhadores da saúde", concluida: false }
            ]
          },
          {
            id: "meta-9", numero: 9, descricao: "Ofertar 100% de serviços e especialidades no CEO", indicador: "Número de especialidades odontológicas disponíveis", metaPlano2026: "5", meta_plano_2025: "5", unidadeMedida: "Número", acoes: [
              { id: "a9-1", descricao: "Manter contratação de cirurgiões dentistas nas especialidades Endodontia, Periodontia, Prótese Dentária, Estomatologia e Bucomaxilofacial", concluida: false }
            ]
          }
        ]
      },
      {
        id: "diretriz-1-2",
        numero: 2,
        nome: "Integração das Ações e Serviços de Saúde na Rede de Atenção à Saúde (RAS)",
        objetivo: "Qualificar a atenção integral às pessoas com doenças crônicas e ampliar as estratégias para promoção da saúde da população para prevenção do desenvolvimento das doenças crônicas e suas complicações.",
        metas: [
          {
            id: "meta-10", numero: 10, descricao: "Ofertar a realização de exame preventivo de câncer de colo de útero nas mulheres entre 25 à 64 anos", indicador: "Razão de exame citopatológico do Colo do Útero", metaPlano2026: "1", meta_plano_2025: "1", unidadeMedida: "Razão", acoes: [
              { id: "a10-1", descricao: "Monitoramento e busca ativa das mulheres", concluida: false },
              { id: "a10-2", descricao: "Garantir realização da coleta de citologias nas Unidades Básica de Saúde", concluida: false },
              { id: "a10-3", descricao: "Articular com os Agentes Comunitários de Saúde a busca ativa de mulheres na faixa etária", concluida: false },
              { id: "a10-4", descricao: "Garantir a continuidade da assistência as mulheres com exames citopatológicos alterados", concluida: false }
            ]
          },
          {
            id: "meta-11", numero: 11, descricao: "Ofertar a realização de exame de Mamografia em mulheres com faixa etária entre 50 a 69 anos", indicador: "Razão de exames de mamografia rastreamento", metaPlano2026: "1", meta_plano_2025: "1", unidadeMedida: "Razão", acoes: [
              { id: "a11-1", descricao: "Promover a busca ativa das mulheres com exames de mamografia alterados", concluida: false },
              { id: "a11-2", descricao: "Articular com os Agentes Comunitários de Saúde a busca ativa", concluida: false },
              { id: "a11-3", descricao: "Garantir a continuidade da assistência as mulheres com exames de mamografia alterados", concluida: false }
            ]
          },
          {
            id: "meta-12", numero: 12, descricao: "Reduzir o número de mortalidade prematura de 30 a 69 anos pelo conjunto das quadro doenças crônicas não transmissíveis - DCNT", indicador: "Número de óbitos prematuros (de 30 a 69 anos) pelo conjunto das quatro doenças crônicas não transmissíveis", metaPlano2026: "15", meta_plano_2025: "15", unidadeMedida: "Número", acoes: [
              { id: "a12-1", descricao: "Promover a busca ativa ao público para acompanhamento", concluida: false },
              { id: "a12-2", descricao: "Iniciar em até 60 dias, a partir do diagnóstico, o tratamento de 100% dos pacientes diagnosticados com câncer", concluida: false },
              { id: "a12-3", descricao: "Promoção de ações para redução dos fatores de risco", concluida: false },
              { id: "a12-4", descricao: "Educação permanente das principais doenças crônicas não transmissíveis", concluida: false },
              { id: "a12-5", descricao: "Acompanhar indicadores de hipertensão e diabetes", concluida: false },
              { id: "a12-6", descricao: "Ampliar as ações interprofissionais realizadas", concluida: false }
            ]
          },
          {
            id: "meta-13", numero: 13, descricao: "Implementar eixos prioritários das políticas estratégicas (Criança, adolescente, homem, mulher e idoso)", indicador: "Número de eixos prioritários implementados", metaPlano2026: "7", meta_plano_2025: "7", unidadeMedida: "Número", acoes: [
              { id: "a13-1", descricao: "Realização de ações em alusão ao setembro amarelo", concluida: false },
              { id: "a13-2", descricao: "Monitorar os pacientes de atendimento psicossocial na Atenção Básica", concluida: false },
              { id: "a13-3", descricao: "Monitorar pacientes atendidos por psiquiatra no município", concluida: false },
              { id: "a13-4", descricao: "Referenciar de maneira sistemática os pacientes ao CAPS", concluida: false },
              { id: "a13-5", descricao: "Realizar ações sistemática de matriciamento em saúde mental", concluida: false },
              { id: "a13-6", descricao: "Fortalecer ações coletiva e em saúde mental", concluida: false },
              { id: "a13-7", descricao: "Realização de Grupos terapêuticos em saúde mental", concluida: false },
              { id: "a13-8", descricao: "Construção de sede própria do CAPS", concluida: false },
              { id: "a13-9", descricao: "Auxiliar no diagnóstico precoce, na manutenção do tratamento farmacológico", concluida: false }
            ]
          },
          {
            id: "meta-14", numero: 14, descricao: "Manutenção Centro de Especialidade em Reabilitação", indicador: "Centro de Especialidade em Reabilitação funcionando", metaPlano2026: "1", meta_plano_2025: "1", unidadeMedida: "Número", acoes: [
              { id: "a14-1", descricao: "Avaliação do cumprimento de indicadores e metas pactuados", concluida: false },
              { id: "a14-2", descricao: "Monitorar pacientes com deficiência no município", concluida: false },
              { id: "a14-3", descricao: "Referenciar de maneira sistemática os pacientes para os serviços especializados", concluida: false },
              { id: "a14-4", descricao: "Juntada de documentação necessária para solicitar a habilitação federal do CER", concluida: false }
            ]
          },
          {
            id: "meta-15", numero: 15, descricao: "Reduzir anualmente os óbitos infantis por causas evitáveis", indicador: "Número de mortalidade infantil", metaPlano2026: "2", meta_plano_2025: "2", unidadeMedida: "Número", acoes: [
              { id: "a15-1", descricao: "Garantir os meios necessários para evitar mortes maternas", concluida: false },
              { id: "a15-2", descricao: "Manter do comitê de Mortalidade Materno e Infantil", concluida: false },
              { id: "a15-3", descricao: "Realização de reuniões periódicas para discussões de casos", concluida: false },
              { id: "a15-4", descricao: "Inserção de todas as Declarações de Óbito em tempo hábil", concluida: false },
              { id: "a15-5", descricao: "Prestar assistência adequada durante pré-natal, parto e puerpério", concluida: false },
              { id: "a15-6", descricao: "Assegurar o acesso aos exames e consultas de pré-natal", concluida: false },
              { id: "a15-7", descricao: "Aumentar percentual de partos normais realizados no SUS", concluida: false },
              { id: "a15-8", descricao: "Garantir o acesso ao pré-natal de alto risco", concluida: false },
              { id: "a15-9", descricao: "Reduzir os números de casos de sífilis congênita", concluida: false },
              { id: "a15-10", descricao: "Garantir a realização de testes rápidos as gestantes", concluida: false },
              { id: "a15-11", descricao: "Garantir a oferta de exame do teste do pezinho", concluida: false },
              { id: "a15-12", descricao: "Realizar as investigações de óbitos fetais", concluida: false },
              { id: "a15-13", descricao: "Registrar todos os nascidos vivos no SINASC", concluida: false }
            ]
          }
        ]
      },
      {
        id: "diretriz-1-3",
        numero: 3,
        nome: "Integração das Ações e Serviços de Vigilância e Atenção à Saúde",
        objetivo: "Promover a qualidade de vida e redução de riscos e agravos à saúde da população, por meio da detecção oportuna e controle das doenças transmissíveis e não-transmissíveis.",
        metas: [
          {
            id: "meta-16", numero: 16, descricao: "Executar 100% das ações de promoção à saúde, prevenção e vigilância de doenças", indicador: "Percentual das ações de promoção à saúde", metaPlano2026: "100%", meta_plano_2025: "100%", unidadeMedida: "Percentual", acoes: [
              { id: "a16-1", descricao: "Otimizar o registro de óbitos registrados no SIM em até 60 dias", concluida: false },
              { id: "a16-2", descricao: "Intensificar o registro de óbitos com causa básica definida no SIM", concluida: false },
              { id: "a16-3", descricao: "Otimizar o registro de casos de doenças de notificação compulsória imediata", concluida: false },
              { id: "a16-4", descricao: "Realizar a informação de semanas epidemiológicas", concluida: false },
              { id: "a16-5", descricao: "Atingir o número de encerramento oportuno de casos notificados de dengue", concluida: false },
              { id: "a16-6", descricao: "Manter o percentual de registros de óbitos não fetais investigados", concluida: false },
              { id: "a16-7", descricao: "Realizar o mínimo de 80% de registros de óbitos fetais investigados", concluida: false },
              { id: "a16-8", descricao: "Realizar o mínimo de 80% de registros de óbitos infantis investigados", concluida: false },
              { id: "a16-9", descricao: "Garantir o mínimo de 80% de registros de óbitos de mulheres em idade fértil investigados", concluida: false },
              { id: "a16-10", descricao: "Manter o mínimo 90% dos contatos examinados dos casos novos de tuberculose", concluida: false },
              { id: "a16-11", descricao: "Manter e realizar testagem para HIV em 100% de casos novos de tuberculose", concluida: false },
              { id: "a16-12", descricao: "Manter o mínimo de 85% de casos de tuberculose curados", concluida: false },
              { id: "a16-13", descricao: "Manter em = 5% o percentual de casos de tuberculose encerrados como abandono", concluida: false },
              { id: "a16-14", descricao: "Manter o mínimo 90% de contatos examinados dos casos novos de hanseníase", concluida: false },
              { id: "a16-15", descricao: "Manter o percentual de 90% de cura de casos novos de hanseníase paucibacilar", concluida: false },
              { id: "a16-16", descricao: "Manter a proporção de 90% de cura dos casos novos de hanseníase multibacilar", concluida: false },
              { id: "a16-17", descricao: "Manter em = 5% o percentual de casos de hanseníase encerrados como abandono", concluida: false },
              { id: "a16-18", descricao: "Manter em 90% o percentual de casos diagnosticados para esquistossomose com tratamento realizado", concluida: false },
              { id: "a16-19", descricao: "Realizar o mínimo de 80% do preenchimento da notificação de casos envolvendo acidentes com material biológico", concluida: false },
              { id: "a16-20", descricao: "Encerrar 80% de casos de Intoxicação Exógena com até 180 dias", concluida: false },
              { id: "a16-21", descricao: "Notificar no mínimo 80% dos casos de intoxicação exógena com o grupo do agente tóxico identificado", concluida: false },
              { id: "a16-22", descricao: "Manter periodicamente trabalhos de cobertura de tonéis em residências", concluida: false },
              { id: "a16-23", descricao: "Capacitar os ACEs e equipe de saúde em diagnóstico precoce e tratamento de esquistossomose", concluida: false },
              { id: "a16-24", descricao: "Reduzir o número de óbitos infantis e maternos", concluida: false },
              { id: "a16-25", descricao: "Reduzir o número de casos novos de sífilis congênita em menores de um ano de idade", concluida: false }
            ]
          },
          {
            id: "meta-17", numero: 17, descricao: "Alcançar a cobertura vacinal de 95% das crianças menores de 02 anos", indicador: "Percentual de cobertura vacinal em menores de 2 anos", metaPlano2026: "95%", meta_plano_2025: "95%", unidadeMedida: "Percentual", acoes: [
              { id: "a17-1", descricao: "Manter o mínimo de 95% cobertura de crianças vacinadas com a vacina pentavalente", concluida: false },
              { id: "a17-2", descricao: "Manter o mínimo de 95% de cobertura de crianças vacinadas com a vacina tríplice viral", concluida: false },
              { id: "a17-3", descricao: "Manter o mínimo de 95% cobertura de crianças vacinadas com a vacina poliomielite", concluida: false },
              { id: "a17-4", descricao: "Manter o mínimo de 95% cobertura de crianças vacinadas com a vacina Pneumocócica 10-valente", concluida: false }
            ]
          },
          {
            id: "meta-18", numero: 18, descricao: "Implementar 100% das campanhas de vacinação determinadas pelo Ministério da Saúde", indicador: "Percentual de campanhas realizadas", metaPlano2026: "100%", meta_plano_2025: "100%", unidadeMedida: "Percentual", acoes: [
              { id: "a18-1", descricao: "Realizar encontros de atualização do calendário nacional de vacinação", concluida: false },
              { id: "a18-2", descricao: "Promover ações de Intensificação Vacinal trimestralmente", concluida: false },
              { id: "a18-3", descricao: "Manter educação continuada com equipes atuantes em salas de vacina", concluida: false },
              { id: "a18-4", descricao: "Promover dias específicos (DIA D) para intensificação vacinal", concluida: false },
              { id: "a18-5", descricao: "Implementar nas salas de vacina alimentação mensal das doses de vacina aplicadas", concluida: false },
              { id: "a18-6", descricao: "Realizar campanhas vacinação determinadas pelo Ministério da Saúde e Secretaria Estadual", concluida: false }
            ]
          },
          {
            id: "meta-19", numero: 19, descricao: "Garantir a cobertura vacinal na população idosa contra a influenza", indicador: "Percentual de idosos com vacinação contra a influenza", metaPlano2026: "95%", meta_plano_2025: "95%", unidadeMedida: "Percentual", acoes: [
              { id: "a19-1", descricao: "Realizar busca ativa do público-alvo", concluida: false },
              { id: "a19-2", descricao: "Promover a vacinação extramuros", concluida: false },
              { id: "a19-3", descricao: "Manter educação continuada com equipes atuantes em salas de vacina", concluida: false },
              { id: "a19-4", descricao: "Orientar equipe a sensibilizar público-alvo resistente a imunização", concluida: false }
            ]
          },
          {
            id: "meta-20", numero: 20, descricao: "Reduzir os atuais índices de gravidez na adolescência (10 a 19 anos)", indicador: "Percentual de gravidez na adolescência", metaPlano2026: "15%", meta_plano_2025: "15%", unidadeMedida: "Percentual", acoes: [
              { id: "a20-1", descricao: "Realização de grupos em parceira com o PSE", concluida: false },
              { id: "a20-2", descricao: "Realização de orientações nas unidades de saúde quanto a prevenção da gravidez", concluida: false }
            ]
          },
          {
            id: "meta-21", numero: 21, descricao: "Intensificar as Notificações de Violência contra mulher nas Unidades de Saúde", indicador: "Número de Unidades de Saúde com ficha de notificação", metaPlano2026: "20%", meta_plano_2025: "20%", unidadeMedida: "Porcentagem", acoes: [
              { id: "a21-1", descricao: "Realização de capacitações para notificação e preenchimento correto dos formulários", concluida: false },
              { id: "a21-2", descricao: "Identificação de casos através dos atendimentos nas unidades de saúde", concluida: false }
            ]
          },
          {
            id: "meta-22", numero: 22, descricao: "Realizar 100% de inspeção, coleta, análise e monitoramento dos sistemas de abastecimento de água", indicador: "Percentual de inspeção, coleta, análise e monitoramento", metaPlano2026: "100%", meta_plano_2025: "100%", unidadeMedida: "Percentual", acoes: [
              { id: "a22-1", descricao: "Realizar o mínimo de 90% de amostras de água para consumo humano analisadas para o parâmetro cloro residual livre", concluida: false },
              { id: "a22-2", descricao: "Realizar o mínimo de 90% de amostras de água para consumo humano analisadas para o parâmetro turbidez", concluida: false },
              { id: "a22-3", descricao: "Realizar o mínimo de 90% de amostras de água para consumo humano analisadas para o parâmetro coliformes totais", concluida: false },
              { id: "a22-4", descricao: "Coletar semanalmente amostras e encaminhar para o LACEN", concluida: false },
              { id: "a22-5", descricao: "Monitorar ações de vigilância ambiental nos sistemas SISAGUA E GAL", concluida: false },
              { id: "a22-6", descricao: "Garantir a autenticidade dos dados e tomar medidas cabíveis", concluida: false },
              { id: "a22-7", descricao: "Monitorar e desenvolver ações de gerenciamento dos resíduos sólidos dos serviços de saúde", concluida: false }
            ]
          },
          {
            id: "meta-23", numero: 23, descricao: "Implementar 100% das atividades de vigilância e controle das zoonoses", indicador: "Percentual das atividades de vigilância e controle das zoonoses", metaPlano2026: "100%", meta_plano_2025: "100%", unidadeMedida: "Percentual", acoes: [
              { id: "a23-1", descricao: "Realizar ações educativas de saúde ambiental nas escolas", concluida: false },
              { id: "a23-2", descricao: "Realização da campanha antirrábica anual", concluida: false },
              { id: "a23-3", descricao: "Capacitação de vigilância (ACEs) para realização do teste rápido para detecção da leishmaniose", concluida: false },
              { id: "a23-4", descricao: "Realização do teste rápido para detecção da leishmaniose em 100% dos animais suspeitos", concluida: false },
              { id: "a23-5", descricao: "Realizar o controle dos animais susceptíveis às zoonoses", concluida: false }
            ]
          },
          {
            id: "meta-24", numero: 24, descricao: "Executar o número mínimo de ciclos pactuados para controle das doenças de transmissão vetorial", indicador: "Percentual de cobertura de imóveis visitados", metaPlano2026: "80%", meta_plano_2025: "4 ciclos (80%)", unidadeMedida: "Percentual", acoes: [
              { id: "a24-1", descricao: "Ofertar insumos para realização dos ciclos", concluida: false },
              { id: "a24-2", descricao: "Ampliar monitoramento de ciclos que atingiram mínimo de 80% de cobertura", concluida: false },
              { id: "a24-3", descricao: "Realizar palestras educativas em órgãos públicos", concluida: false },
              { id: "a24-4", descricao: "Realizar bloqueio nas áreas com maior índice de acordo o resultado do LIRAa", concluida: false },
              { id: "a24-5", descricao: "Adquirir Panfletos Educativos sobre Dengue, Zica Vírus e Chikungunya", concluida: false },
              { id: "a24-6", descricao: "Realizar borrifação em Pontos Estratégicos (PE)", concluida: false },
              { id: "a24-7", descricao: "Manter periodicamente trabalhos de cobertura de tonéis", concluida: false }
            ]
          },
          {
            id: "meta-25", numero: 25, descricao: "Alcançar 100% de execução das ações de Vigilância Ambiental", indicador: "Percentual de execução das ações de Vigilância Ambiental", metaPlano2026: "100%", meta_plano_2025: "100%", unidadeMedida: "Percentual", acoes: [
              { id: "a25-1", descricao: "Implementar a vigilância em saúde de populações expostas a contaminantes químicos - VIGIPEQ", concluida: false },
              { id: "a25-2", descricao: "Implementar a vigilância em saúde ambiental relacionada aos riscos decorrentes de desastres - VIGIDESASTRES", concluida: false },
              { id: "a25-3", descricao: "Operacionalizar o monitoramento da qualidade do ar - PROGRAMA VIGIAR", concluida: false }
            ]
          },
          {
            id: "meta-26", numero: 26, descricao: "Operacionalizar 100% das ações da Vigilância Sanitária em Saúde", indicador: "Percentual das ações da Vigilância Sanitária em Saúde", metaPlano2026: "100%", meta_plano_2025: "100%", unidadeMedida: "Percentual", acoes: [
              { id: "a26-1", descricao: "Realizar 100% de cadastros ou atualização de cadastro dos estabelecimentos sujeitos a VISA", concluida: false },
              { id: "a26-2", descricao: "Realizar a liberação ou renovação de alvará sanitário", concluida: false },
              { id: "a26-3", descricao: "Realizar inspeções em estabelecimentos cadastrados sujeitos a VISA", concluida: false },
              { id: "a26-4", descricao: "Realizar atividades educativas para população de maneira contínua", concluida: false },
              { id: "a26-5", descricao: "Receber as denúncias sobre produtos, serviços e estabelecimentos", concluida: false },
              { id: "a26-6", descricao: "Realizar atendimento de denúncias", concluida: false },
              { id: "a26-7", descricao: "Realizar instauração de processo administrativo sanitário", concluida: false },
              { id: "a26-8", descricao: "Exclusão de cadastro de estabelecimentos com atividades encerradas", concluida: false },
              { id: "a26-9", descricao: "Fiscalização do uso de produtos fumigenos", concluida: false }
            ]
          },
          {
            id: "meta-27", numero: 27, descricao: "Qualificar 100% dos profissionais de saúde vinculados a Vigilância em Saúde", indicador: "Percentual dos profissionais qualificados", metaPlano2026: "100%", meta_plano_2025: "100%", unidadeMedida: "Percentual", acoes: [
              { id: "a27-1", descricao: "Garantir aos Recursos Humanos da Vigilância em Saúde os EPIs", concluida: false },
              { id: "a27-2", descricao: "Proporcionar a formação profissional da saúde sobre os temas prioritários", concluida: false }
            ]
          },
          {
            id: "meta-28", numero: 28, descricao: "Realizar 2 ações de prevenção e promoção de atenção à saúde do trabalhador", indicador: "Número de ações de prevenção e promoção", metaPlano2026: "2", meta_plano_2025: "2", unidadeMedida: "Número", acoes: [
              { id: "a28-1", descricao: "Desenvolver ações educativas em saúde do trabalhador", concluida: false },
              { id: "a28-2", descricao: "Realizar monitoramento das notificações de agravos e doenças relacionadas ao trabalho", concluida: false },
              { id: "a28-3", descricao: "Operacionalizar busca ativa das notificações, sensibilizações e orientações", concluida: false }
            ]
          },
          {
            id: "meta-29", numero: 29, descricao: "Realizar 2 ações de prevenção e proteção de atenção à saúde do trabalhador", indicador: "Número de ações de prevenção e proteção", metaPlano2026: "2", meta_plano_2025: "2", unidadeMedida: "Número", acoes: [
              { id: "a29-1", descricao: "Realizar monitoramento das notificações de agravos e doenças relacionadas ao trabalho", concluida: false },
              { id: "a29-2", descricao: "Operacionalizar busca ativa das notificações, sensibilizações e orientações de agravos em instituições públicas e privadas", concluida: false },
              { id: "a29-3", descricao: "Realizar 6 ações anuais de prevenção e proteção da saúde do trabalhador em instituições públicas e privadas", concluida: false }
            ]
          }
        ]
      },
      {
        id: "diretriz-1-4",
        numero: 4,
        nome: "Ampliação do Acesso e Aperfeiçoamento da Assistência Ambulatorial e Hospitalar",
        objetivo: "Melhorar a qualidade do atendimento na Assistência Ambulatorial e Hospitalar Especializada.",
        metas: [
          {
            id: "meta-30", numero: 30, descricao: "Garantir a assistência hospitalar no município através do HMNSG", indicador: "Unidade hospitalar em funcionamento", metaPlano2026: "1", meta_plano_2025: "1", unidadeMedida: "Número", acoes: [
              { id: "a30-1", descricao: "Garantir insumos para manutenção de Cirurgias eletivas", concluida: false },
              { id: "a30-2", descricao: "Garantir manutenção das instalações físicas do HMNSG", concluida: false },
              { id: "a30-3", descricao: "Reformar a porta de entrada (emergência) do HMNSG", concluida: false },
              { id: "a30-4", descricao: "Garantir cronograma de capacitações para equipe do HMNSG", concluida: false },
              { id: "a30-5", descricao: "Avaliação do cumprimento de indicadores e metas pactuados", concluida: false },
              { id: "a30-6", descricao: "Implantar uma Comissão de Controle de Infecção Hospitalar", concluida: false }
            ]
          },
          {
            id: "meta-31", numero: 31, descricao: "Supervisionar as ações de média e alta complexidade em 100%", indicador: "Percentual de ações supervisionadas", metaPlano2026: "100%", meta_plano_2025: "100%", unidadeMedida: "Percentual", acoes: [
              { id: "a31-1", descricao: "Monitorar oferta de consultas especializadas", concluida: false },
              { id: "a31-2", descricao: "Monitorar oferta de exames especializados", concluida: false },
              { id: "a31-3", descricao: "Garantir o funcionamento do Centro de Diagnóstico", concluida: false },
              { id: "a31-4", descricao: "Garantir a manutenção e funcionamento da Base Descentralizada do SAMU", concluida: false },
              { id: "a31-5", descricao: "Realizar manutenção periódica da estrutura física da Base Descentralizada do SAMU", concluida: false },
              { id: "a31-6", descricao: "Criação de Plano de ações voltadas ao desenvolvimento de atividades e educação em saúde", concluida: false }
            ]
          },
          {
            id: "meta-32", numero: 32, descricao: "Garantir as condições de funcionamento do Serviço de Atenção Domiciliar - SAD", indicador: "Equipe de atenção domiciliar habilitada", metaPlano2026: "1", meta_plano_2025: "1", unidadeMedida: "Número", acoes: [
              { id: "a32-1", descricao: "Avaliação do cumprimento de indicadores e metas pactuados", concluida: false }
            ]
          },
          {
            id: "meta-33", numero: 33, descricao: "Regular 100% do acesso dos usuários à Rede de Atenção à Saúde", indicador: "Percentual de acesso regulado", metaPlano2026: "100%", meta_plano_2025: "100%", unidadeMedida: "Percentual", acoes: [
              { id: "a33-1", descricao: "Implementar protocolos de Regulação", concluida: false },
              { id: "a33-2", descricao: "Implementar fluxo de regulação", concluida: false },
              { id: "a33-3", descricao: "Monitorar regulação dos pacientes na RAS", concluida: false },
              { id: "a33-4", descricao: "Monitorar oferta dos serviços no Município", concluida: false }
            ]
          }
        ]
      },
      {
        id: "diretriz-1-5",
        numero: 5,
        nome: "Qualificar e Ampliar a Assistência Farmacêutica",
        objetivo: "Integrar a Assistência Farmacêutica às demais políticas de saúde, ampliando o acesso e garantindo o uso racional de medicamentos e insumos.",
        metas: [
          {
            id: "meta-34", numero: 34, descricao: "Ampliar o acesso em 30% e garantir o uso racional de medicamentos e insumos", indicador: "Percentual de ampliação e garantia de acesso a medicação", metaPlano2026: "30%", meta_plano_2025: "20%", unidadeMedida: "Percentual", acoes: [
              { id: "a34-1", descricao: "Monitorar dispensação das medicações", concluida: false },
              { id: "a34-2", descricao: "Realizar visita domiciliar para controle do consumo de medicações", concluida: false },
              { id: "a34-3", descricao: "Recolher do domicílio medicações que foram suspensas", concluida: false },
              { id: "a34-4", descricao: "Acompanhar ofertar do componente especializado pelo Estado", concluida: false },
              { id: "a34-5", descricao: "Revisar periodicamente a Relação Municipal de Medicamentos Essenciais (REMUME)", concluida: false },
              { id: "a34-6", descricao: "Avaliar o funcionamento do sistema HÓRUS", concluida: false }
            ]
          },
          {
            id: "meta-35", numero: 35, descricao: "Ofertar aos munícipes 85% do Componente Básico da Assistência Farmacêutica", indicador: "Percentual de oferta do Componente Básico", metaPlano2026: "85%", meta_plano_2025: "85%", unidadeMedida: "Percentual", acoes: [
              { id: "a35-1", descricao: "Adquirir no mínimo 85% do componente básico", concluida: false },
              { id: "a35-2", descricao: "Garantir através de aquisição e monitoramento mensalmente de pedido, estoque e abastecimento", concluida: false },
              { id: "a35-3", descricao: "Garantir a Central de Abastecimento Farmacêutico em funcionamento", concluida: false },
              { id: "a35-4", descricao: "Avaliação do cumprimento de indicadores e metas pactuados", concluida: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "eixo-2",
    numero: 2,
    nome: "Gestão em Saúde: Eficiência, Inovação e Participação Social",
    diretrizes: [
      {
        id: "diretriz-2-1",
        numero: 6,
        nome: "Gestão Interfederativa do SUS com Planejamento e Controle Social",
        objetivo: "Fortalecer o processo de planejamento na gestão do SUS e a valorização do trabalhador.",
        metas: [
          {
            id: "meta-36", numero: 36, descricao: "Participar de todas as reuniões da CIR e demais colegiados", indicador: "Número de participações em reuniões CIR/COSEMS", metaPlano2026: "40", meta_plano_2025: "10", unidadeMedida: "Número", acoes: [
              { id: "a36-1", descricao: "Disponibilizar pelo menos um técnico para participar das reuniões CIR/COSEMS", concluida: false }
            ]
          },
          {
            id: "meta-37", numero: 37, descricao: "Elaborar anualmente Programação Anual de Saúde", indicador: "Número de PAS aprovada pelo CMS", metaPlano2026: "4", meta_plano_2025: "1", unidadeMedida: "Número", acoes: [
              { id: "a37-1", descricao: "Realizar reunião de avaliação e elaboração da PAS", concluida: false },
              { id: "a37-2", descricao: "Apresentar ao conselho municipal de saúde a PAS", concluida: false }
            ]
          },
          {
            id: "meta-38", numero: 38, descricao: "Garantir a manutenção de 100% dos serviços do Conselho Municipal de Saúde", indicador: "Número de reuniões ordinárias realizadas", metaPlano2026: "100%", meta_plano_2025: "80%", unidadeMedida: "Porcentagem", acoes: [
              { id: "a38-1", descricao: "Ofertar qualificação para conselheiros de saúde", concluida: false },
              { id: "a38-2", descricao: "Viabilizar participação em Conferências e seminários", concluida: false },
              { id: "a38-3", descricao: "Disponibilizar uma sala com o funcionamento do conselho municipal de Saúde", concluida: false },
              { id: "a38-4", descricao: "Garantir a execução das ações do Conselho Municipal de Saúde", concluida: false },
              { id: "a38-5", descricao: "Realizar visitas aos serviços de saúde", concluida: false }
            ]
          },
          {
            id: "meta-39", numero: 39, descricao: "Ampliar e fortalecer a ouvidoria do SUS", indicador: "Percentual de atendimento das demandas da ouvidoria", metaPlano2026: "90%", meta_plano_2025: "90%", unidadeMedida: "Percentual", acoes: [
              { id: "a39-1", descricao: "Estabelecer uma ligação entre usuário e o órgão público", concluida: false },
              { id: "a39-2", descricao: "Realizar visitas aos setores de saúde", concluida: false },
              { id: "a39-3", descricao: "Receber e tratar as demandas em tempo oportuno", concluida: false },
              { id: "a39-4", descricao: "Identificar as dificuldades pontuadas pelos cidadãos", concluida: false }
            ]
          }
        ]
      },
      {
        id: "diretriz-2-2",
        numero: 7,
        nome: "Gestão do Trabalho e da Educação em Saúde",
        objetivo: "Fortalecer os processos de trabalho e a valorização do trabalhador do SUS.",
        metas: [
          {
            id: "meta-40", numero: 40, descricao: "Garantir o acesso, com melhoria contínua do acolhimento na Secretaria Municipal de Saúde", indicador: "Número de unidade administrativa estruturada", metaPlano2026: "1", meta_plano_2025: "1", unidadeMedida: "Número", acoes: [
              { id: "a40-1", descricao: "Realizar manutenção da estrutura física da Secretaria Municipal de Saúde", concluida: false },
              { id: "a40-2", descricao: "Manter o quadro de profissionais e funcionário de apoio", concluida: false },
              { id: "a40-3", descricao: "Prover insumos para funcionamento adequado dos serviços de saúde", concluida: false }
            ]
          },
          {
            id: "meta-41", numero: 41, descricao: "Ofertar capacitações de educação permanente para profissionais da SMS", indicador: "Percentual de profissionais capacitados", metaPlano2026: "80%", meta_plano_2025: "80%", unidadeMedida: "Percentual", acoes: [
              { id: "a41-1", descricao: "Realização de uma triagem com as principais necessidades", concluida: false },
              { id: "a41-2", descricao: "Organizar um cronograma anual de capacitações", concluida: false }
            ]
          }
        ]
      }
    ]
  }
];

// Funções auxiliares mantidas
export function getTotalMetas(): number {
  return pasData.reduce((total, eixo) => total + eixo.diretrizes.reduce((subtotal, diretriz) => subtotal + diretriz.metas.length, 0), 0);
}

export function getMetasAtingidas(quadrimestre: 1 | 2 | 3): number {
  let count = 0;
  pasData.forEach(eixo => {
    eixo.diretrizes.forEach(diretriz => {
      diretriz.metas.forEach(meta => {
        const resultado = quadrimestre === 1 ? meta.resultado1QDM : quadrimestre === 2 ? meta.resultado2QDM : meta.resultado3QDM;
        const metaStr = meta.meta_plano_2025 || meta.metaPlano2026 || '0';
        const metaValue = parseFloat(metaStr.replace('%', '').replace(',', '.'));
        if (resultado !== null && resultado !== undefined && resultado >= metaValue) count++;
      });
    });
  });
  return count;
}

export function getAcoesPendentes(): number {
  let count = 0;
  pasData.forEach(eixo => { eixo.diretrizes.forEach(diretriz => { diretriz.metas.forEach(meta => { meta.acoes.forEach(acao => { if (!acao.concluida) count++; }); }); }); });
  return count;
}

export function getAcoesTotal(): number {
  let count = 0;
  pasData.forEach(eixo => { eixo.diretrizes.forEach(diretriz => { diretriz.metas.forEach(meta => { count += meta.acoes.length; }); }); });
  return count;
}

export function getProgressoByEixo(): { eixo: string; progresso: number; total: number }[] {
  return pasData.map(eixo => {
    let metasAtingidas = 0, totalMetas = 0;
    eixo.diretrizes.forEach(diretriz => {
      diretriz.metas.forEach(meta => {
        totalMetas++;
        const resultado = meta.resultado2QDM || meta.resultado1QDM;
        const metaStr = meta.meta_plano_2025 || meta.metaPlano2026 || '0';
        const metaValue = parseFloat(metaStr.replace('%', '').replace(',', '.'));
        if (resultado !== null && resultado !== undefined && resultado >= metaValue) metasAtingidas++;
      });
    });
    return { eixo: `Eixo ${eixo.numero}`, progresso: metasAtingidas, total: totalMetas };
  });
}

export function getMetaStatus(meta: Meta, quadrimestre: 1 | 2 | 3): 'atingida' | 'parcial' | 'abaixo' | 'pendente' {
  const resultado = quadrimestre === 1 ? meta.resultado1QDM : quadrimestre === 2 ? meta.resultado2QDM : meta.resultado3QDM;
  if (resultado === null || resultado === undefined) return 'pendente';
  const metaStr = meta.meta_plano_2025 || meta.metaPlano2026 || '0';
  const metaValue = parseFloat(metaStr.replace('%', '').replace(',', '.'));
  if (resultado >= metaValue) return 'atingida';
  if (resultado >= metaValue * 0.8) return 'parcial';
  return 'abaixo';
}
