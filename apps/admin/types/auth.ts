export enum UserRole {
  ADMIN = "admin",
  CLUB_MANAGER = "club_manager",
  PT_MANAGER = "pt_manager",
  USER = "user",
}

export interface ClerkUser {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface UserMetadata {
  role?: UserRole;
}
