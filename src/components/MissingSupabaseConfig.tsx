import { AlertTriangle, FileCode2 } from "lucide-react";
import { requiredSupabaseEnvVars } from "@/integrations/supabase/config";

export function MissingSupabaseConfig() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
        <div className="w-full rounded-3xl border bg-card p-8 shadow-sm">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Configuração local do Supabase pendente
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            O frontend iniciou, mas não encontrou as variáveis de ambiente do
            Supabase. Em vez de quebrar com tela branca, o app agora mostra esta
            instrução para facilitar o bootstrap local.
          </p>

          <div className="mt-6 rounded-2xl border bg-muted/30 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <FileCode2 className="h-4 w-4" />
              Arquivo sugerido: <code>.env.local</code>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-background p-4 text-sm">
{`${requiredSupabaseEnvVars[0]}=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel
# ou
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sua-chave-publicavel`}
            </pre>
          </div>

          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p>1. Crie um arquivo <code>.env.local</code> na raiz do projeto.</p>
            <p>2. Preencha a URL e a publishable key do seu projeto Supabase.</p>
            <p>3. Reinicie o Vite com <code>npm run dev</code>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
