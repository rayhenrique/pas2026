import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type AppRole = "superadmin" | "admin" | "coordenador" | "gestor" | null;

const ROLE_CACHE_KEY = "user_role_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

interface RoleCache {
  userId: string;
  role: AppRole;
  timestamp: number;
}

function getCachedRole(userId: string): AppRole | null {
  try {
    const cached = localStorage.getItem(ROLE_CACHE_KEY);
    if (!cached) return null;

    const data: RoleCache = JSON.parse(cached);
    const isValid = 
      data.userId === userId && 
      Date.now() - data.timestamp < CACHE_DURATION;

    return isValid ? data.role : null;
  } catch {
    return null;
  }
}

function setCachedRole(userId: string, role: AppRole): void {
  try {
    const data: RoleCache = { userId, role, timestamp: Date.now() };
    localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignora erros de localStorage
  }
}

function clearCachedRole(): void {
  try {
    localStorage.removeItem(ROLE_CACHE_KEY);
  } catch {
    // Ignora erros
  }
}

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const fetchRoleFromDb = useCallback(async (userId: string): Promise<AppRole> => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data?.role as AppRole) || null;
  }, []);

  // Função para forçar atualização do cache (útil após admin alterar roles)
  const refreshRole = useCallback(() => {
    if (user) {
      clearCachedRole();
      setRoleLoading(true);
      fetchRoleFromDb(user.id)
        .then((fetchedRole) => {
          setRole(fetchedRole);
          setCachedRole(user.id, fetchedRole);
        })
        .catch((error) => {
          console.error("Error fetching role:", error);
          setRole(null);
        })
        .finally(() => {
          setRoleLoading(false);
        });
    }
  }, [user, fetchRoleFromDb]);

  useEffect(() => {
    if (authLoading) {
      setRoleLoading(true);
      return;
    }

    if (!user) {
      setRole(null);
      setRoleLoading(false);
      clearCachedRole();
      return;
    }

    const cachedRole = getCachedRole(user.id);
    if (cachedRole !== null) {
      setRole(cachedRole);
      setRoleLoading(false);
      return;
    }

    let cancelled = false;
    setRoleLoading(true);

    fetchRoleFromDb(user.id)
      .then((fetchedRole) => {
        if (cancelled) return;
        setRole(fetchedRole);
        setCachedRole(user.id, fetchedRole);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error fetching role:", error);
        setRole(null);
      })
      .finally(() => {
        if (cancelled) return;
        setRoleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, fetchRoleFromDb]);

  const loading = authLoading || roleLoading;

  return {
    role,
    loading,
    isSuperadmin: role === "superadmin",
    isAdmin: role === "admin" || role === "superadmin",
    isCoordenador: role === "coordenador",
    isGestor: role === "gestor",
    hasRole: !!role,
    refreshRole,
  };
}

// Função utilitária para invalidar cache de qualquer usuário (para uso pelo admin)
export function invalidateUserRoleCache(): void {
  clearCachedRole();
}
