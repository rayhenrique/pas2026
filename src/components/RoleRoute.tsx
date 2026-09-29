import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

type AppRole = "superadmin" | "admin" | "coordenador" | "gestor";

interface RoleRouteProps {
    children: React.ReactNode;
    allowedRoles: AppRole[];
}

export function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { role, loading: roleLoading } = useUserRole();

    if (authLoading || roleLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground">Verificando permissões...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <ProtectedRoute>
          {!role || !allowedRoles.includes(role as AppRole) ? (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="card-elevated p-8 max-w-md text-center">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-8 h-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h1>
                    <p className="text-muted-foreground mb-6">
                        Você não tem permissão para acessar esta página.
                    </p>
                    <Link to="/dashboard">
                        <Button>Voltar ao Dashboard</Button>
                    </Link>
                </div>
            </div>
          ) : children}
        </ProtectedRoute>
    );
}
