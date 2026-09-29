// Seed gerado a partir do arquivo oficial MATRIZ DOMI PMS 2026-2029.
// Fonte utilizada: C:/Users/rayhe/Downloads/MATRIZ DOMI PMS 2026 2029 TV ATUALIZADA.docx

export interface SeedMeta {
  codigo: string;
  numero: number;
  descricao: string;
  indicador: string;
  metaPlano2026: string;
  unidadeMedida: string;
  acoes: string[];
}

export interface SeedDiretriz {
  codigo: string;
  numero: number;
  nome: string;
  objetivo: string;
  metas: SeedMeta[];
}

export interface SeedEixo {
  numero: number;
  nome: string;
  diretrizes: SeedDiretriz[];
}

export const pasDataSeed: SeedEixo[] = [
  {
    "numero": 1,
    "nome": "Fortalecer a atenção primária à saúde, vigilância em saúde e a assistência farmacêutica, como estratégias fundamentais para a promoção, prevenção, cuidado e monitoramento das condições de saúde da população, promovendo a ampliação do acesso, a qualificação da atenção e o alcance das metas dos indicadores nacionais da Atenção Primária em saúde (APS)",
    "diretrizes": [
      {
        "numero": 1,
        "codigo": "1.1",
        "nome": "Objetivo 1.1 - Aumentar a resolutividade e a efetividade das ações da APS",
        "objetivo": "Aumentar a resolutividade e a efetividade das ações da APS, por meio do monitoramento e melhoria contínua dos indicadores pactuados, com ênfase na prevenção de doenças crônicas, ampliação da cobertura de pré-natal adequado, rastreamento do câncer, e acompanhamento de condições prioritárias",
        "metas": [
          {
            "codigo": "1.1.1",
            "numero": 1,
            "descricao": "Ampliar o acesso da população cadastrada aos atendimentos por demanda programada na Atenção Primária à Saúde, consolidando o vínculo e o acompanhamento longitudinal dos usuários pelas equipes de Saúde da Família, com base em planejamento territorial, qualificação do agendamento, ampliação de oferta de consultas e integração dos diversos pontos de atenção da Rede de Saúde",
            "indicador": "Mais acesso à Atenção Primária à Saúde. (Indicador C1 - Mais Acesso à Atenção Primária à Saúde (APS) - PT GM MS 3493/2024. Ótimo: >50% e <=70% Bom: >30% e <=50% Suficiente: >10% e <=30% Regular: <=10% ou >70%",
            "metaPlano2026": "35%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Revisar e organizar a agenda das equipes de Saúde da Família para equilibrar atendimentos de demanda espontânea e programada;",
              "Ampliar a estratificação de risco da população cadastrada, priorizando o seguimento regular de grupos vulneráveis (crianças, gestantes, hipertensos, diabéticos etc.);",
              "Acompanhar mensalmente o número e tipo de atendimentos realizados."
            ]
          },
          {
            "codigo": "1.1.2",
            "numero": 2,
            "descricao": "Promover a atuação multiprofissional e intersetorial voltada à vigilância do desenvolvimento, à orientação parental, à atualização do calendário vacinal e à detecção precoce de agravos e atrasos, consolidando a APS como espaço de cuidado contínuo e promotor de um início de vida saudável",
            "indicador": "Cuidado no desenvolvimento infantil na Atenção Primária à Saúde. (Indicador C2 - Cuidado no desenvolvimento infantil) - PT GM MS 3493/2024 Ótimo: >75% a 100% Bom: >50% <=75% Suficiente: >25% e <=50% Regular: 0 a 25%",
            "metaPlano2026": "55%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Realizar busca ativa semanal de recém-nascidos no território pelas equipes de Saúde da Família, com apoio dos Agentes Comunitários de Saúde (ACS);",
              "Ampliar a estratificação de risco da população cadastrada, priorizando o seguimento regular de grupos vulneráveis (crianças, gestantes, hipertensos, diabéticos etc.);",
              "Desenvolver ações educativas com gestantes durante o pré-natal, orientando sobre a importância da 1ª consulta do bebê nas primeiras semanas de vida;",
              "Acompanhar mensalmente o indicador, com retorno às equipes de saúde sobre o desempenho, promovendo ajustes e apoio técnico;",
              "Realizar a primeira consulta de puericultura até o 30º dia de vida, com profissional médico ou enfermeiro;",
              "Realiza 9 consultas de acompanhamento do desenvolvimento infantil em crianças menores de 2 anos;",
              "Implantar agenda programada de puericultura nas unidades de saúde;",
              "Registrar em crianças menores de 2 anos 9 ou mais registros de peso e altura em consultas de puericultura;",
              "Realização de rodas de conversa e orientações individuais com famílias sobre a importância do acompanhamento do crescimento;",
              "Realizar pelo menos 2 visitas domiciliares por ACS/TACS em crianças menores de 6 meses com domiciliares realizadas por",
              "Monitorar mensalmente o indicador no SIAPS e nas planilhas da APS;",
              "Realizar busca ativa de crianças com vacinas em atraso, com apoio dos ACS/TACS;",
              "Promover campanhas locais de multivacinação e atualização da caderneta;",
              "Monitorar mensalmente a cobertura vacinal por equipe e território."
            ]
          },
          {
            "codigo": "1.1.7",
            "numero": 7,
            "descricao": "Fortalecer o cuidado integral à gestante e à puérpera na Atenção Primária, garantindo pré-natal oportuno, acompanhamento multiprofissional e continuidade do cuidado no puerpério, com ênfase no acolhimento, na detecção precoce de riscos e na integração com a rede materno-infantil para promoção de gestação segura e parto humanizado",
            "indicador": "Cuidado na Gestação e Puerpério na Atenção Primária à Saúde (APS). (Indicador C3 - Cuidado à Gestante e Puérpera) - PT GM MS 3493/2024. Ótimo: >75% a 100% Bom: >50% <=75% Suficiente: >25% e <=50% Regular: 0 a 25%",
            "metaPlano2026": "55%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Realizar consulta de pré-natal em gestantes até a 12ª semana de gestação;",
              "Qualificar o acolhimento na Atenção Primária à Saúde (APS);",
              "Realizar capacitação contínua dos profissionais sobre boas práticas no cuidado pré-natal;",
              "Integrar ACS/TACS no monitoramento territorial, notificando precocemente casos de gravidez suspeita ou confirmada;",
              "Monitorar mensalmente a cobertura do pré-natal nas unidades de saúde.",
              "Realizar pelo menos 7 consultas de pré-natal durante a gestação;",
              "Realizar pelo menos 7 registros de pressão arterial durante a gest ação;",
              "Promoção de ações educativas visando sensibilizar gestantes sobre a importância do monitoramento da pressão arterial para prevenção de complicações, como pré-eclâmpsia;",
              "Realizar capacitação contínua dos profissionais sobre boas práticas no cuidado pré-natal;",
              "Realizar pelo menos 7 registros simultâneos de peso e altura em gestantes durante o pré-natal;",
              "Fortalecer o papel dos ACS/TACS no acompanhamento contínuo das gestantes;",
              "Promover capacitações regulares dos ACS/TACS sobre saúde materna, reforçando a importância do acompanhamento pré-natal e os cuidados com a gestante e o bebê;",
              "Integrar o calendário vacinal ao acompanhamento pré-natal nas UBS, com um olhar criterioso na 20 semana de gestação, na aplicação da vacina dTpa;",
              "Fortalecer a atuação dos ACS/TACS na orientação sobre vacinação;",
              "Realiza rtestes rápidos ou exames laboratoriais para sífilis, HIV, hepatite B e hepatite Cno primeiro e último trimestre da gestação;",
              "Garantir disponibilidade contínua de testes rápidos e insumos laboratoriais nas UBS;",
              "Realizar busca ativa das puérperas logo após a alta hospitalar;",
              "Realizar consulta presencial ou remota durante o puerpério realizada por médico ou enfermeiro;",
              "Realizar visita domiciliar por ACS/TACS durante o puerpério;",
              "Realizar avaliação por cirurgião-dentista durante a gestação;",
              "Garantir a inserção da saúde bucal nas rotinas do pré-natal nas Unidades de Saúde da Família;",
              "Realiz ar busca ativa de gestantes que ainda não realizaram avaliação odontológica;"
            ]
          },
          {
            "codigo": "1.1.18",
            "numero": 18,
            "descricao": "Fortalecer o cuidado contínuo da pessoa com diabetes na Atenção Primária, assegurando o acompanhamento regular, o controle glicêmico adequado e a prevenção de complicações, por meio do monitoramento clínico, da educação em saúde, do apoio ao autocuidado e da integração com os demais níveis de atenção",
            "indicador": "Cuidado da pessoa com diabetes na Atenção Primária à Saúde (Indicador C4 - Cuidado da Pessoa com Diabetes) - PT GM MS 3493/2024. Ótimo: >75% a 100% Bom: >50% <=75% Suficiente: >25% e <=50% Regular: 0 a 25%",
            "metaPlano2026": "55%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Atualizar e qualificar os cadastros das pessoas com diabetes no sistema da APS;",
              "Realizar busca ativa das pessoas com diabetes que não comparecem às consultas no período adequado;",
              "Monitorar e avaliar periodicamente os dados do SIAPS/e-SUS APS quanto ao acompanhamento;",
              "Qualificar o acolhimento na Atenção Primária à Saúde (APS).",
              "Realizar pelo menos um registro de aferição de pressão arterial em pacientes diabéticos;",
              "Capacitar ACS/TACS para ações de promoção do autocuidado, adesão ao tratamento e vigilância em diabetes;",
              "Identificar e priorizar pessoas com diabetes para acompanhamento domiciliar, especialmente aquelas com baixa adesão ou risco aumentado;",
              "Utilizar os dados de IMC para estratificação de risco, priorizando acompanhamento nutricional e multiprofissional no paciente diabético;",
              "Incluir a solicitação de hemoglobina glicada como rotina nas consultas semestrais das pessoas com diabetes;",
              "Inserir a avaliação dos pés como etapa obrigatória nas consultas de rotina de pessoas com diabetes;"
            ]
          },
          {
            "codigo": "1.1.24",
            "numero": 24,
            "descricao": "Aprimorar o cuidado contínuo da pessoa com hipertensão na Atenção Primária, assegurando o acompanhamento regular, o controle adequado da pressão arterial e a prevenção de complicações, por meio do monitoramento clínico, da adesão terapêutica, da educação em saúde e da integração com os demais níveis de atenção para redução de agravos e melhoria da qualidade de vida",
            "indicador": "Cuidado da pessoa com hipertensão na Atenção Primária à Saúde (Indicador C5 - Cuidado da Pessoa com Hipertensão) - PT GM MS 3493/2024. Ótimo: >75% a 100% Bom: >50% <=75% Suficiente: >25% e <=50% Regular: 0 a 25%",
            "metaPlano2026": "55%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Organizar a agenda das equipes da ESF para garantir o agendamento regular de pessoas com hipertensão;",
              "Ampliar o uso de tecnologias para consultas remotas (teleconsulta), especialmente em áreas com difícil acesso;",
              "Monitorar regularmente o cumprimento da meta nas microáreas, com apoio da coordenação da Atenção Básica;",
              "Realizar busca ativa dos usuários com hipertensão que estão sem acompanhamento no período adequado;",
              "Realiza visitas domiciliares ao paciente hipertenso por ACS/TACS, com intervalo mínimo de 30 dias;",
              "Identificar e priorizar pessoas com hipertensão para acompanhamento domiciliar, especialmente aquelas com baixa adesão ou risco aumentado;",
              "Utilizar os dados de IMC para estratificação de risco, priorizando acompanhamento nutricional e multiprofissional do paciente hipertenso;"
            ]
          },
          {
            "codigo": "1.1.28",
            "numero": 28,
            "descricao": "Aprimorar o cuidado integral à pessoa idosa na Atenção Primária, assegurando acompanhamento periódico, avaliação funcional e prevenção de agravos, com foco na promoção da autonomia, na detecção precoce de fragilidades e na integração com a rede de atenção para garantir envelhecimento saudável e qualidade de vida",
            "indicador": "Cuidado Integral à Pessoa Idosa na Atenção Primária à Saúde (APS). (Indicador C6 - Cuidado da Pessoa Idosa) - PT GM MS 3493/2024. Ótimo: >75% a 100% Bom: >50% <=75% Suficiente: >25% e <=50% Regular: 0 a 25%",
            "metaPlano2026": "55%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Implementar protocolos de cuidado à pessoa idosa, integrando saúde mental, uso de medicamentos e prevenção de quedas;",
              "Realizar busca ativa de idosos sem consulta registrada no último ano;",
              "Monitorar regularmente o cumprimento da meta nas microáreas, com apoio da coordenação da Atenção Básica;",
              "Qualificar o acolhimento na Atenção Primária à Saúde (APS).",
              "Utilizar os dados de IMC para estratificação de risco, priorizando acompanhamento nutricional e multiprofissional do paciente idoso;",
              "Planejar visitas programadas para todas as pessoas idosas, com prioridade para aquelas em situação de vulnerabilidade;",
              "Garantir que as visitas sejam devidamente registradas no sistema e-SUS, com controle de intervalo entre elas;",
              "Realizar visita domiciliar a pessoa idosa por ACS, com intervalo mínimo de 30 dias, nos últimos 12 meses.",
              "Realizar campanhas anuais de vacinação com enfoque na população idosa."
            ]
          },
          {
            "codigo": "1.1.32",
            "numero": 32,
            "descricao": "Fortalecer as ações de rastreamento e prevenção do câncer de colo do útero na Atenção Primária, assegurando acesso equitativo e acolhedor a mulheres e homens transgênero, com oferta regular de exames, acompanhamento dos resultados e encaminhamento oportuno, promovendo cuidado integral, respeito à diversidade e redução de agravos evitáveis",
            "indicador": "Cuidado da mulher e do homem transgênero na prevenção do câncer na Atenção Primária à Saúde (APS). (Indicador C7 - Cuidado da Mulher na Prevenção do Câncer) - PT GM MS 3493/2024 Ótimo: >75% a 100% Bom: >50% <=75% Suficiente: >25% e <=50% Regular: 0 a 25%",
            "metaPlano2026": "55%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Atualizar e qualificar o cadastro das mulheres nas faixas etárias-alvo;",
              "Realizar ações educativas sobre saúde sexual e reprodutiva;",
              "Garantir oferta contínua de exames citopatológicos;",
              "Monitorar mensalmente os indicadores por equipe e microárea, com uso de painéis de acompanhamento.",
              "Aplicar vacina HPV em mulheres entre 9 e 14 anos, com pelo menos uma dose;",
              "Realizar consulta (presencial ou remoto) em mulheres de 14 a 69 anos relacionado à saúde sexual e reprodutiva;",
              "Realizar consulta em mulheres de 14 a 69 anos com pelo menos um atendimento (presencial ou remoto) relacionado à saúde sexual e reprodutiva;",
              "Solicitar ou avaliar mamografia em mulheres entre 50 e 69 anos."
            ]
          },
          {
            "codigo": "1.1.36",
            "numero": 36,
            "descricao": "Ampliar o acesso da população às ações de saúde bucal na Atenção Primária, garantindo a realização da primeira consulta odontológica programática como porta de entrada para o cuidado continuado, com foco na prevenção, no diagnóstico precoce e na promoção da saúde bucal vinculada às equipes de Saúde da Família",
            "indicador": "Cobertura de Primeira Consulta Programática por equipe de Saúde Bucal (eSB) 40 (quarenta) horas vinculada à equipe de Saúde da Família/equipe de Atenção Primária (eSF/eAP) de referência. (Indicador B1 - Primeira Consulta Odontológica Programada) - PT GM MS 3493/2024. Ótimo: >5% Bom: >3% <=5% Suficiente: >1% e <=3% Regular: <=1%",
            "metaPlano2026": "4%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Ampliar a oferta de consultas odontológicas programáticas nas equipes de Saúde Bucal;",
              "Integrar a agenda de saúde bucal com as ações do ACS e equipe de enfermagem;",
              "Fortalecer o vínculo e continuidade do cuidado após a primeira consulta."
            ]
          },
          {
            "codigo": "1.1.37",
            "numero": 37,
            "descricao": "Aprimorar a qualidade do cuidado odontológico na Atenção Primária, assegurando a conclusão dos tratamentos iniciados e o acompanhamento integral dos usuários, com foco na resolutividade, na continuidade do cuidado e na promoção da saúde bucal vinculada às equipes de Saúde da Família",
            "indicador": "Razão de tratamentos odontológicos concluídos entre os iniciados pelas equipes de Saúde Bucal. (Indicador B2 - Tratamento Concluído) - PT GM MS 3493/2024. Ótimo: >75% a 100% Bom: >50% <=75% Suficiente: >25% e <=50% Regular: 0 a 25%",
            "metaPlano2026": "55%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Organizar o agendamento e o plano terapêutico para garantir a continuidade das consultas;",
              "Realizar monitoramento mensal dos indicadores de conclusão por equipe de eSB;",
              "Integrar ações de saúde bucal com os demais pontos da rede de atenção à saúde."
            ]
          },
          {
            "codigo": "1.1.38",
            "numero": 38,
            "descricao": "Reduzir a proporção de exodontias na Atenção Primária, promovendo ações preventivas e tratamentos restauradores que preservem a saúde bucal e a funcionalidade dentária, com foco na ampliação do cuidado integral, na resolutividade clínica e na melhoria da qualidade de vida dos usuários",
            "indicador": "Taxa de exodontias por equipe de Saúde Bucal. (Indicador B3 - Taxa de Exodontia) - PT GM MS 3493/2024 Ótimo: >=8% e <10% Bom: >=10% e <12% Suficiente: >=12% e <14% Regular: <8% ou >=14%",
            "metaPlano2026": "11%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Ampliar o acesso aos procedimentos restauradores e preventivos, reduzindo a dependência de exodontias;",
              "Intensificar ações educativas com a população sobre autocuidado e prevenção da perda dentária;",
              "Acompanhar mensalmente a taxa de exodontias por equipe."
            ]
          },
          {
            "codigo": "1.1.39",
            "numero": 39,
            "descricao": "Ampliar as ações de promoção da saúde bucal junto ao público escolar, garantindo a realização regular de escovações supervisionadas pelas equipes de Saúde Bucal, com foco na prevenção de cáries, no desenvolvimento de hábitos saudáveis e na integração das práticas educativas ao cotidiano das escolas do território",
            "indicador": "Escovação Supervisionada por equipes de Saúde Bucal (eSB) 40 (quarenta) horas, em faixa etária escolar (de 6 a 12 anos), inserida à equipe Saúde da Família/equipe de Atenção Primária (eSF/eAP) de referência. (Indicador B4 - Escovação Supervisionada em faixa etária escolar de 6 a 12 anos) - PT GM MS 3493/2024. Ótimo: >1% Bom: >0,5% <=1% Suficiente: >= 0,25% e < 0,5% Regular: <=0,25%",
            "metaPlano2026": "0, 6%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Estabelecer cronograma mensal de visitas escolares com foco em promoção da saúde;",
              "Incluir as ações de escovação supervisionada nos planos de ação das equipes de Saúde Bucal;",
              "Acompanhar mensalmente a taxa de exodontias por equipe;",
              "Distribuir kits de escovação para crianças participantes das atividades."
            ]
          },
          {
            "codigo": "1.1.40",
            "numero": 40,
            "descricao": "Ampliar a realização de procedimentos odontológicos preventivos na Atenção Primária, priorizando a promoção da saúde bucal e a redução de agravos, por meio de ações educativas, profiláticas e de acompanhamento regular, fortalecendo a prevenção como eixo central do cuidado odontológico",
            "indicador": "Procedimentos odontológicos preventivos realizados pela equipe de Saúde Bucal (eSB) 40 (quarenta) horas inserida na Atenção Primária à Saúde (APS). (Indicador B5 - Procedimentos Odontológicos preventivos na APS) - PT GM MS 3493/2024 Ótimo: >=80% e <=85% Bom: >=60% e <80% Suficiente: >=40% e <60% Regular: <40% ou >85%",
            "metaPlano2026": "65%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Garantir disponibilidade contínua de insumos para ações preventivas (flúor, escovas, materiais educativos);",
              "Incluir orientações de saúde bucal em todas as consultas com a equipe multiprofissional;",
              "Qualificar os registros no e-SUS APS dos procedimentos preventivos realizados;",
              "Monitorar mensalmente a proporção de procedimentos preventivos por equipe."
            ]
          },
          {
            "codigo": "1.1.41",
            "numero": 41,
            "descricao": "Aprimorar a oferta de Tratamentos Restauradores Atraumáticos (ART) na Atenção Primária, priorizando intervenções minimamente invasivas que preservem a estrutura dentária, promovam o cuidado integral e resolutivo e fortaleçam a prevenção e a educação em saúde bucal",
            "indicador": "Percentual de procedimentos de ART realizados por ano nas equipes de Saúde Bucal da APS. (Indicador B6 - Tratamento Restaurador Atraumático) - PT GM MS 3493/2024. Ótimo: >8% Bom: >6% <=8% Suficiente: >3% e <=6% Regular: <=3%",
            "metaPlano2026": "7%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Ampliar os registros no e-SUS APS dos procedimentos realizados com essa técnica;",
              "Capacitar as equipes de Saúde Bucal na técnica de Tratamento Restaurador Atraumático (ART);",
              "Monitorar mensalmente a proporção de procedimentos ART por equipe."
            ]
          },
          {
            "codigo": "1.1.42",
            "numero": 42,
            "descricao": "Aprimorar a atenção integral oferecida pelas equipes multiprofissionais na Atenção Primária, garantindo acompanhamento contínuo por meio de atendimentos individuais e coletivos, com foco na promoção da saúde, prevenção de agravos e fortalecimento do cuidado coordenado e resolutivo",
            "indicador": "Média de atendimentos realizados por pessoa cadastrada nas equipes multiprofissionais (eMulti), por ano. (Indicador M1 - Média de Atendimentos por pessoa por e-Multi) - PT GM MS 3493/2024. Ótimo: >3% Bom: >2% <=3% Suficiente: >1% e <=2% Regular: <=1%",
            "metaPlano2026": "3%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Instituir e fortalecer o matriciamento entre eMulti e eSF em todos os territórios;",
              "Estimular a realização de atendimentos compartilhados (dois ou mais profissionais) com registro no e-SUS;",
              "Acompanhar mensalmente os dados de ações interprofissionais por equipe e território."
            ]
          },
          {
            "codigo": "1.1.43",
            "numero": 43,
            "descricao": "Ampliar progressivamente o número de ações interprofissionais realizadas pelas equipes multiprofissionais (eMulti)",
            "indicador": "Número de ações interprofissionais realizadas por eMulti na APS. (Indicador M2 - Ações Interprofissionais realizadas por e-Multi na APS) - PT GM MS 3493/2024. Ótimo: >5% Bom: >2,5% <=5% Suficiente: >1% e <=2,5% Regular: <=1%",
            "metaPlano2026": "3%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Instituir e fortalecer o matriciamento entre eMulti e eSF em todos os territórios;",
              "Estimular a realização de atendimentos compartilhados (dois ou mais profissionais) com registro no e-SUS;",
              "Acompanhar mensalmente os dados de ações interprofissionais por equipe e território."
            ]
          },
          {
            "codigo": "1.1.44",
            "numero": 44,
            "descricao": "Garantir que todas as unidades de saúde ofereçam infraestrutura adequada, acessível e segura, capaz de ampliar a capacidade de atendimento e melhorar a resolutividade dos serviços prestados à população",
            "indicador": "Percentual de Unidades de Saúde reformadas e/ou ampliadas. [(número de unidades de saúde da atenção primária reformadas e/ou ampliadas)/(número total de unidades de saúde da atenção primária) x 100]",
            "metaPlano2026": "20%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Garantir os profissionais necessários para o funcionamento das equipes de Atenção Básica;",
              "Manter os profissionais das equipes de Atenção Primária cadastrados no CNES;"
            ]
          },
          {
            "codigo": "1.1.45",
            "numero": 45,
            "descricao": "Assegurar que todas as unidades de saúde disponham de equipamentos atualizados e funcionais, inclusive logísticos, promovendo atendimento eficiente, seguro e compatível com as demandas clínicas e diagnósticas da população",
            "indicador": "Percentual de Unidades de Saúde equipadas adequadamente para a prestação de serviços seguros e resolutivos. [(número de unidades de saúde da atenção primária com parque tecnológico modernizado)/(número total de unidades de saúde da atenção primária) x 100]",
            "metaPlano2026": "70%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Garantir os profissionais necessários para o funcionamento dos postos de apoio as equipes de Atenção Primária;"
            ]
          },
          {
            "codigo": "1.1.46",
            "numero": 46,
            "descricao": "Ampliar o acesso da população aos serviços de Atenção Primária, entregando novas unidades de saúde plenamente estruturadas, equipadas e operacionais, capazes de oferecer atendimento contínuo, seguro e resolutivo",
            "indicador": "Número de novas Unidades de Saúde da Atenção Primária entregues e funcionando",
            "metaPlano2026": "0",
            "unidadeMedida": "Número",
            "acoes": [
              "Garantir os profissionais necessários para o funcionamento dos postos de apoio as equipes de Atenção Primária;"
            ]
          },
          {
            "codigo": "1.1.48",
            "numero": 48,
            "descricao": "Assegurar veículos para transporte das equipes da estratégia Saúde da Família e Multiprofissional",
            "indicador": "Número de veículos disponibilizados para transporte das equipes da Atenção Primária áSaúde",
            "metaPlano2026": "2",
            "unidadeMedida": "Número",
            "acoes": [
              "Garantir custeio para aquisição e ou locação, manutenção de transporte para a atenção primária."
            ]
          },
          {
            "codigo": "1.1.49",
            "numero": 49,
            "descricao": "Ampliar o percentual de acompanhamento das condicionalidades de Saúde do Programa Auxílio Brasil",
            "indicador": "Cobertura de acompanhamento das condicionalidades de Saúde do Programa Auxílio Brasil",
            "metaPlano2026": "90%",
            "unidadeMedida": "Percentual",
            "acoes": []
          },
          {
            "codigo": "1.1.50",
            "numero": 50,
            "descricao": "Realizar ações de saúde na escola por meio da execução do Termo de Compromisso do Programa Saúde na Escola (PSE)",
            "indicador": "Percentual de escolas com atividades do PSE desenvolvidas no ano",
            "metaPlano2026": "95%",
            "unidadeMedida": "Percentual",
            "acoes": []
          },
          {
            "codigo": "1.1.50",
            "numero": 50,
            "descricao": "Reduzir o número de casos de mortalidade infantil",
            "indicador": "Número de casos de Mortalidade Infantil",
            "metaPlano2026": "4",
            "unidadeMedida": "Número",
            "acoes": [
              "Manter do comitê de Mortalidade Materno e Infantil, com reuniões de acorda as demandas de investigações;",
              "Realização de reuniões periódicas para discussões de casos e possíveis adequações de conduta;",
              "Fortalecer as ações de prevenção da gravidez na adolescência, através do PSE e APAR (programa municipal);",
              "Prestar assistência adequada durante pré-natal, parto e puerpério."
            ]
          },
          {
            "codigo": "1.1.51",
            "numero": 51,
            "descricao": "Manter em zero o número de casos de mortalidade materna",
            "indicador": "Número de casos de mortalidade materna",
            "metaPlano2026": "0",
            "unidadeMedida": "Número",
            "acoes": [
              "Prestar assistência adequada durante pré-natal, parto e puerpério;",
              "Assegurar o acesso aos exames e consultas de pré-natal;",
              "Garantir o acesso as consultas obstétricas compartilhada com a equipe multidisciplinar do Espeço Vida, a gestantes de risco intermediário e de alto risco;",
              "Atualização dos protocolos assistenciais."
            ]
          },
          {
            "codigo": "1.1.52",
            "numero": 52,
            "descricao": "Reduzir a proporção de casos de gravidez na adolescência",
            "indicador": "Proporção de gravidez na adolescência entre as faixas etárias de 10 a 19 anos",
            "metaPlano2026": "20%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Realização de grupos do APAR para trabalhar a saúde sexual;",
              "Realização de orientações nas unidades de saúde quanto a prevenção da gravidez e os meios disponíveis."
            ]
          },
          {
            "codigo": "1.1.53",
            "numero": 53,
            "descricao": "Reduzir a quantidade de internações por causas sensíveis à Atenção Primária",
            "indicador": "Proporção de internamentos por causas sensíveis à Atenção Primária à Saúde",
            "metaPlano2026": "15%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Promover a busca ativa ao público para acompanhamento com equipes multidisciplinar",
              "Articular com as unidades de saúde busca ativa da população nessa faixa etária;",
              "Garantir o acesso aos medicamentos de uso contínuo nas Equipe de Atenção Primária a Saúde."
            ]
          },
          {
            "codigo": "1.1.54",
            "numero": 54,
            "descricao": "Reduzir o número de óbitos prematuros (de 30 a 69 anos) pelo conjunto das quatro principais doenças crônicas não transmissíveis (doenças do aparelho circulatório, câncer, diabetes e doenças respiratórias crônicas)",
            "indicador": "Número de óbitos prematuros (de 30 a 69 anos) pelo conjunto das quatro principais doenças crônicas não transmissíveis (doenças do aparelho circulatório, câncer, diabetes e doenças respiratórias crônicas)",
            "metaPlano2026": "20",
            "unidadeMedida": "Número",
            "acoes": [
              "Promover a busca ativa ao público para acompanhamento com equipes multidisciplinar",
              "Articular com as unidades de saúde busca ativa da população nessa faixa etária;",
              "Garantir o acesso aos medicamentos de uso contínuo nas Equipe de Atenção Primária a Saúde."
            ]
          },
          {
            "codigo": "1.1.55",
            "numero": 55,
            "descricao": "Garantir a oferta de serviços e especialidades no CEO proporcionando a integralidade do cuidado em saúde bucal",
            "indicador": "Nº de especialidades odontológicas Disponíveis",
            "metaPlano2026": "5",
            "unidadeMedida": "Número",
            "acoes": [
              "Mentar a contratação de cirurgiões dentistas nas especialidades Endodontia, Periondontia, Prótese Dentária, Estomatologia e Cirurgião Bucomaxilofacial para atender os pacientes que necessitam de tratamento especializado."
            ]
          },
          {
            "codigo": "1.1.55",
            "numero": 55,
            "descricao": "Garantir a reabilitação por meio do uso de próteses dentárias e da necessidade de se garantir uma assistência integral em saúde bucal,",
            "indicador": "Nº de confecção de próteses dentárias, de acordo com uma faixa de produção credenciada (Portaria n° 599, de 23 de março de 2006)",
            "metaPlano2026": "20",
            "unidadeMedida": "Número",
            "acoes": [
              "Ampliar a oferta de próteses dentárias de qualidade, promovendo a reabilitação protética, fonética, mastigatória e estética da população de Teotônio Vilela, de forma gratuita por meio do Sistema Público de Saúde."
            ]
          }
        ]
      },
      {
        "numero": 2,
        "codigo": "1.2",
        "nome": "Objetivo 1.2 - Ampliar e qualificar as ações de vigilância epidemiológica",
        "objetivo": "Ampliar e qualificar as ações de vigilância epidemiológica, sanitária, ambiental, da saúde do trabalhador e da saúde da população exposta a riscos, visando melhorar o desempenho nos indicadores do PQAVS e garantir a resposta oportuna às demandas do território",
        "metas": [
          {
            "codigo": "1.2.1",
            "numero": 1,
            "descricao": "Ampliar a cobertura vacinal das vacinas selecionadas do Calendário Nacional de Vacinação para crianças menores de dois anos de idade - Pentavalente (3ª dose), pneumocócica 10-valente (2ª dose), Poliomielite (3ª dose) e Tríplice viral (1ª dose)",
            "indicador": "Proporção de vacinas selecionadas do Calendário Nacional de Vacinação para crianças menores de dois anos de idade - Pentavalente (3ª dose), pneumocócica 10-valente (2ª dose), Poliomielite (3ª dose) e Tríplice viral (1ª dose) - com cobertura vacinal preconizada. (INDICADOR 4 - PQAVS)",
            "metaPlano2026": "80%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Realização de campanhas locais voltadas à conscientização dos pais e responsáveis sobre a importância da vacinação;",
              "Elaborar o plano de ação da imunização e acompanhar a execução do mesmo."
            ]
          },
          {
            "codigo": "1.2.2",
            "numero": 2,
            "descricao": "Ampliar para 75% a proporção de análises realizadas para o residual de agente desinfetante em água para consumo humano",
            "indicador": "Proporção de análises realizadas para o residual de agente desinfetante em água para consumo humano (parâmetro: cloro residual livre, cloro residual combinado ou dióxido de cloro). (INDICADOR 5 - PQAVS)",
            "metaPlano2026": "75%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Elaboração e implementação de um cronograma municipal de coletas e análises de água;",
              "Fortalecimento da vigilância da qualidade da água (Vigiagua);",
              "Acompanhamento mensal das metas de coletas e análises."
            ]
          },
          {
            "codigo": "1.2.3",
            "numero": 3,
            "descricao": "90% de registros de óbitos alimentados no SIM até 60 dias após o final do mês de ocorrência",
            "indicador": "Proporção de registros de óbitos alimentados no SIM em relação ao estimado, recebidos na base federal em até 60 dias após o final do mês de ocorrência (INDICADOR 1 - PQAVS)",
            "metaPlano2026": "90%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Capacitação contínua dos profissionais responsáveis pelo preenchimento e alimentação do SIM;",
              "Acompanhamento e monitoramento mensal dos prazos de alimentação do SIM;"
            ]
          },
          {
            "codigo": "1.2.4",
            "numero": 4,
            "descricao": "90% de registros de nascidos vivos alimentados no SINASC até 60 dias após o final do mês de ocorrência",
            "indicador": "Proporção de registros de nascidos vivos alimentados no SINASC em relação ao estimado, recebidos na base federal em até 60 dias após o final do mês de ocorrência (INDICADOR 2 - PQAVS)",
            "metaPlano2026": "90%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Capacitação contínua dos profissionais responsáveis pelo preenchimento e alimentação do SINASC;",
              "Acompanhamento e monitoramento mensal dos prazos de alimentação do SINASC;"
            ]
          },
          {
            "codigo": "1.2.5",
            "numero": 5,
            "descricao": "Realizar visitas aos imóveis em pelo menos 04 ciclos de visitas domiciliares, dos 6 preconizados, com mínimo de 80% de cobertura de imóveis visitados para controle vetorial da dengue",
            "indicador": "Número de ciclos que atingiram mínimo de 80% de cobertura de imóveis visitados para controle vetorial da dengue (INDICADOR 8 - PQAVS)",
            "metaPlano2026": "4",
            "unidadeMedida": "Número",
            "acoes": [
              "Capacitação e qualificação dos Agentes de Combate às Endemias (ACE);",
              "Monitoramento e avaliação da cobertura das visitas."
            ]
          },
          {
            "codigo": "1.2.6",
            "numero": 6,
            "descricao": "Ampliar a proporção de contatos dos casos novos de hanseníase, nos anos das coortes examinados",
            "indicador": "Proporção de contatos examinados de casos novos de hanseníase (INDICADOR 9 - PQAVS)",
            "metaPlano2026": "82%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Capacitação das equipes de saúde para busca ativa e exame dos contatos;",
              "Registro e monitoramento dos contatos examinados;",
              "Articulação entre atenção básica, vigilância epidemiológica e referência especializada para encaminhamento dos contatos positivo;"
            ]
          },
          {
            "codigo": "1.2.7",
            "numero": 7,
            "descricao": "70% dos contatos dos casos novos de tuberculose pulmonar com confirmação laboratorial examinados",
            "indicador": "Proporção de contatos examinados de casos novos de tuberculose pulmonar com confirmação laboratorial. (INDICADOR 10 - PQAVS)",
            "metaPlano2026": "70%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Capacitação das equipes de saúde para busca ativa e exame dos contatos;",
              "Monitoramento e registro sistemático dos contatos examinados;",
              "Integração entre atenção básica, vigilância e serviços especializados.",
              "Garantir que todas as gestantes façam o teste de sífilis na primeira consulta e em gestação tardia (preferencialmente até 28 e 36 semanas);",
              "Monitorar a adesão ao tratamento das gestantes e parceiros;"
            ]
          },
          {
            "codigo": "1.2.9",
            "numero": 9,
            "descricao": "Reduzir o número de óbitos precoces por AIDS",
            "indicador": "Número de óbitos precoces pela aids na população residente em determinado espaço geográfico, no ano considerado. (INDICADOR 12 - PQAVS)",
            "metaPlano2026": "3",
            "unidadeMedida": "Número",
            "acoes": [
              "Garantia do acesso e adesão ao tratamento antirretroviral (TARV);",
              "Fortalecimento da vigilância epidemiológica;"
            ]
          },
          {
            "codigo": "1.2.10",
            "numero": 10,
            "descricao": "Incentivar e monitorar as notificações de agravos relacionados à Saúde do Trabalhador garantindo o correto preenchimento do campo ocupação em pelo menos 95% das notificações",
            "indicador": "Proporção de preenchimento do campo “ocupação” nas notificações de agravos relacionados ao trabalho. (INDICADOR 13 - PQAVS)",
            "metaPlano2026": "95%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Aumentar e qualificar as fontes notificadoras de agravos relacionados ao trabalho;",
              "Realizar busca ativa nas unidades de saúde para garantir as notificações de agravos relacionados ao trabalho."
            ]
          },
          {
            "codigo": "1.2.11",
            "numero": 11,
            "descricao": "95% de notificações de violência interpessoal e autoprovocada com o campo raça/cor preenchido com informação válida",
            "indicador": "Proporção de notificações de violência interpessoal e autoprovocada com o campo raça/cor preenchido com informação válida (INDICADOR 14 - PQAVS)",
            "metaPlano2026": "95%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Alimentar o Sistema de Informação de Agravos de Notificação (SINAN) com todas as informações devidamente preenchidas;",
              "Monitorar as notificações de Violência interpessoal/autoprovocada;",
              "Realizar busca ativa nas Redes de Saúde, Rede de Assistência Social, CRAS, CREAS, Setor de Atenção à Mulher, Conselho Tutelar, Rede de Educação (Creche, escola), Conselho do Idoso, Delegacia (atendimento idoso, mulher, criança e adolescente);"
            ]
          }
        ]
      }
    ]
  },
  {
    "numero": 2,
    "nome": "Fortalecer a organização e a integração das Redes de Atenção à saúde no município, com foco na regionalização, na equidade, na resolutividade dos serviços e na qualificação dos fluxos de regulação, referência e contrarreferência",
    "diretrizes": [
      {
        "numero": 1,
        "codigo": "2.1",
        "nome": "Objetivo 2.1 - Ampliar o acesso da população aos serviços de saúde em todos os níveis de complexidade",
        "objetivo": "Ampliar o acesso da população aos serviços de saúde em todos os níveis de complexidade, por meio da articulação entre os pontos de atenção das redes, da melhoria da regulação e da utilização do prontuário eletrônico como instrumento de integração do cuidado",
        "metas": [
          {
            "codigo": "1.2.11",
            "numero": 11,
            "descricao": "Garantir a livre circulação das pessoas com problemas mentais pelos serviços, pela comunidade e pela cidade",
            "indicador": "Ações de matriciamento sistemático realizadas por CAPS com equipes de Atenção Básica. [(Nº de CAPS com pelo menos 12 registros de matriciamento da Atenção Básica no ano)/(total de CAPS habilitados)] x 100",
            "metaPlano2026": "100%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Matriciamento em Saúde Mental com equipe do CAPS I, equipe dos leitos em saúde mental do hospital municipal e demais profissionais da rede, principalmente da atenção primária, através de encontros periódicos com temas diversos para estudo e discussão de casos."
            ]
          },
          {
            "codigo": "1.2.12",
            "numero": 12,
            "descricao": "Construção de sede própria do CAPS I",
            "indicador": "Número de sede própria do CAPS Iconstruído",
            "metaPlano2026": "0",
            "unidadeMedida": "Número",
            "acoes": [
              "Fornecer subsídios aos gestores para construção de um espaço digno através elaboração do projeto de construção, respaldado nas portarias: Portaria GM/MS n. 3.088/2011 e na Portaria GM/MS n. 615, de 15 de abril de 2013."
            ]
          },
          {
            "codigo": "1.2.13",
            "numero": 13,
            "descricao": "Garantir o atendimento das demandas de saúde mental por meio de profissionais especialistas",
            "indicador": "Número de especialistas em saúde mental",
            "metaPlano2026": "2",
            "unidadeMedida": "Número",
            "acoes": [
              "Realizar um acolhimento empático, escuta cuidadosa e atendimento qualificad o;",
              "Realiza visitas domiciliares, sala de espera, grupos terapêuticos;",
              "Realização ações em alusão ao setembro amarelo com o intuito de diminuir os índices de suicídio no município e aumentar a oferta de atendimentos em saúde mental na rede municipal;",
              "Realizar atendimentos em saúde mental em e spaços comunitários e abertos, como o Centros de Convivência e Cultura (CECO), visando fortalecer vínculos sociais, combater o estigma e promover a autonomia de pessoas com sofrimento mental, sem necessidade de encaminhamento prévio."
            ]
          },
          {
            "codigo": "1.2.15",
            "numero": 15,
            "descricao": "Manutenção do Centro de Especialidade em Reabilitação",
            "indicador": "Número de Centro de Especialidade em Reabilitação funcionando",
            "metaPlano2026": "1",
            "unidadeMedida": "Número",
            "acoes": [
              "Realizar um acolhimento empático, escuta cuidadosa e atendimento qualificad o a todos os pacientes do CER;",
              "Ofertar reabilitação física, intelectual, auditiva e visual aos pacientes do município de Teotônio Vilela;",
              "Realização ações em alusão ao setembro amarelo com o intuito de diminuir os índices de suicídio no município e aumentar a oferta de atendimentos em saúde mental na rede municipal;",
              "Realizar manutenção predial, de equipamentos (tecnologia assistiva) e a gestão técnica.",
              "Ofertar a valiação multiprofissional (médica, enfermagem, fisioterapia, fonoaudiologia, terapia ocupacional, psicologia, serviço social, entre outros)."
            ]
          },
          {
            "codigo": "1.2.16",
            "numero": 16,
            "descricao": "Aumentar a proporção de partos normais realizados no SUS e Saúde Suplementar",
            "indicador": "Proporção de partos normais no SUS e na Saúde Suplementar",
            "metaPlano2026": "45%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Realizar testagem rápida trimestralmente e testagem rápida no parceiro;",
              "Garantir acesso aos exames, como VDRL, para diagnóstico precoce e intervenções necessárias;",
              "Incentivar e viabilizar a visita das gestantes a maternidade onde serão realizados os partos no município;"
            ]
          },
          {
            "codigo": "1.2.17",
            "numero": 17,
            "descricao": "Ampliar a assistência ao pré-natal de baixo risco, com acompanhamento integral da gestante e parceiro",
            "indicador": "Proporção de gestantes atendidas pelo espaço vida. (número de gestantes atendidas pelo espaço vida/pelo número de gestantes no período x 100)",
            "metaPlano2026": "60%",
            "unidadeMedida": "Proporção",
            "acoes": [
              "Realizar um acolhimento empático, escuta cuidadosa e atendimento qualificad o a tod as as gestantes e puérperas;",
              "Assegurar o acesso aos exames e consultas especializada de pacientes referenciada para o espaço vida no município de Teotônio Vilela."
            ]
          },
          {
            "codigo": "1.2.18",
            "numero": 18,
            "descricao": "Manter em zero o número de casos novos de sífilis congênita em menores de um ano de idade",
            "indicador": "Número de casos de sífilis congênita em menores de um ano de idade",
            "metaPlano2026": "0",
            "unidadeMedida": "Número",
            "acoes": [
              "Realizar testagem rápida em todas as gestantes trimestralmente, como a do seu parceiro;",
              "Garantir acesso ao tratamento das gestantes diagnosticadas com sífilis durante o pré-natal."
            ]
          }
        ]
      }
    ]
  },
  {
    "numero": 3,
    "nome": "Promoção da Assistência Farmacêutica de forma Resolutiva e Responsável",
    "diretrizes": [
      {
        "numero": 1,
        "codigo": "3.1",
        "nome": "Objetivo 3.1 - Garantir a necessária segurança",
        "objetivo": "Garantir a necessária segurança, eficácia e qualidade dos medicamentos, a promoção do uso racional e o acesso da população àqueles considerados essenciais",
        "metas": [
          {
            "codigo": "1.3.1",
            "numero": 1,
            "descricao": "Assegurar medicamentos, correlatos e insumos para os 25 estabelecimentos de saúde municipal",
            "indicador": "Número de estabelecimento de saúde abastecid o com medicamentos, correlatos e insumos",
            "metaPlano2026": "25",
            "unidadeMedida": "Número",
            "acoes": [
              "Realizar levantamento de demanda considerando as necessidades multissetoriais da atenção primária em saúde;",
              "Avaliação do cumprimento de indicadores e metas pactuados, tendo em vista a concessão de incentivo financeiro anual para os profissionais da CAF.",
              "Garantir através de aquisição (CONISUL e ATA PRÓPRIA estoque e abastecimento frente as unidades solicitantes da rede municipal totalizando 25 (vinte e cinco) estabelecimentos."
            ]
          },
          {
            "codigo": "1.3.2",
            "numero": 2,
            "descricao": "Estruturar a Central de Assistência Farmacêutica – CAF com equipamentos e materiais permanentes para qualificar a distribuições de medicamentos, correlatos e insumos",
            "indicador": "Número de Centrais de Abastecimento estruturadas no período",
            "metaPlano2026": "1",
            "unidadeMedida": "Número",
            "acoes": [
              "Realizar levantamento de demanda considerando as necessidades multissetoriais da atenção primária em saúde;",
              "Realizar levantamento de demanda considerando as necessidades multissetoriais dos serviços de média complexidade municipal;",
              "Avaliação do cumprimento de indicadores e metas pactuados, tendo em vista a concessão de incentivo financeiro anual para os profissionais da CAF.",
              "Garantir através de aquisição (CONISUL e ATA PRÓPRIA estoque e abastecimento frente as unidades solicitantes da rede municipal totalizando 25 (vinte e cinco) estabelecimentos."
            ]
          },
          {
            "codigo": "1.3.3",
            "numero": 3,
            "descricao": "Atualizar a Relação Municipal de Medicamentos Essenciais – REMUME",
            "indicador": "Número de REMUME atualizada",
            "metaPlano2026": "1",
            "unidadeMedida": "Número",
            "acoes": [
              "Realizar levantamento de demanda considerando as necessidades multissetoriais da atenção primária em saúde;",
              "Realizar levantamento de demanda considerando as necessidades multissetoriais dos serviços de média complexidade municipal;",
              "Avaliação do cumprimento de indicadores e metas pactuados, tendo em vista a concessão de incentivo financeiro anual para os profissionais da CAF.",
              "Garantir através de aquisição (CONISUL e ATA PRÓPRIA estoque e abastecimento frente as unidades solicitantes da rede municipal totalizando 25 (vinte e cinco) estabelecimentos."
            ]
          },
          {
            "codigo": "1.3.3",
            "numero": 3,
            "descricao": "Manter sistema informatizado para acompanhamento da distribuição de medicamentos, correlatos e insumos",
            "indicador": "Número de sistemas informatizados para acompanhamento da distribuição de medicamentos, correlatos e insumos mantidos",
            "metaPlano2026": "1",
            "unidadeMedida": "Número",
            "acoes": [
              "Realizar levantamento de demanda considerando as necessidades multissetoriais da atenção primária em saúde;",
              "Realizar levantamento de demanda considerando as necessidades multissetoriais dos serviços de média complexidade municipal;",
              "Avaliação do cumprimento de indicadores e metas pactuados, tendo em vista a concessão de incentivo financeiro anual para os profissionais da CAF.",
              "Garantir através de aquisição (CONISUL e ATA PRÓPRIA estoque e abastecimento frente as unidades solicitantes da rede municipal totalizando 25 (vinte e cinco) estabelecimentos."
            ]
          }
        ]
      }
    ]
  },
  {
    "numero": 4,
    "nome": "Ampliação do acesso e aperfeiçoamento da assistência ambulatorial e hospitalar especializada",
    "diretrizes": [
      {
        "numero": 1,
        "codigo": "4.1",
        "nome": "Objetivo 4.1 - Melhorar a qualidade do serviço e atendimento na Assistência Ambulatorial e Hospitalar Especializada",
        "objetivo": "Melhorar a qualidade do serviço e atendimento na Assistência Ambulatorial e Hospitalar Especializada, com ampliação do serviço ofertado e melhoria das condições estruturais/materiais e de atendimento",
        "metas": [
          {
            "codigo": "1.4.1",
            "numero": 1,
            "descricao": "Garantir as condições necessárias para o funcionamento do Hospital Municipal Nossa Senhora das Graças (UMNSG)",
            "indicador": "Número de unidade hospitalar funcionando",
            "metaPlano2026": "1",
            "unidadeMedida": "Número",
            "acoes": [
              "Manter a uniformização dos Colaboradores da UMNSG;",
              "Garantir manutenção das instalações físicas da UMNSG;",
              "Ampliar o número de equipamentos para garantir a assistência e funcionamento do Serviço da UMNSG;",
              "Contratualizar Serviço Especializado em manutenção Preventiva e Corretiva para Equipamentos Hospitalar da UMNSG;",
              "Garantir insumos para manutenção de Cirurgias eletivas realizadas no Centro Cirúrgico da UMNSG;",
              "Implantar Arquivo Hospitalar Digital para Prontuário de pacientes atendidos na UMNSG",
              "Avaliação do cumprimento de indicadores e metas pactuados, tendo em vista a concessão de incentivo financeiro anual para os profissionais do hospital;",
              "Renovar suprimentos de informática da UMNSG, como computadores, impressoras etc."
            ]
          },
          {
            "codigo": "1.4.2",
            "numero": 2,
            "descricao": "Garantir as condições de funcionamento do Serviço de Atenção Domiciliar – SAD",
            "indicador": "Número de equipe de SAD funcionando",
            "metaPlano2026": "1",
            "unidadeMedida": "Número",
            "acoes": [
              "Avaliação do cumprimento de indicadores e metas pactuados, tendo em vista a concessão de incentivo financeiro anual para os profissionais do SAD."
            ]
          },
          {
            "codigo": "1.4.3",
            "numero": 3,
            "descricao": "Garantir as condições necessárias para o funcionamento Centro de Diagnóstico Dra Teresa de Medeiros Pacheco",
            "indicador": "Número de Centro de Diagnóstico funcionando",
            "metaPlano2026": "1",
            "unidadeMedida": "Número",
            "acoes": [
              "Avaliação do cumprimento de indicadores e metas pactuados, tendo em vista a concessão de incentivo financeiro anual para os profissionais do centro de diagnóstico"
            ]
          },
          {
            "codigo": "1.4.3",
            "numero": 3,
            "descricao": "Garantir a manutenção e funcionamento da Base Descentralizada do SAMU",
            "indicador": "Número de Base Descentralizada do SAMU funcionando",
            "metaPlano2026": "1",
            "unidadeMedida": "Número",
            "acoes": [
              "Avaliação do cumprimento de indicadores e metas pactuados, tendo em vista a concessão de incentivo financeiro anual para os profissionais do centro de diagnóstico"
            ]
          },
          {
            "codigo": "1.4.4",
            "numero": 4,
            "descricao": "Fortalecer o acesso da população às consultas especializadas, assegurando organização da regulação municipal, ampliação da oferta por meio de contratação e articulação regional, e qualificação dos fluxos de referência e contrarreferência, com foco na redução de filas, na priorização de casos de maior risco e na melhoria da continuidade do cuidado",
            "indicador": "Percentual de consultas especializadas realizadas. [(Nº de consultas especializadas realizadas no ano)/(total de consultas especializadas demandas)] x 100",
            "metaPlano2026": "60%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Ampliar o acesso e qualificar o atendimento especializado no município, por meio da Oferta de Cuidado Integrado (OCI), assegurando cuidado integral, contínuo e articulado com a Atenção Primária à Saúde;",
              "Manter atualizados os registros nos sistemas oficiais de informação do SUS, especialmente o SIH/SUS (Sistema de Informações Hospitalares), o SIA/SUS (Sistema de Informações Ambulatoriais) e o SIOPS, garantindo a comprovação da produção e da execução dos recursos."
            ]
          },
          {
            "codigo": "1.4.4",
            "numero": 4,
            "descricao": "Qualificar o acesso aos exames da atenção especializada, assegurando a realização tempestiva, análise adequada e registro sistemático das informações nos sistemas oficiais de saúde, com aprimoramento dos fluxos de regulação e garantia de retorno dos resultados à Atenção Primária para continuidade do cuidado",
            "indicador": "Percentual de exames da atenção à saúde especializada realizados, analisados e registrados. [(Nº de consultas especializadas realizadas no ano)/(total de consultas especializadas demandas)] x 100",
            "metaPlano2026": "60%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Ampliar o acesso e qualificar o atendimento especializado no município, por meio da Oferta de Cuidado Integrado (OCI), assegurando cuidado integral, contínuo e articulado com a Atenção Primária à Saúde;",
              "Manter atualizados os registros nos sistemas oficiais de informação do SUS, especialmente o SIH/SUS (Sistema de Informações Hospitalares), o SIA/SUS (Sistema de Informações Ambulatoriais) e o SIOPS, garantindo a comprovação da produção e da execução dos recursos."
            ]
          },
          {
            "codigo": "1.4.6",
            "numero": 6,
            "descricao": "Qualificar o serviço de Atenção Especializada nas unidades de Média e Alta Complexidade com a aquisição de equipamentos e materiais permanentes",
            "indicador": "Número de Unidades de Média e Alta Complexidade estruturadas com equipamentos e materiais permanentes suficientes para atender a demanda",
            "metaPlano2026": "5",
            "unidadeMedida": "Número",
            "acoes": [
              "Garantir a manutenção das unidades de média complexidade;",
              "Adequar a estrutura física dos serviços de saúde, de acordo com levantamento efetivado da gestão, de modo a garantir o acesso aos usuários do SUS, bem como melhoria da ambiência."
            ]
          },
          {
            "codigo": "1.4.7",
            "numero": 7,
            "descricao": "Adquirir ambulância para simples remoção",
            "indicador": "Número de ambulâncias adquiridas",
            "metaPlano2026": "1",
            "unidadeMedida": "Número",
            "acoes": []
          },
          {
            "codigo": "1.4.7",
            "numero": 7,
            "descricao": "Garantir assistência a todos os usuários do Programa de Tratamento de Saúde Fora do Domicílio",
            "indicador": "% Usuários atendidos (PT GM MS 055, DE 24 DE FEVEREIRO DE 1999)",
            "metaPlano2026": "80%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Manutenção e aprimoramento do serviço de TFD"
            ]
          },
          {
            "codigo": "1.4.8",
            "numero": 8,
            "descricao": "Qualificar a oferta de cirurgias eletivas, assegurando maior agilidade no acesso, organização do fluxo assistencial e melhoria do cuidado pré e pós-operatório",
            "indicador": "Percentual de cirurgias eletivas realizadas. [(Número de cirurgias eletivas realizadas)/(Total de cirurgias eletivas agendadas)] x 100",
            "metaPlano2026": "60%",
            "unidadeMedida": "Percentual",
            "acoes": []
          }
        ]
      }
    ]
  },
  {
    "numero": 5,
    "nome": "Valorização e desenvolvimento da força de trabalho em saúde - Promover educação permanente, valorização profissional e gestão participativa",
    "diretrizes": [
      {
        "numero": 1,
        "codigo": "5.1",
        "nome": "Objetivo 5.1 - Fortalecer a qualificação",
        "objetivo": "Fortalecer a qualificação, a motivação e o engajamento da força de trabalho em saúde, por meio da ampliação de ações de educação permanente, valorização profissional, condições de trabalho adequadas e estímulo à gestão participativa, visando aprimorar a qualidade da atenção prestada à população",
        "metas": [
          {
            "codigo": "1.5.1",
            "numero": 1,
            "descricao": "Fortalecer a Política de Educação Permanente em Saúde por meio de atividades realizadas com os profissionais do município",
            "indicador": "Número de atividades de Educação Permanente em Saúde realizadas no período",
            "metaPlano2026": "10",
            "unidadeMedida": "Número",
            "acoes": []
          },
          {
            "codigo": "1.5.2",
            "numero": 2,
            "descricao": "Implementar ações de caráter permanente voltados à saúde do trabalhador",
            "indicador": "Número de ações voltadas à Saúde do Trabalhador",
            "metaPlano2026": "5",
            "unidadeMedida": "Número",
            "acoes": [
              "Garantir, por meio do projeto “cuidando de quem cuida” ações de promoção em saúde para os trabalhadores da saúde do município de Teotônio Vilela;",
              "Realizar parcerias com instituições de ensino para ações de educação em saúde, com foco no trabalhador."
            ]
          }
        ]
      }
    ]
  },
  {
    "numero": 6,
    "nome": "Fortalecer os espaços de participação popular e o controle social no SUS, assegurando o funcionamento efetivo e transparente do Conselho Municipal de Saúde e promovendo maior envolvimento da comunidade nas decisões sobre a saúde pública",
    "diretrizes": [
      {
        "numero": 1,
        "codigo": "6.1",
        "nome": "Objetivo 6.1 - Ampliar a participação da população nas instâncias de controle social e aprimorar os mecanismos de comunicação entre o Conselho Municipal de Saúde",
        "objetivo": "Ampliar a participação da população nas instâncias de controle social e aprimorar os mecanismos de comunicação entre o Conselho Municipal de Saúde, os gestores e a sociedade civil, garantindo a transparência e a efetividade nas deliberações da política municipal de saúde",
        "metas": [
          {
            "codigo": "1.6.1",
            "numero": 1,
            "descricao": "Realizar 11 Reuniões Ordinárias do Conselho Municipal de Saúde previstas no Calendário do CMS",
            "indicador": "Quantidade de Reuniões Ordinárias realizadas",
            "metaPlano2026": "11",
            "unidadeMedida": "Número",
            "acoes": [
              "Apoiar o processo de formação e manutenção do Conselho Municipal de Saúde;",
              "Promover a capacitação permanente de todos os membros do Conselho Municipal de Saúde;",
              "Garantir materiais de consumo, equipamentos necessários ao pleno funcionamento do Conselho Municipal de Saúde."
            ]
          },
          {
            "codigo": "1.6.2",
            "numero": 2,
            "descricao": "Realizar Prestações de Contas Quadrimestrais da Gestão ao Conselho Municipal de Saúde, conforme LC 141/2012",
            "indicador": "Quantidade de Prestações de Contas apresentadas a cada quatro meses - LC 141/12",
            "metaPlano2026": "3",
            "unidadeMedida": "Número",
            "acoes": [
              "Efetivar as apresentações das prestações de contas bimestrais da Secretaria Municipal de Saúde"
            ]
          },
          {
            "codigo": "1.6.3",
            "numero": 3,
            "descricao": "Realizar Conferência Municipal de Saúde",
            "indicador": "Número de Conferências Municipais de Saúde realizadas",
            "metaPlano2026": "0",
            "unidadeMedida": "Número",
            "acoes": []
          },
          {
            "codigo": "1.6.4",
            "numero": 4,
            "descricao": "Realizar Plenária para eleição dos membros do Conselho Municipal de Saúde – CMS",
            "indicador": "Número de Plenárias para eleição dos membros do Conselho Municipal de Saúde realizadas",
            "metaPlano2026": "1",
            "unidadeMedida": "Número",
            "acoes": []
          }
        ]
      }
    ]
  },
  {
    "numero": 7,
    "nome": "Gestão interfederativa do sus, com planejamento ascendente e integrado",
    "diretrizes": [
      {
        "numero": 1,
        "codigo": "7.1",
        "nome": "Objetivo 7.1 - Aperfeiçoar a gestão orçamentária e financeira da saúde",
        "objetivo": "Aperfeiçoar a gestão orçamentária e financeira da saúde, assegurando a aplicação eficiente e transparente dos recursos públicos, bem como a captação de fontes complementares de financiamento para fortalecer a rede municipal de saúde",
        "metas": [
          {
            "codigo": "1.7.1",
            "numero": 1,
            "descricao": "Aplicar no mínimo 15% dos recursos próprios municipais em ações e serviços de saúde",
            "indicador": "% de recursos aplicados - LC 141/12 - CF",
            "metaPlano2026": "15%",
            "unidadeMedida": "Percentual",
            "acoes": [
              "Avaliar a aplicação da receita própria aplicada em ASPS conforme a LC 141/2012."
            ]
          },
          {
            "codigo": "1.7.3",
            "numero": 3,
            "descricao": "Elaborar Programação Anual de Saúde",
            "indicador": "Número de Programações Anuais de Saúde elaboradas e aprovadas pelo CMS",
            "metaPlano2026": "1",
            "unidadeMedida": "Número",
            "acoes": [
              "1.Realizar reunião de avaliação e elaboração da PAS."
            ]
          },
          {
            "codigo": "1.7.3",
            "numero": 3,
            "descricao": "Manter a Ouvidoria Municipal",
            "indicador": "Número de ouvidoria em funcionamento",
            "metaPlano2026": "1",
            "unidadeMedida": "Número",
            "acoes": [
              "Estabelecer uma ligação entre usuário e o órgão público, tirando dúvidas, acatando sugestões e anotando elogios, críticas e denúncias;",
              "Realizar visitas aos setores de saúde, com o objetivo de estimular as manifestações dos usuários a ouvidoria da saúde e garantir a efetivação da participação popular nos serviços prestados, através da Secretaria Municipal de Saúde",
              "Identificar as dificuldades pontuadas pelos cidadãos, quanto ao acesso às ações e serviços de saúde;"
            ]
          },
          {
            "codigo": "1.7.4",
            "numero": 4,
            "descricao": "Participar de todas as reuniões da CIR, e demais colegiados correlatos",
            "indicador": "Número participações da gestão em reuniões da CIR/COSEMS",
            "metaPlano2026": "10",
            "unidadeMedida": "Número",
            "acoes": []
          },
          {
            "codigo": "1.7.4",
            "numero": 4,
            "descricao": "Garantir as condições necessária para o funcionamento das atividades administrativas das da Secretaria Municipal de Saúde",
            "indicador": "Número de Secretaria Municipal de Saúde funcionando",
            "metaPlano2026": "1",
            "unidadeMedida": "Número",
            "acoes": [
              "Avaliação do cumprimento de indicadores e metas pactuados, tendo em vista a concessão de incentivo financeiro anual para os profissionais d a sede."
            ]
          }
        ]
      }
    ]
  },
  {
    "numero": 8,
    "nome": "Inovação, informação e tecnologia em saúde - Expandir o uso de sistemas interoperáveis e dados qualificados para decisão",
    "diretrizes": [
      {
        "numero": 1,
        "codigo": "8.1",
        "nome": "Objetivo 8.1 - Promover a transformação digital na gestão e no cuidado em saúde",
        "objetivo": "Promover a transformação digital na gestão e no cuidado em saúde, garantindo a ampliação do uso de sistemas interoperáveis, a qualificação e segurança das informações em saúde e o fortalecimento da análise de dados para apoiar decisões clínicas e gerenciais, aprimorando a qualidade e a integração da atenção oferecida à população",
        "metas": [
          {
            "codigo": "1.7.1",
            "numero": 1,
            "descricao": "Expandir e qualificar o uso de sistemas eletrônicos de registro de informações em todas as unidades de saúde do município, assegurando a informatização dos processos assistenciais e gerenciais para fortalecer a continuidade do cuidado, a integração dos dados e a tomada de decisão em saúde",
            "indicador": "Percentual de unidades de saúde que utilizam sistemas eletrônicos de registro de informações. [(Número de unidades de saúde com sistemas eletrônicos de registro de informações)/(Total de unidades de saúde do município) x 100]",
            "metaPlano2026": "90%",
            "unidadeMedida": "Percentual",
            "acoes": []
          },
          {
            "codigo": "1.7.1",
            "numero": 1,
            "descricao": "Expandir a infraestrutura tecnológica das unidades de saúde, assegurando a disponibilidade de computadores e dispositivos eletrônicos adequados ao uso de sistemas de informação e ao apoio das atividades assistenciais e administrativas, contribuindo para maior qualidade, agilidade e segurança no cuidado em saúde",
            "indicador": "Percentual de unidades de saúde equipadas com computadores e outros dispositivos eletrônicos. [(Número de unidades de saúde equipadas devidamente com computadores e outros dispositivos eletrônicos)/(Total de unidades de saúde do município) x 100]",
            "metaPlano2026": "90%",
            "unidadeMedida": "Percentual",
            "acoes": []
          }
        ]
      }
    ]
  }
] as const;
