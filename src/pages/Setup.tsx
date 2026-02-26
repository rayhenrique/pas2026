import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Loader2, CheckCircle2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Setup() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkAdminExists = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id")
        .in("role", ["admin", "superadmin"])
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setHasAdmin(true);
        // Redirect to dashboard if admin exists
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (error) {
      console.error("Error checking admin:", error);
    } finally {
      setChecking(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isAuthenticated) {
      checkAdminExists();
    }
  }, [isAuthenticated, authLoading, navigate, checkAdminExists]);

  const handleMakeAdmin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "make-admin" },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Configuração concluída!",
        description: "Você agora é administrador do sistema.",
      });

      navigate("/admin");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao configurar acesso inicial.";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Verificando configuração...</p>
        </div>
      </div>
    );
  }

  if (hasAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card-elevated p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Sistema já configurado</h1>
          <p className="text-muted-foreground mb-4">
            Já existe um administrador no sistema. Redirecionando...
          </p>
          <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card-elevated p-8 max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Configuração Inicial
          </h1>
          <p className="text-muted-foreground">
            PAS Digital - Teotônio Vilela
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Primeiro Acesso Detectado
                </h3>
                <p className="text-sm text-muted-foreground">
                  O sistema não possui um administrador configurado. 
                  Como você é o primeiro usuário, pode se tornar o administrador.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Seu perfil será configurado como:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Acesso total ao sistema
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Gerenciamento de usuários
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Visualização de todos os dados
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Lançamento de resultados
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Logado como: <span className="font-medium text-foreground">{user?.email}</span>
            </p>
            <Button 
              onClick={handleMakeAdmin} 
              className="w-full gap-2"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Shield className="w-5 h-5" />
              )}
              Tornar-me Administrador
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
