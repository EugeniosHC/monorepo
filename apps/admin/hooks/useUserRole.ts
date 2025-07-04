import { useUser } from "@clerk/nextjs";
import { UserRole } from "@/types/auth";

interface UseUserRoleReturn {
  userRole: UserRole | null;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isDirector: () => boolean;
  isModerator: () => boolean;
  isUser: () => boolean;
  canAccessAdmin: () => boolean;
  canManageUsers: () => boolean;
  isLoaded: boolean;
  user: ReturnType<typeof useUser>["user"];
}

export function useUserRole(): UseUserRoleReturn {
  const { user, isLoaded } = useUser();

  const getUserRole = (): UserRole | null => {
    if (!user?.publicMetadata) return null;
    return (user.publicMetadata as any)?.role || null;
  };

  const hasRole = (role: UserRole): boolean => {
    const userRole = getUserRole();
    return userRole === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    const userRole = getUserRole();
    return userRole ? roles.includes(userRole) : false;
  };

  const isAdmin = (): boolean => {
    return hasRole(UserRole.ADMIN);
  };

  const isDirector = (): boolean => {
    return hasRole(UserRole.DIRECTOR);
  };

  const isModerator = (): boolean => {
    return hasRole(UserRole.MODERATOR);
  };

  const isUser = (): boolean => {
    return hasRole(UserRole.USER);
  };

  const canAccessAdmin = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.DIRECTOR]);
  };

  const canManageUsers = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MODERATOR]);
  };

  return {
    userRole: getUserRole(),
    hasRole,
    hasAnyRole,
    isAdmin,
    isDirector,
    isModerator,
    isUser,
    canAccessAdmin,
    canManageUsers,
    isLoaded,
    user,
  };
}
