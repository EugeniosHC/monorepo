"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserRole } from "@/types/auth";
import { useApiClient } from "@/hooks/useApiClient";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  lastSignInAt?: string;
  banned: boolean;
  emailVerified: boolean;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useUsers = (page = 1, limit = 20) => {
  const { apiClient, isAuthenticated } = useApiClient();

  return useQuery<UserListResponse>({
    queryKey: ["users", page, limit],
    queryFn: async () => {
      if (!isAuthenticated) throw new Error("Authentication required");
      const response = await apiClient.get(`/admin/users?page=${page}&limit=${limit}`);
      return response.data as UserListResponse;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUserById = (userId: string) => {
  const { apiClient, isAuthenticated } = useApiClient();

  return useQuery<User>({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!isAuthenticated) throw new Error("Authentication required");
      const response = await apiClient.get(`/admin/users/${userId}`);
      return response.data as User;
    },
    enabled: isAuthenticated && !!userId,
  });
};

export const useUpdateUserRole = () => {
  const { apiClient, isAuthenticated } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      if (!isAuthenticated) throw new Error("Authentication required");
      const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      toast.success("Perfil do utilizador atualizado com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar perfil", {
        description: error.message || "Ocorreu um erro ao atualizar o perfil do utilizador",
      });
    },
  });
};

export const useBanUser = () => {
  const { apiClient, isAuthenticated } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      if (!isAuthenticated) throw new Error("Authentication required");
      const response = await apiClient.post(`/admin/users/${userId}/ban`, { reason });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      toast.success("Utilizador bloqueado com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao bloquear utilizador", {
        description: error.message || "Ocorreu um erro ao bloquear o utilizador",
      });
    },
  });
};

export const useUnbanUser = () => {
  const { apiClient, isAuthenticated } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!isAuthenticated) throw new Error("Authentication required");
      const response = await apiClient.delete(`/admin/users/${userId}/ban`);
      return response.data;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toast.success("Utilizador desbloqueado com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao desbloquear utilizador", {
        description: error.message || "Ocorreu um erro ao desbloquear o utilizador",
      });
    },
  });
};

export const useSendInvite = () => {
  const { apiClient, isAuthenticated } = useApiClient();

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: UserRole }) => {
      if (!isAuthenticated) throw new Error("Authentication required");
      const response = await apiClient.post("/admin/invites", { email, role });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Convite enviado com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao enviar convite", {
        description: error.message || "Ocorreu um erro ao enviar o convite",
      });
    },
  });
};
