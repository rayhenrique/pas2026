import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleRoute } from "@/components/RoleRoute";
import { AppSettingsProvider } from "@/contexts/AppSettingsContext";
import { TitleUpdater } from "@/components/TitleUpdater";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageSkeleton } from "@/components/LoadingFallback";

// Páginas carregadas imediatamente (rota inicial e auth)
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Lazy loading para páginas protegidas (code splitting)
const Setup = lazy(() => import("./pages/Setup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Lancamento = lazy(() => import("./pages/Lancamento"));
const Relatorio = lazy(() => import("./pages/Relatorio"));
const Admin = lazy(() => import("./pages/Admin"));
const GerenciarPas = lazy(() => import("./pages/GerenciarPas"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const BackupAuditoria = lazy(() => import("./pages/BackupAuditoria"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppSettingsProvider>
      <TooltipProvider>
        <TitleUpdater />
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/setup" element={
                  <ProtectedRoute>
                    <Setup />
                  </ProtectedRoute>
                } />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/lancamento" element={
                  <ProtectedRoute>
                    <Lancamento />
                  </ProtectedRoute>
                } />
                <Route path="/relatorio" element={
                  <ProtectedRoute>
                    <Relatorio />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <RoleRoute allowedRoles={['admin', 'superadmin']}>
                    <Admin />
                  </RoleRoute>
                } />
                <Route path="/gerenciar-pas" element={
                  <RoleRoute allowedRoles={['admin', 'superadmin']}>
                    <GerenciarPas />
                  </RoleRoute>
                } />

                {/* Backup & Auditoria - Acessível por Gestor também */}
                <Route path="/backup-auditoria" element={
                  <RoleRoute allowedRoles={['admin', 'superadmin', 'gestor']}>
                    <BackupAuditoria />
                  </RoleRoute>
                } />

                {/* Superadmin Only Route */}
                <Route path="/configuracoes" element={
                  <RoleRoute allowedRoles={['superadmin']}>
                    <Configuracoes />
                  </RoleRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AppSettingsProvider>
  </QueryClientProvider>
);

export default App;
