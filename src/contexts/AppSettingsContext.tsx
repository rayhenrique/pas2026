import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppSettings {
  id: string;
  app_name: string;
  municipality: string;
  slogan: string;
  current_year: number;
}

interface AppSettingsContextType {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<AppSettings>) => Promise<boolean>;
  refetch: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  id: "",
  app_name: "PAS Digital",
  municipality: "Teotônio Vilela",
  slogan: "Programação Anual de Saúde",
  current_year: 2026,
};

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: defaultSettings,
  loading: true,
  error: null,
  updateSettings: async () => false,
  refetch: async () => { },
});

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("app_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        // Se não encontrar configurações ou erro de rede, usa o padrão
        if (fetchError.code === "PGRST116" || fetchError.code === "406") {
          setSettings(defaultSettings);
        } else {
          // Ignora outros erros silenciosamente e usa padrão
          console.warn("Aviso ao carregar configurações:", fetchError);
          setSettings(defaultSettings);
        }
      } else if (data) {
        setSettings(data as AppSettings);
      } else {
        setSettings(defaultSettings);
      }
      setError(null);
    } catch (err: unknown) {
      // Ignora erros silenciosamente e usa configurações padrão
      console.warn("Erro ao carregar configurações:", err);
      setSettings(defaultSettings);
      setError(null); // Não mostrar erro
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>): Promise<boolean> => {
    if (!settings?.id) return false;

    try {
      const { error: updateError } = await supabase
        .from("app_settings")
        .update(updates)
        .eq("id", settings.id);

      if (updateError) throw updateError;

      setSettings((prev) => (prev ? { ...prev, ...updates } : prev));

      toast({
        title: "Configurações atualizadas",
        description: "As alterações foram salvas com sucesso.",
      });

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar configurações.";
      console.error("Erro ao atualizar configurações:", err);
      toast({
        title: "Erro ao salvar",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        updateSettings,
        refetch: fetchSettings,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings deve ser usado dentro de AppSettingsProvider");
  }
  return context;
}
