import { useUser } from "@clerk/nextjs";
import { UserRole } from "@/types/auth";

interface UseUserRoleReturn {
  userRole: UserRole | null;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isPTManager: () => boolean;
  isClubManager: () => boolean;
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

  const isPTManager = (): boolean => {
    return hasRole(UserRole.PT_MANAGER);
  };

  const isClubManager = (): boolean => {
    return hasRole(UserRole.CLUB_MANAGER);
  };

  const isUser = (): boolean => {
    return hasRole(UserRole.USER);
  };

  const canAccessAdmin = (): boolean => {
    return hasAnyRole([UserRole.ADMIN]);
  };

  const canManageUsers = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.CLUB_MANAGER]);
  };

  return {
    userRole: getUserRole(),
    hasRole,
    hasAnyRole,
    isAdmin,
    isPTManager,
    isClubManager,
    isUser,
    canAccessAdmin,
    canManageUsers,
    isLoaded,
    user,
  };
}
