import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { ClerkConfig } from '../../config/clerk.config';
import { UserRole, ClerkUser } from '../auth/types/auth.types';
import {
  CreateUserDto,
  UpdateUserRoleDto,
  BanUserDto,
  CreateInviteDto,
} from './dto/create-user.dto';

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  lastSignInAt?: Date;
  banned: boolean;
  emailVerified: boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  usersByRole: Record<UserRole, number>;
  recentSignUps: number; // últimos 30 dias
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly clerkClient;

  constructor(private readonly clerkConfig: ClerkConfig) {
    this.clerkClient = createClerkClient({
      secretKey: this.clerkConfig.secretKey,
    });
  }

  /**
   * Criar novo usuário (apenas ADMIN pode)
   */
  async createUser(
    createUserDto: CreateUserDto,
    requesterRole: UserRole,
  ): Promise<ClerkUser> {
    if (requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can create users');
    }

    try {

      const clerkUser = await this.clerkClient.users.createUser({
        emailAddress: [createUserDto.email],
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        password: createUserDto.password,
        publicMetadata: {
          role: createUserDto.role || UserRole.USER,
        },
        skipPasswordChecks: true, // Para desenvolvimento
      });


      return {
        userId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        role: createUserDto.role || UserRole.USER,
      };
    } catch (error) {
      this.logger.error('Failed to create user:', error.message);
      throw new BadRequestException(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Listar todos os usuários (ADMIN e DIRECTOR podem)
   */
  async getAllUsers(
    requesterRole: UserRole,
    page = 1,
    limit = 20,
  ): Promise<{
    users: UserListItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    if (![UserRole.ADMIN].includes(requesterRole)) {
      throw new ForbiddenException('Insufficient permissions to list users');
    }

    try {
      const offset = (page - 1) * limit;

      const { data: clerkUsers, totalCount } =
        await this.clerkClient.users.getUserList({
          limit,
          offset,
          orderBy: '-created_at',
        });

      const users: UserListItem[] = clerkUsers.map((user) => ({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: this.extractUserRole(user),
        createdAt: new Date(user.createdAt),
        lastSignInAt: user.lastSignInAt
          ? new Date(user.lastSignInAt)
          : undefined,
        banned: user.banned || false,
        emailVerified:
          user.primaryEmailAddress?.verification?.status === 'verified',
      }));

      return {
        users,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch users:', error.message);
      throw new BadRequestException(`Failed to fetch users: ${error.message}`);
    }
  }

  /**
   * Atualizar role de usuário (apenas ADMIN pode)
   */
  async updateUserRole(
    updateRoleDto: UpdateUserRoleDto,
    requesterRole: UserRole,
  ): Promise<void> {
    if (requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update user roles');
    }

    try {
      await this.clerkClient.users.updateUser(updateRoleDto.userId, {
        publicMetadata: {
          role: updateRoleDto.role,
        },
      });

      this.logger.log(
        `Updated user ${updateRoleDto.userId} role to ${updateRoleDto.role}`,
      );
    } catch (error) {
      this.logger.error('Failed to update user role:', error.message);
      throw new BadRequestException(
        `Failed to update user role: ${error.message}`,
      );
    }
  }

  /**
   * Banir usuário (ADMIN e DIRECTOR podem)
   */
  async banUser(
    banUserDto: BanUserDto,
    requesterRole: UserRole,
  ): Promise<void> {
    if (![UserRole.ADMIN].includes(requesterRole)) {
      throw new ForbiddenException('Insufficient permissions to ban users');
    }

    try {
      await this.clerkClient.users.banUser(banUserDto.userId);

      // Adicionar metadados sobre o ban
      await this.clerkClient.users.updateUser(banUserDto.userId, {
        privateMetadata: {
          banned: true,
          banReason: banUserDto.reason,
          banDate: new Date().toISOString(),
          banDuration: banUserDto.duration || 'permanent',
        },
      });

      this.logger.log(
        `User ${banUserDto.userId} banned. Reason: ${banUserDto.reason}`,
      );
    } catch (error) {
      this.logger.error('Failed to ban user:', error.message);
      throw new BadRequestException(`Failed to ban user: ${error.message}`);
    }
  }

  /**
   * Desbanir usuário (apenas ADMIN pode)
   */
  async unbanUser(userId: string, requesterRole: UserRole): Promise<void> {
    if (requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can unban users');
    }

    try {
      await this.clerkClient.users.unbanUser(userId);

      // Limpar metadados do ban
      await this.clerkClient.users.updateUser(userId, {
        privateMetadata: {
          banned: false,
          banReason: null,
          banDate: null,
          banDuration: null,
          unbannedAt: new Date().toISOString(),
        },
      });

      this.logger.log(`User ${userId} unbanned`);
    } catch (error) {
      this.logger.error('Failed to unban user:', error.message);
      throw new BadRequestException(`Failed to unban user: ${error.message}`);
    }
  }

  /**
   * Buscar usuário por ID (ADMIN e DIRECTOR podem)
   */
  async getUserById(
    userId: string,
    requesterRole: UserRole,
  ): Promise<UserListItem> {
    if (![UserRole.ADMIN].includes(requesterRole)) {
      throw new ForbiddenException(
        'Insufficient permissions to view user details',
      );
    }

    try {
      const user = await this.clerkClient.users.getUser(userId);

      return {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: this.extractUserRole(user),
        createdAt: new Date(user.createdAt),
        lastSignInAt: user.lastSignInAt
          ? new Date(user.lastSignInAt)
          : undefined,
        banned: user.banned || false,
        emailVerified:
          user.primaryEmailAddress?.verification?.status === 'verified',
      };
    } catch (error) {
      this.logger.error('Failed to get user:', error.message);
      throw new BadRequestException(`User not found: ${error.message}`);
    }
  }

  /**
   * Criar convite para novo usuário (apenas ADMIN pode)
   */
  async createInvite(
    createInviteDto: CreateInviteDto,
    requesterRole: UserRole,
  ): Promise<{ inviteUrl: string }> {
    if (requesterRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can create invites');
    }

    try {
      const invitation = await this.clerkClient.invitations.createInvitation({
        emailAddress: createInviteDto.email,
        publicMetadata: {
          role: createInviteDto.role,
        },
        redirectUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      });

      this.logger.log(
        `Invitation created for ${createInviteDto.email} with role ${createInviteDto.role}`,
      );

      return {
        inviteUrl: invitation.url,
      };
    } catch (error) {
      this.logger.error('Failed to create invitation:', error.message);
      throw new BadRequestException(
        `Failed to create invitation: ${error.message}`,
      );
    }
  }

  private extractUserRole(clerkUser: any): UserRole {
    const role =
      clerkUser.privateMetadata?.role ||
      clerkUser.publicMetadata?.role ||
      UserRole.USER;
    return Object.values(UserRole).includes(role) ? role : UserRole.USER;
  }
}
