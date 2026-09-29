import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { MissingSupabaseConfig } from "@/components/MissingSupabaseConfig";
import { hasSupabaseEnv } from "@/integrations/supabase/config";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {hasSupabaseEnv ? <App /> : <MissingSupabaseConfig />}
  </React.StrictMode>
);
