import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarRange,
  ClipboardCheck,
  FileSpreadsheet,
  Shield,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/contexts/AppSettingsContext";

const features = [
  {
    icon: CalendarRange,
    title: "Ciclo Anual 2026-2029",
    description:
      "Acompanhe o PMS em um modelo anualizado, com metas dinâmicas por ano e histórico preservado ao longo dos quatro anos.",
  },
  {
    icon: ClipboardCheck,
    title: "Lançamento Simplificado",
    description:
      "Coordenadores registram apenas o valor realizado do ano, a análise qualitativa e a conclusão das ações vinculadas.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Executivo",
    description:
      "Monitore status, metas avaliadas, evolução histórica e responsáveis em uma única visão gerencial.",
  },
  {
    icon: FileSpreadsheet,
    title: "Relatórios Consolidados",
    description:
      "Exporte relatórios anuais com filtros por diretriz, responsável e status de atingimento.",
  },
  {
    icon: Target,
    title: "Estrutura Oficial",
    description:
      "Organize o plano na hierarquia Diretriz, Objetivo, Meta e Ação conforme a MATRIZ DOMI PMS 2026-2029.",
  },
  {
    icon: Shield,
    title: "Governança e Controle",
    description:
      "Perfis distintos de acesso, backup do plano e rastreabilidade das avaliações anuais.",
  },
];

const stats = [
  { value: "2026-2029", label: "Ciclo do Plano" },
  { value: "4", label: "Anos Monitorados" },
  { value: "72", label: "Metas Estruturadas" },
  { value: "211", label: "Ações Vinculadas" },
];

export default function Landing() {
  const { settings } = useAppSettings();

  useEffect(() => {
    const appName = settings?.app_name || "PAS Digital";
    const municipality = settings?.municipality || "Teotônio Vilela";
    const slogan = settings?.slogan || "Programação Anual de Saúde";
    const currentYear = settings?.current_year || 2026;
    const title = `${appName} ${currentYear}-${currentYear + 3} | PMS de ${municipality}`;
    const description = `${slogan} com monitoramento anual do PMS ${currentYear}-${currentYear + 3}, metas por ano, avaliações anuais e visão gerencial da saúde municipal de ${municipality}.`;

    document.title = title;

    const ensureMeta = (
      selector: string,
      attributes: Record<string, string>,
      content: string,
    ) => {
      let element = document.head.querySelector(selector) as HTMLMetaElement | null;

      if (!element) {
        element = document.createElement("meta");
        Object.entries(attributes).forEach(([key, value]) => {
          element?.setAttribute(key, value);
        });
        document.head.appendChild(element);
      }

      element.setAttribute("content", content);
    };

    ensureMeta('meta[name="description"]', { name: "description" }, description);
    ensureMeta('meta[property="og:title"]', { property: "og:title" }, title);
    ensureMeta('meta[property="og:description"]', { property: "og:description" }, description);
    ensureMeta('meta[name="twitter:title"]', { name: "twitter:title" }, title);
    ensureMeta('meta[name="twitter:description"]', { name: "twitter:description" }, description);
  }, [settings]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/85 backdrop-blur-md">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">{settings?.app_name}</h1>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  {settings?.municipality} • PMS {settings?.current_year}
                </p>
              </div>
            </div>

            <Link to="/login">
              <Button size="lg" className="gap-2">
                Acessar Sistema
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_42%),radial-gradient(circle_at_bottom_right,hsl(var(--secondary)/0.18),transparent_38%)]" />
        <div className="container relative mx-auto px-4 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <CalendarRange className="h-4 w-4" />
              Monitoramento anual do PMS 2026-2029
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground lg:text-6xl">
              {settings?.slogan} com foco em execução, evidência e evolução anual
            </h1>

            <p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground lg:text-xl">
              Plataforma para acompanhar diretrizes, objetivos, metas e ações da saúde municipal,
              com alvos dinâmicos por ano, avaliações anuais e visão gerencial do plano completo.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/login">
                <Button size="lg" className="gap-2 px-8 py-6 text-lg">
                  Entrar no sistema
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#recursos">
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                  Ver recursos
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border bg-card p-6 text-center shadow-sm"
              >
                <p className="text-3xl font-bold text-primary lg:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="recursos" className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground lg:text-4xl">Recursos do sistema</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Estrutura pensada para o acompanhamento anual do plano, da operação ao nível executivo.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground lg:text-4xl">Como o fluxo anual funciona</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              O mesmo plano permanece estruturado, mas o contexto ativo muda de acordo com o ano selecionado.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Selecionar o ano</h3>
              <p className="text-muted-foreground">
                O ano de referência define os alvos exibidos e os registros anuais consultados no sistema.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-2xl font-bold text-secondary-foreground">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Lançar a avaliação</h3>
              <p className="text-muted-foreground">
                Coordenadores preenchem o valor realizado, a análise qualitativa e marcam as ações concluídas.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success">
                <Users className="h-8 w-8 text-success-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Analisar a evolução</h3>
              <p className="text-muted-foreground">
                Gestores acompanham a situação anual e a evolução da mesma meta ao longo dos quatro anos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-primary-foreground lg:text-4xl">
            Pronto para acompanhar o PMS anual?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/85">
            Entre no sistema e utilize o ano de referência para navegar pela evolução do plano com clareza.
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="mt-8 gap-2 px-8 py-6 text-lg">
              Fazer login
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
