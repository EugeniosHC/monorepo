"use client";

import {
  useUsers,
  useUpdateUserRole,
  useBanUser,
  useUnbanUser,
  useSendInvite,
  User as UserType,
} from "@/hooks/useUsers";
import { ButtonLoading, PageLoading } from "@/components/ui/loading";
import { Textarea } from "@eugenios/ui/components/textarea";
import { Ban } from "lucide-react";
import { AdminOnly } from "@/components/security/RoleGuard";
import { Button } from "@eugenios/ui/components/button";
import { ReusableDataTable, DataTableConfig } from "@/components/ui/reusable-data-table";
import { useState } from "react";
import { toast } from "sonner";
import { UserCircle, UserCog, Shield, ShieldCheck, ShieldX, User, UserPlus, Mail } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@eugenios/ui/components/alert-dialog";
import { UserRole } from "@/types/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@eugenios/ui/components/dialog";
import { Input } from "@eugenios/ui/components/input";
import { Label } from "@eugenios/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@eugenios/ui/components/select";

// We're using the real User type imported as UserType from the useUsers hook

// Component for the User Management page
export default function UsersManagementPage() {
  const [page] = useState(1);
  const [limit] = useState(20);
  const { data: usersData, isLoading, error, refetch } = useUsers(page, limit);
  const updateUserRole = useUpdateUserRole();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const sendInvite = useSendInvite();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [banReason, setBanReason] = useState("");

  // Form data for new/edit user
  const [formData, setFormData] = useState({
    email: "",
    role: UserRole.USER,
  });

  // Form data for inviting a new user
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: UserRole.USER,
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "banReason") {
      setBanReason(value);
    } else if (name.startsWith("invite_")) {
      const field = name.replace("invite_", "");
      setInviteForm((prev) => ({ ...prev, [field]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle role selection
  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as UserRole }));
  };

  // Handle invite role selection
  const handleInviteRoleChange = (value: string) => {
    setInviteForm((prev) => ({ ...prev, role: value as UserRole }));
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      email: "",
      role: UserRole.USER,
    });
    setBanReason("");
  };

  // Reset invite form
  const resetInviteForm = () => {
    setInviteForm({
      email: "",
      role: UserRole.USER,
    });
  };

  // Open add user dialog
  const openAddUserDialog = () => {
    resetInviteForm();
    setAddUserDialogOpen(true);
  };

  // Open edit user dialog
  const openEditUserDialog = (user: UserType) => {
    setCurrentUser(user);
    setFormData({
      email: user.email,
      role: user.role,
    });
    setEditUserDialogOpen(true);
  };

  // Add a new user (send invite)
  const handleAddUser = () => {
    sendInvite.mutate(
      {
        email: inviteForm.email,
        role: inviteForm.role,
      },
      {
        onSuccess: () => {
          setAddUserDialogOpen(false);
          resetInviteForm();
          refetch();
        },
      }
    );
  };

  // Update existing user's role
  const handleUpdateUser = () => {
    if (!currentUser) return;

    updateUserRole.mutate(
      {
        userId: currentUser.id,
        role: formData.role,
      },
      {
        onSuccess: () => {
          setEditUserDialogOpen(false);
          resetFormData();
          refetch();
        },
      }
    );
  };

  // Ban a user
  const handleBanUser = () => {
    if (!userToDelete) return;

    banUser.mutate(
      {
        userId: userToDelete.id,
        reason: banReason || "Nenhum motivo fornecido",
      },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
          setBanReason("");
          refetch();
        },
      }
    );
  };

  // Unban a user
  const handleUnbanUser = (userId: string) => {
    unbanUser.mutate(userId, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  // Get role badge style based on user role
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <div className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
            <Shield className="w-3 h-3" /> Admin
          </div>
        );
      case UserRole.CLUB_MANAGER:
        return (
          <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            <UserCog className="w-3 h-3" /> Gestor
          </div>
        );
      case UserRole.PT_MANAGER:
        return (
          <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
            <UserCircle className="w-3 h-3" /> PT Manager
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
            <User className="w-3 h-3" /> Utilizador
          </div>
        );
    }
  };

  // Get ban status badge
  const getBanStatusBadge = (banned: boolean) => {
    return banned ? (
      <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
        <ShieldX className="w-3 h-3" /> Bloqueado
      </div>
    ) : (
      <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
        <ShieldCheck className="w-3 h-3" /> Ativo
      </div>
    );
  };

  // Format date to a more readable format
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Nunca";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Table configuration
  const tableConfig: DataTableConfig<import("@/hooks/useUsers").User> = {
    columns: [
      {
        key: "firstName",
        header: "Nome",
        type: "custom",
        render: (value, user) => (
          <div className="flex items-center gap-2">
            <div className="bg-muted flex items-center justify-center w-8 h-8 rounded-full">
              <UserCircle className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium">{`${user.firstName || ""} ${user.lastName || ""}`}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </div>
        ),
      },
      {
        key: "role",
        header: "Perfil",
        type: "custom",
        render: (value) => getRoleBadge(value as UserRole),
        align: "center",
      },
      {
        key: "banned",
        header: "Estado",
        type: "custom",
        render: (value) => getBanStatusBadge(value as boolean),
        align: "center",
      },
      {
        key: "lastSignInAt",
        header: "Último Acesso",
        type: "custom",
        render: (value) => <span className="text-sm text-muted-foreground">{formatDate(value as string)}</span>,
      },
      {
        key: "createdAt",
        header: "Data de Registo",
        type: "custom",
        render: (value) => <span className="text-sm text-muted-foreground">{formatDate(value as string)}</span>,
      },
    ],
    actions: [
      {
        label: "Enviar Email",
        onClick: (user) => {
          toast.info(`Email enviado para ${user.firstName}`, {
            description: `Um email de boas-vindas foi enviado para ${user.email}.`,
          });
        },
      },
      {
        label: "Editar Permissões",
        onClick: (user) => {
          openEditUserDialog(user);
        },
      },
      {
        separator: true,
        label: "Gerenciar Bloqueio",
        onClick: (user) => {
          if (user.banned) {
            handleUnbanUser(user.id);
          } else {
            setUserToDelete(user);
            setDeleteDialogOpen(true);
          }
        },
        variant: "default",
      },
    ],
    enableSelection: false,
    enablePagination: true,
    enableColumnVisibility: true,
    pageSize: 10,
    addButtonLabel: "Convidar Utilizador",
    onAddClick: openAddUserDialog,
  };

  return (
    <AdminOnly
      fallback={
        <div className="flex flex-col items-center justify-center h-96">
          <Shield className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground">Esta página só está disponível para administradores.</p>
        </div>
      }
    >
      <div className="space-y-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Utilizadores</h1>
            <p className="text-muted-foreground">Gerencie os utilizadores da plataforma e as suas permissões.</p>
          </div>
          <Button onClick={openAddUserDialog}>
            <UserPlus className="mr-2 h-4 w-4" />
            Convidar Utilizador
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <PageLoading text="Carregando utilizadores..." />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="text-center">
              <p className="text-red-600 mb-4">Erro: {error instanceof Error ? error.message : "Erro desconhecido"}</p>
              <Button onClick={() => refetch()} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          </div>
        ) : !(usersData as import("@/hooks/useUsers").UserListResponse)?.users ||
          (usersData as import("@/hooks/useUsers").UserListResponse).users.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Nenhum utilizador encontrado.</p>
            <Button onClick={() => refetch()} className="mt-4">
              Recarregar
            </Button>
          </div>
        ) : (
          <div>
            <ReusableDataTable
              data={(usersData as import("@/hooks/useUsers").UserListResponse).users}
              config={tableConfig}
            />
          </div>
        )}

        {/* Ban User Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bloquear Utilizador</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja bloquear o utilizador{" "}
                {userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName}` : ""}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="ban-reason">Motivo do bloqueio (opcional)</Label>
              <Textarea
                id="ban-reason"
                name="banReason"
                placeholder="Informe o motivo do bloqueio..."
                value={banReason}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBanUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={banUser.isPending}
              >
                {banUser.isPending ? (
                  <div className="flex items-center gap-2">
                    <ButtonLoading size="sm" />
                    Processando...
                  </div>
                ) : (
                  <>
                    <Ban className="mr-2 h-4 w-4" />
                    Bloquear
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add User Dialog (Invite) */}
        <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Utilizador</DialogTitle>
              <DialogDescription>
                Envie um convite por email para adicionar um novo utilizador à plataforma.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="invite_email">Email</Label>
                <Input
                  id="invite_email"
                  name="invite_email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={inviteForm.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invite_role">Perfil</Label>
                <Select value={inviteForm.role} onValueChange={handleInviteRoleChange}>
                  <SelectTrigger id="invite_role">
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                    <SelectItem value={UserRole.CLUB_MANAGER}>Gestor do Clube</SelectItem>
                    <SelectItem value={UserRole.PT_MANAGER}>Gestor de PT</SelectItem>
                    <SelectItem value={UserRole.USER}>Utilizador Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddUserDialogOpen(false)} disabled={sendInvite.isPending}>
                Cancelar
              </Button>
              <Button type="submit" onClick={handleAddUser} disabled={!inviteForm.email || sendInvite.isPending}>
                {sendInvite.isPending ? (
                  <div className="flex items-center gap-2">
                    <ButtonLoading size="sm" />
                    Enviando...
                  </div>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Convite
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Permissões</DialogTitle>
              <DialogDescription>
                Atualize as permissões do utilizador{" "}
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : ""}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={currentUser?.email || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Perfil</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                    <SelectItem value={UserRole.CLUB_MANAGER}>Gestor do Clube</SelectItem>
                    <SelectItem value={UserRole.PT_MANAGER}>Gestor de PT</SelectItem>
                    <SelectItem value={UserRole.USER}>Utilizador Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditUserDialogOpen(false)}
                disabled={updateUserRole.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" onClick={handleUpdateUser} disabled={!currentUser || updateUserRole.isPending}>
                {updateUserRole.isPending ? (
                  <div className="flex items-center gap-2">
                    <ButtonLoading size="sm" />
                    Atualizando...
                  </div>
                ) : (
                  <>
                    <UserCog className="mr-2 h-4 w-4" />
                    Atualizar Permissões
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminOnly>
  );
}
