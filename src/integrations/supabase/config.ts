const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ??
  "";

export const requiredSupabaseEnvVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY (ou VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY)",
] as const;

export const hasSupabaseEnv =
  SUPABASE_URL.length > 0 && SUPABASE_PUBLISHABLE_KEY.length > 0;

export const supabaseEnvError = hasSupabaseEnv
  ? null
  : `As variáveis ${requiredSupabaseEnvVars.join(
      " e ",
    )} precisam estar definidas para iniciar o app.`;

export { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL };
