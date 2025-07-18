"use client";

import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/types/auth";
import { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  requireAll?: boolean; // Se true, precisa ter TODOS os roles; se false, precisa ter pelo menos um
}

export function RoleGuard({ children, allowedRoles, fallback = null, requireAll = false }: RoleGuardProps) {
  const { userRole, isLoaded } = useUserRole();

  if (!isLoaded) {
    return <div>Carregando...</div>;
  }

  if (!userRole) {
    return fallback;
  }

  const hasAccess = requireAll ? allowedRoles.every((role) => userRole === role) : allowedRoles.includes(userRole);

  return hasAccess ? <>{children}</> : fallback;
}

// Componentes específicos para roles comuns
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function ClubManagerOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.CLUB_MANAGER]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function AdminOrClubManager({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CLUB_MANAGER]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
