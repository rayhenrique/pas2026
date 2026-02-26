import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/Layout";
import {
  Users,
  UserPlus,
  Edit,
  Power,
  Key,
  Search,
  Shield,
  User,
  BarChart3,
  Loader2,
  X,
  Check,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole, invalidateUserRoleCache } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  cargo: string | null;
  setor: string | null;
  ativo: boolean;
  role: string;
  created_at: string;
}

interface ManageUsersListResponse {
  users?: UserProfile[];
  callerIsSuperAdmin?: boolean;
  error?: string;
}

interface ManageUsersActionResponse {
  success?: boolean;
  error?: string;
}

const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Administrador",
  coordenador: "Coordenador",
  gestor: "Gestor",
};

const roleColors: Record<string, string> = {
  superadmin: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  coordenador: "bg-primary/10 text-primary border-primary/20",
  gestor: "bg-muted text-muted-foreground border-border",
};

export default function Admin() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();
  const { isSuperadmin } = useUserRole();

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nome: "",
    cargo: "",
    setor: "",
    role: "gestor",
  });
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke<ManageUsersListResponse>("manage-users", {
        body: { action: "list" },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setUsers(data.users || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Falha ao carregar usuários.";
      console.error("Error fetching users:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password || !formData.nome) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email, senha e nome.",
        variant: "destructive",
      });
      return;
    }

    setFormLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<ManageUsersActionResponse>("manage-users", {
        body: {
          action: "create",
          ...formData,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Usuário criado com sucesso!",
        description: `${formData.nome} foi adicionado ao sistema.`,
      });

      setShowCreateDialog(false);
      resetForm();
      fetchUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Falha ao criar usuário.";
      toast({
        title: "Erro ao criar usuário",
        description: message,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setFormLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<ManageUsersActionResponse>("manage-users", {
        body: {
          action: "update",
          user_id: selectedUser.user_id,
          nome: formData.nome,
          cargo: formData.cargo,
          setor: formData.setor,
          role: formData.role,
          ativo: selectedUser.ativo,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Usuário atualizado!",
        description: "As alterações foram salvas.",
      });

      // Invalida cache de roles para forçar refresh
      invalidateUserRoleCache();

      setShowEditDialog(false);
      fetchUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Falha ao atualizar usuário.";
      toast({
        title: "Erro ao atualizar usuário",
        description: message,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    try {
      const { data, error } = await supabase.functions.invoke<ManageUsersActionResponse>("manage-users", {
        body: {
          action: "toggle-status",
          user_id: user.user_id,
          ativo: !user.ativo,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: user.ativo ? "Usuário desativado" : "Usuário ativado",
        description: `${user.nome} foi ${user.ativo ? "desativado" : "ativado"}.`,
      });

      fetchUsers();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Falha ao alterar status.";
      toast({
        title: "Erro ao alterar status",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;

    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter no mínimo 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setFormLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<ManageUsersActionResponse>("manage-users", {
        body: {
          action: "reset-password",
          user_id: selectedUser.user_id,
          new_password: newPassword,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Senha redefinida!",
        description: `A senha de ${selectedUser.nome} foi alterada.`,
      });

      setShowResetDialog(false);
      setNewPassword("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Falha ao redefinir senha.";
      toast({
        title: "Erro ao redefinir senha",
        description: message,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      nome: "",
      cargo: "",
      setor: "",
      role: "gestor",
    });
  };

  const openEditDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "",
      nome: user.nome,
      cargo: user.cargo || "",
      setor: user.setor || "",
      role: user.role,
    });
    setShowEditDialog(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEditUser = (user: UserProfile) => {
    if (user.role === "superadmin" && !isSuperadmin) {
      return false;
    }
    return true;
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-header flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Gerenciar Usuários
              </h1>
              <p className="text-muted-foreground">
                Adicione, edite e gerencie os usuários do sistema
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="card-elevated p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground">Total de Usuários</p>
          </div>
        </div>
        <div className="card-elevated p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <Check className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {users.filter((u) => u.ativo).length}
            </p>
            <p className="text-xs text-muted-foreground">Usuários Ativos</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-elevated overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Usuário</TableHead>
                  <TableHead className="font-semibold">Cargo / Setor</TableHead>
                  <TableHead className="font-semibold">Perfil</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-10 h-10 text-muted-foreground/50" />
                        <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.nome}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-foreground">{user.cargo || "-"}</p>
                          <p className="text-sm text-muted-foreground">{user.setor || "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                            roleColors[user.role] || roleColors.gestor
                          )}
                        >
                          {user.role === "superadmin" && <Shield className="w-3 h-3" />}
                          {user.role === "admin" && <Shield className="w-3 h-3" />}
                          {user.role === "coordenador" && <BarChart3 className="w-3 h-3" />}
                          {user.role === "gestor" && <User className="w-3 h-3" />}
                          {roleLabels[user.role] || user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                            user.ativo
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              user.ativo ? "bg-success" : "bg-muted-foreground"
                            )}
                          />
                          {user.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {canEditUser(user) ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(user)}
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowResetDialog(true);
                              }}
                              title="Redefinir Senha"
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatus(user)}
                              title={user.ativo ? "Desativar" : "Ativar"}
                            >
                              <Power
                                className={cn(
                                  "w-4 h-4",
                                  user.ativo ? "text-success" : "text-muted-foreground"
                                )}
                              />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Apenas Super Admin
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Novo Usuário
            </DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo usuário no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do usuário"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ex: Enfermeiro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="setor">Setor</Label>
                <Input
                  id="setor"
                  value={formData.setor}
                  onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                  placeholder="Ex: Atenção Básica"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Perfil de Acesso</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gestor">Gestor (visualização)</SelectItem>
                  <SelectItem value="coordenador">Coordenador (lançamentos)</SelectItem>
                  <SelectItem value="admin">Administrador (acesso total)</SelectItem>
                  {isSuperadmin && (
                    <SelectItem value="superadmin">Super Admin (controle absoluto)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={formLoading}>
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Usuário
            </DialogTitle>
            <DialogDescription>Atualize os dados do usuário.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome Completo</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={formData.email} disabled className="bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cargo">Cargo</Label>
                <Input
                  id="edit-cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-setor">Setor</Label>
                <Input
                  id="edit-setor"
                  value={formData.setor}
                  onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Perfil de Acesso</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    {isSuperadmin && (
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} disabled={formLoading}>
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Redefinir Senha
            </DialogTitle>
            <DialogDescription>
              Defina uma nova senha para {selectedUser?.nome}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <p className="text-sm text-warning">
                O usuário precisará usar a nova senha no próximo acesso.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleResetPassword} disabled={formLoading}>
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redefinir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
