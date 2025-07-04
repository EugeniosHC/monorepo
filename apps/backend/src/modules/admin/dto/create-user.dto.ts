import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../auth/types/auth.types';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.USER;
}

export class UpdateUserRoleDto {
  @IsString()
  userId: string;

  @IsEnum(UserRole)
  role: UserRole;
}

export class BanUserDto {
  @IsString()
  userId: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  duration?: string; // e.g., "7d", "30d", "permanent"
}

export class CreateInviteDto {
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  message?: string;
}
