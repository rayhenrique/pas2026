import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  canManageTargetRole,
  isAppRole,
  isPrivilegedRole,
  requiresPrivilegedRole,
  type AppRole,
  type ManageUsersAction,
} from "./authorization.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizeSetorResponsavelNome(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function getSetorResponsavelKey(value: unknown): string {
  return normalizeSetorResponsavelNome(value).toLocaleLowerCase("pt-BR");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No Bearer token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Create user client to verify caller - using the Authorization header
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the caller's JWT - try getUser() without token first (uses header)
    let userData = null;
    let userError = null;

    // Method 1: Use getUser() which reads from the Authorization header
    const result1 = await supabaseUser.auth.getUser();

    if (result1.data?.user) {
      userData = result1.data;
      userError = result1.error;
    } else {
      // Method 2: Try with explicit token
      const token = authHeader.replace("Bearer ", "");

      const result2 = await supabaseAdmin.auth.getUser(token);

      userData = result2.data;
      userError = result2.error;
    }

    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token", details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callerId = userData.user.id;

    const { data: callerProfile, error: callerProfileError } = await supabaseAdmin
      .from("profiles")
      .select("ativo")
      .eq("user_id", callerId)
      .maybeSingle();

    if (callerProfileError) {
      return new Response(
        JSON.stringify({ error: callerProfileError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!callerProfile?.ativo) {
      return new Response(
        JSON.stringify({ error: "Acesso negado. O perfil está inativo." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch caller role
    const { data: callerRole, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .single();

    if (roleError && roleError.code !== "PGRST116") {
      return new Response(
        JSON.stringify({ error: roleError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callerAppRole = (callerRole?.role as AppRole) || null;
    const isSuperAdmin = callerAppRole === "superadmin";
    const isPrivileged = isPrivilegedRole(callerAppRole);

    const body = await req.json();
    const { action, ...payload } = body || {};

    if (!action || typeof action !== "string") {
      return new Response(
        JSON.stringify({ error: "Ação inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const typedAction = action as ManageUsersAction;

    // "make-admin" is bootstrap-only and tied to current caller
    if (typedAction === "make-admin") {
      const { data: bootstrapped, error: bootstrapError } = await supabaseAdmin.rpc(
        "bootstrap_first_admin",
        { target_user_id: callerId },
      );

      if (bootstrapError) {
        return new Response(
          JSON.stringify({ error: bootstrapError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!bootstrapped) {
        return new Response(
          JSON.stringify({ error: "Já existe um usuário privilegiado no sistema." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // All other actions require privileged caller
    if (requiresPrivilegedRole(typedAction) && !isPrivileged) {
      return new Response(
        JSON.stringify({ error: "Acesso negado. Apenas administradores podem gerenciar usuários." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    switch (typedAction) {
      case "create": {
        const { email, password, nome, cargo, setor, role } = payload;
        const normalizedSetor = normalizeSetorResponsavelNome(setor);

        if (!isAppRole(role)) {
          return new Response(
            JSON.stringify({ error: "Perfil de acesso inválido." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if ((role === "gestor" || role === "coordenador") && !normalizedSetor) {
          return new Response(
            JSON.stringify({ error: "Gestores e coordenadores precisam ter um setor responsável vinculado." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (normalizedSetor) {
          const { data: setorResponsavel, error: setorError } = await supabaseAdmin
            .from("setores_responsaveis")
            .select("id, ativo, nome")
            .eq("nome_normalizado", getSetorResponsavelKey(normalizedSetor))
            .maybeSingle();

          if (setorError) {
            return new Response(
              JSON.stringify({ error: setorError.message }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          if (!setorResponsavel || !setorResponsavel.ativo) {
            return new Response(
              JSON.stringify({ error: "O setor responsável selecionado não existe ou está inativo." }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        // Apenas superadmin pode criar outro superadmin
        if (role === "superadmin" && !isSuperAdmin) {
          return new Response(
            JSON.stringify({ error: "Apenas Super Admins podem criar outros Super Admins." }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create user in auth
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { nome },
        });

        if (createError) {
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // The profile is created automatically by the trigger
        // Update with additional info
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({ cargo, setor: normalizedSetor || null })
          .eq("user_id", newUser.user.id);

        if (profileError) {
          console.error("Profile update error:", profileError);
          await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
          return new Response(
            JSON.stringify({ error: profileError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Add role
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: newUser.user.id, role }, { onConflict: "user_id" });

        if (roleError) {
          console.error("Role insert error:", roleError);
          await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
          return new Response(
            JSON.stringify({ error: roleError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, user: newUser.user }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update": {
        const { user_id, nome, cargo, setor, role, ativo } = payload;
        const normalizedSetor = normalizeSetorResponsavelNome(setor);

        if (role !== undefined && !isAppRole(role)) {
          return new Response(
            JSON.stringify({ error: "Perfil de acesso inválido." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if ((role === "gestor" || role === "coordenador") && !normalizedSetor) {
          return new Response(
            JSON.stringify({ error: "Gestores e coordenadores precisam ter um setor responsável vinculado." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (normalizedSetor) {
          const { data: setorResponsavel, error: setorError } = await supabaseAdmin
            .from("setores_responsaveis")
            .select("id, ativo, nome")
            .eq("nome_normalizado", getSetorResponsavelKey(normalizedSetor))
            .maybeSingle();

          if (setorError) {
            return new Response(
              JSON.stringify({ error: setorError.message }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          if (!setorResponsavel || !setorResponsavel.ativo) {
            return new Response(
              JSON.stringify({ error: "O setor responsável selecionado não existe ou está inativo." }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        // Verificar se o usuário alvo é superadmin
        const { data: targetRole } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", user_id)
          .single();

        // Apenas superadmin pode editar outro superadmin
        if (!canManageTargetRole(callerAppRole, (targetRole?.role as AppRole) || null)) {
          return new Response(
            JSON.stringify({ error: "Apenas Super Admins podem editar outros Super Admins." }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Apenas superadmin pode promover para superadmin
        if (role === "superadmin" && !isSuperAdmin) {
          return new Response(
            JSON.stringify({ error: "Apenas Super Admins podem promover usuários a Super Admin." }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update profile
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({ nome, cargo, setor: normalizedSetor || null, ativo })
          .eq("user_id", user_id);

        if (profileError) {
          return new Response(
            JSON.stringify({ error: profileError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update role
        if (role) {
          const { error: roleError } = await supabaseAdmin
            .from("user_roles")
            .upsert({ user_id, role }, { onConflict: "user_id" });

          if (roleError) {
            return new Response(
              JSON.stringify({ error: roleError.message }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list": {
        // Get all profiles with roles
        const { data: profiles, error } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get roles for each user
        const { data: roles } = await supabaseAdmin.from("user_roles").select("*");

        // Adicionar flag indicando se o caller é superadmin
        const usersWithRoles = profiles?.map((profile) => ({
          ...profile,
          role: roles?.find((r) => r.user_id === profile.user_id)?.role || "gestor",
        }));

        return new Response(
          JSON.stringify({ users: usersWithRoles, callerIsSuperAdmin: isSuperAdmin }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "toggle-status": {
        const { user_id, ativo } = payload;

        // Verificar se o usuário alvo é superadmin
        const { data: targetRole } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", user_id)
          .single();

        if (!canManageTargetRole(callerAppRole, (targetRole?.role as AppRole) || null)) {
          return new Response(
            JSON.stringify({ error: "Apenas Super Admins podem alterar o status de outros Super Admins." }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ ativo })
          .eq("user_id", user_id);

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "reset-password": {
        const { user_id, new_password } = payload;

        // Verificar se o usuário alvo é superadmin
        const { data: targetRole } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", user_id)
          .single();

        if (!canManageTargetRole(callerAppRole, (targetRole?.role as AppRole) || null)) {
          return new Response(
            JSON.stringify({ error: "Apenas Super Admins podem redefinir a senha de outros Super Admins." }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
          password: new_password,
        });

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Ação inválida" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
