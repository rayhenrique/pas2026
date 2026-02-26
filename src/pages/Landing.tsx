import { Link } from "react-router-dom";
import { 
  Activity, 
  BarChart3, 
  ClipboardCheck, 
  FileSpreadsheet, 
  Shield, 
  Users, 
  ArrowRight,
  Target,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/contexts/AppSettingsContext";

const features = [
  {
    icon: BarChart3,
    title: "Dashboard Executivo",
    description: "Visualize o progresso das metas em tempo real com gráficos interativos e indicadores de desempenho.",
  },
  {
    icon: ClipboardCheck,
    title: "Lançamento Simplificado",
    description: "Registre resultados quadrimestrais de forma intuitiva, com checklist de ações e justificativas.",
  },
  {
    icon: FileSpreadsheet,
    title: "Relatórios Consolidados",
    description: "Gere relatórios completos com filtros avançados para acompanhar todas as metas do PAS.",
  },
  {
    icon: Shield,
    title: "Segurança de Dados",
    description: "Acesso controlado por perfil de usuário, garantindo a integridade das informações.",
  },
  {
    icon: Users,
    title: "Gestão de Usuários",
    description: "Coordenadores lançam dados, gestores visualizam e administradores controlam acessos.",
  },
  {
    icon: Target,
    title: "Metas por Eixo",
    description: "Organize as metas por Eixo, Diretriz e Indicador conforme a estrutura oficial do PAS.",
  },
];

const stats = [
  { value: "15+", label: "Metas Monitoradas" },
  { value: "2", label: "Eixos Estratégicos" },
  { value: "4", label: "Diretrizes" },
  { value: "50+", label: "Ações Vinculadas" },
];

export default function Landing() {
  const { settings } = useAppSettings();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">{settings?.app_name}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {settings?.municipality} - {settings?.current_year}
                </p>
              </div>
            </div>
            <Link to="/login">
              <Button variant="default" size="lg" className="gap-2">
                Acessar Sistema
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              Secretaria Municipal de Saúde
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              {settings?.slogan}{" "}
              <span className="text-primary">{settings?.current_year}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Sistema digital para monitoramento e acompanhamento das metas de saúde 
              do município de {settings?.municipality}, Alagoas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="gap-2 px-8 py-6 text-lg">
                  Acessar o Sistema
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#recursos">
                <Button variant="outline" size="lg" className="gap-2 px-8 py-6 text-lg">
                  Conhecer Recursos
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto px-4 lg:px-8 pb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 text-center border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-3xl lg:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Recursos do Sistema
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas completas para gestão eficiente da {settings?.slogan}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 lg:p-8 border border-border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fluxo simplificado para acompanhamento das metas de saúde
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Lançamento</h3>
              <p className="text-muted-foreground">
                Coordenadores registram os resultados alcançados a cada quadrimestre.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-secondary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Análise</h3>
              <p className="text-muted-foreground">
                Sistema calcula automaticamente o status de cada meta (atingida, parcial, abaixo).
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-success-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Acompanhamento</h3>
              <p className="text-muted-foreground">
                Gestores visualizam o progresso geral e tomam decisões baseadas em dados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Pronto para começar?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Acesse o sistema e acompanhe o progresso das metas de saúde do município.
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="gap-2 px-8 py-6 text-lg">
              Fazer Login
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{settings?.app_name} {settings?.current_year}</h3>
                <p className="text-sm text-muted-foreground">Secretaria Municipal de Saúde</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                Prefeitura Municipal de {settings?.municipality}
              </p>
              <p className="text-sm text-muted-foreground">
                Alagoas, Brasil • {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
