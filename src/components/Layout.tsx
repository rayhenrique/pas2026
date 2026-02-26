import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardEdit,
  FileSpreadsheet,
  Menu,
  X,
  Activity,
  ChevronRight,
  LogOut,
  User,
  Users,
  Shield,
  Settings,
  Cog,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { role, isAdmin, isSuperadmin, isGestor, loading: roleLoading } = useUserRole();
  const { settings } = useAppSettings();
  const { toast } = useToast();

  // Itens base de navegação
  const baseNavItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/lancamento", icon: ClipboardEdit, label: "Lançamento" },
    { to: "/relatorio", icon: FileSpreadsheet, label: "Relatório" },
  ];

  // Adiciona itens de admin apenas quando confirmado (não durante loading)
  const navItems = [
    ...baseNavItems,
    ...((isAdmin || isSuperadmin) && !roleLoading ? [
      { to: "/gerenciar-pas", icon: Settings, label: "Gerenciar PAS" },
      { to: "/admin", icon: Users, label: "Usuários" },
    ] : []),
    ...((isAdmin || isSuperadmin || isGestor) && !roleLoading ? [
      { to: "/backup-auditoria", icon: Database, label: "Backup & Auditoria" },
    ] : []),
    ...(isSuperadmin && !roleLoading ? [
      { to: "/configuracoes", icon: Cog, label: "Configurações" },
    ] : []),
  ];

  const roleLabels: Record<string, string> = {
    superadmin: "Super Admin",
    admin: "Administrador",
    coordenador: "Coordenador",
    gestor: "Gestor",
  };

  const handleSignOut = async () => {
    try {
      // Limpar cache do localStorage relacionado a roles
      localStorage.removeItem('user_role_cache');

      await signOut();

      // Redirecionar primeiro para evitar erros
      navigate("/");

      toast({
        title: "Sessão encerrada",
        description: "Você saiu do sistema com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Forçar redirect mesmo em caso de erro
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden gradient-header px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6" />
            <span className="font-semibold">{settings?.app_name}</span>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-sidebar z-50 transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                  <Activity className="w-6 h-6 text-sidebar-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-sidebar-foreground">{settings?.app_name}</h1>
                  <p className="text-xs text-sidebar-foreground/60">{settings?.municipality} - {settings?.current_year}</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <X className="w-5 h-5 text-sidebar-foreground" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "nav-link group",
                    isActive && "nav-link-active"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                  )} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-sidebar-primary" />
                  )}
                </Link>
              );
            })}

            {/* Skeleton loader enquanto verifica permissões */}
            {roleLoading && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
            )}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            {user && (
              <div className="px-4 py-3 rounded-lg bg-sidebar-accent/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                    {roleLoading ? (
                      <Skeleton className="w-4 h-4 rounded-full" />
                    ) : isSuperadmin ? (
                      <Cog className="w-4 h-4 text-sidebar-foreground" />
                    ) : isAdmin ? (
                      <Shield className="w-4 h-4 text-sidebar-foreground" />
                    ) : (
                      <User className="w-4 h-4 text-sidebar-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user.email}
                    </p>
                    {roleLoading ? (
                      <Skeleton className="h-3 w-16 mt-1" />
                    ) : (
                      <p className="text-xs text-sidebar-foreground/60">
                        {role ? roleLabels[role] : "Usuário"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair do Sistema</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <div className="flex-1 p-4 lg:p-8">
          {children}
        </div>

        {/* Footer */}
        <footer className="p-4 lg:p-8 pt-0">
          <div className="flex items-center justify-center gap-2 py-4 border-t border-border">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Activity className="w-4 h-4" />
              <span>PAS {settings?.current_year}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Prefeitura Municipal de {settings?.municipality}
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
