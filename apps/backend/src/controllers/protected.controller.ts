import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  AuthGuard,
  RolesGuard,
  Roles,
  CurrentUser,
  ClerkUser,
  UserRole,
} from 'src/modules/auth';

@Controller('protected')
@UseGuards(AuthGuard)
export class ProtectedController {
  @Get('profile')
  getProfile(@CurrentUser() user: ClerkUser) {
    return {
      message: 'This is a protected route',
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminData(@CurrentUser() user: ClerkUser) {
    return {
      message: 'This is admin-only data',
      adminUser: user.userId,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('admin-or-moderator')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getModeratorData(@CurrentUser() user: ClerkUser) {
    return {
      message: 'This is for admins and moderators only',
      user: user.userId,
      role: user.role,
      timestamp: new Date().toISOString(),
    };
  }
}
