import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ClerkUser, UserRole } from '../auth/types/auth.types';
import { AdminService } from './admin.service';
import {
  CreateUserDto,
  UpdateUserRoleDto,
  BanUserDto,
  CreateInviteDto,
} from './dto/create-user.dto';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========================================
  // ROTAS ADMINISTRATIVAS - APENAS ROLES ESPECÍFICOS
  // ========================================

  // ========================================
  // GESTÃO DE UTILIZADORES
  // ========================================

  @Get('users')
  @Roles(UserRole.ADMIN)
  async getAllUsers(
    @CurrentUser() user: ClerkUser,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.adminService.getAllUsers(user.role, page, limit);
  }

  @Get('users/:id')
  @Roles(UserRole.ADMIN)
  async getUserById(
    @CurrentUser() user: ClerkUser,
    @Param('id') userId: string,
  ) {
    return this.adminService.getUserById(userId, user.role);
  }

  @Post('users')
  @Roles(UserRole.ADMIN)
  async createUser(
    @CurrentUser() user: ClerkUser,
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ) {
    const newUser = await this.adminService.createUser(
      createUserDto,
      user.role,
    );

    return {
      message: 'User created successfully',
      createdBy: user.userId,
      user: newUser,
    };
  }

  @Put('users/:id/role')
  @Roles(UserRole.ADMIN)
  async updateUserRole(
    @CurrentUser() user: ClerkUser,
    @Param('id') userId: string,
    @Body(ValidationPipe) updateRoleDto: Omit<UpdateUserRoleDto, 'userId'>,
  ) {
    await this.adminService.updateUserRole(
      { userId, role: updateRoleDto.role },
      user.role,
    );

    return {
      message: 'User role updated successfully',
      updatedBy: user.userId,
      userId,
      newRole: updateRoleDto.role,
    };
  }

  // ========================================
  // SISTEMA DE BANS
  // ========================================

  @Post('users/:id/ban')
  @Roles(UserRole.ADMIN)
  async banUser(
    @CurrentUser() user: ClerkUser,
    @Param('id') userId: string,
    @Body(ValidationPipe) banDto: Omit<BanUserDto, 'userId'>,
  ) {
    await this.adminService.banUser({ userId, ...banDto }, user.role);

    return {
      message: 'User banned successfully',
      bannedBy: user.userId,
      userId,
      reason: banDto.reason,
      duration: banDto.duration || 'permanent',
    };
  }

  @Delete('users/:id/ban')
  @Roles(UserRole.ADMIN)
  async unbanUser(@CurrentUser() user: ClerkUser, @Param('id') userId: string) {
    await this.adminService.unbanUser(userId, user.role);

    return {
      message: 'User unbanned successfully',
      unbannedBy: user.userId,
      userId,
    };
  }

  // ========================================
  // SISTEMA DE CONVITES
  // ========================================

  @Post('invites')
  @Roles(UserRole.ADMIN)
  async createInvite(
    @CurrentUser() user: ClerkUser,
    @Body(ValidationPipe) createInviteDto: CreateInviteDto,
  ) {
    const invite = await this.adminService.createInvite(
      createInviteDto,
      user.role,
    );

    return {
      message: 'Invitation created successfully',
      createdBy: user.userId,
      email: createInviteDto.email,
      role: createInviteDto.role,
      inviteUrl: invite.inviteUrl,
    };
  }

  // ========================================
  // ROTAS DE EXEMPLO PARA DIFERENTES ROLES
  // ========================================

  @Get('admin-only')
  @Roles(UserRole.ADMIN)
  async adminOnlyRoute(@CurrentUser() user: ClerkUser) {
    return {
      message: 'This route is only accessible by ADMIN users',
      admin: {
        id: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      },
      secretData: 'Top secret admin information',
      permissions: ['all'],
    };
  }

  @Get('management')
  @Roles(UserRole.ADMIN)
  async managementRoute(@CurrentUser() user: ClerkUser) {
    const permissions =
      user.role === UserRole.ADMIN
        ? ['create', 'read', 'update', 'delete', 'ban', 'unban', 'invite']
        : ['create', 'read', 'update', 'ban'];

    return {
      message: 'Management area - accessible by ADMIN and DIRECTOR',
      user: {
        id: user.userId,
        role: user.role,
      },
      permissions,
      managementTools: [
        'User Management',
        'System Statistics',
        'Ban Management',
        ...(user.role === UserRole.ADMIN
          ? ['Role Assignment', 'Invitations']
          : []),
      ],
    };
  }

  @Get('moderation')
  @Roles(UserRole.ADMIN)
  async moderationRoute(@CurrentUser() user: ClerkUser) {
    const tools = {
      [UserRole.ADMIN]: [
        'All moderation tools',
        'Advanced settings',
        'User creation',
      ],
    };

    return {
      message: 'Moderation panel',
      moderator: {
        id: user.userId,
        role: user.role,
      },
      availableTools: tools[user.role] || [],
      canBanUsers: [UserRole.ADMIN].includes(user.role),
      canCreateUsers: user.role === UserRole.ADMIN,
    };
  }

  // ========================================
  // ROTA DE TESTE DE PERMISSÕES
  // ========================================

  @Get('permissions-test')
  @Roles(UserRole.ADMIN)
  async testPermissions(@CurrentUser() user: ClerkUser) {
    const roleHierarchy = {
      [UserRole.ADMIN]: 4,
      [UserRole.USER]: 1,
    };

    const permissions = {
      canCreateUsers: user.role === UserRole.ADMIN,
      canUpdateRoles: user.role === UserRole.ADMIN,
      canBanUsers: [UserRole.ADMIN].includes(user.role),
      canUnbanUsers: user.role === UserRole.ADMIN,
      canViewAllUsers: [UserRole.ADMIN].includes(user.role),
      canViewStats: [UserRole.ADMIN].includes(user.role),
      canCreateInvites: user.role === UserRole.ADMIN,
      canModerateContent: [UserRole.ADMIN].includes(user.role),
    };

    return {
      message: 'Permission test results',
      user: {
        id: user.userId,
        role: user.role,
        hierarchyLevel: roleHierarchy[user.role],
      },
      permissions,
      accessLevel: user.role,
    };
  }

  // ========================================
  // EXEMPLOS DE DIFERENTES NÍVEIS DE ACESSO ADMINISTRATIVO
  // ========================================

  // Apenas para ADMIN (máximo privilégio)
  @Get('super-admin')
  @Roles(UserRole.ADMIN)
  async getSuperAdminPanel(@CurrentUser() user: ClerkUser) {
    return {
      message: 'Super Admin Panel - ADMIN ONLY',
      admin: {
        id: user.userId,
        role: user.role,
      },
      capabilities: [
        'System Configuration',
        'Database Management',
        'Security Settings',
        'All User Management',
      ],
      dangerZone: {
        canDeleteUsers: true,
        canModifySystem: true,
        canAccessLogs: true,
      },
    };
  }

  // Para ADMIN e DIRECTOR (gestão)
  @Get('management-panel')
  @Roles(UserRole.ADMIN)
  async getManagementPanel(@CurrentUser() user: ClerkUser) {
    const capabilities =
      user.role === UserRole.ADMIN
        ? ['Full Management', 'System Access', 'All Reports']
        : ['Department Management', 'Limited Reports', 'Team Oversight'];

    return {
      message: 'Management Panel - ADMIN and DIRECTOR',
      manager: {
        id: user.userId,
        role: user.role,
      },
      capabilities,
      canCreateUsers: user.role === UserRole.ADMIN,
    };
  }

  // Para ADMIN, DIRECTOR e MODERATOR (staff)
  @Get('staff-tools')
  @Roles(UserRole.ADMIN)
  async getStaffTools(@CurrentUser() user: ClerkUser) {
    return {
      message: 'Staff Tools - Administrative roles only',
      staff: {
        id: user.userId,
        role: user.role,
      },
      tools: this.getToolsForRole(user.role),
      accessLevel: this.getAccessLevel(user.role),
    };
  }

  private getToolsForRole(role: UserRole): string[] {
    const tools = {
      [UserRole.ADMIN]: [
        'All Tools',
        'User Management',
        'System Config',
        'Analytics',
        'Security',
      ],
    };

    return tools[role] || [];
  }

  private getAccessLevel(role: UserRole): string {
    const levels = {
      [UserRole.ADMIN]: 'full',
      [UserRole.USER]: 'basic',
    };

    return levels[role] || 'none';
  }
}
