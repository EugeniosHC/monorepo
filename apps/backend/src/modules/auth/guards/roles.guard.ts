import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from 'src/modules/auth/decorators/roles.decorator';
import { AUTHENTICATED_KEY } from 'src/modules/auth/decorators/authenticated.decorator';
import { UserRole, ClerkUser } from 'src/modules/auth/types/auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const isAuthenticatedRoute = this.reflector.getAllAndOverride<boolean>(
      AUTHENTICATED_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se não há roles definidos e não é uma rota @Authenticated, permitir acesso
    if (!requiredRoles && !isAuthenticatedRoute) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: ClerkUser }>();
    const user = request.user;

    if (!user) {
      this.logger.error(
        'User not found in request. Make sure AuthGuard runs before RolesGuard',
      );
      throw new ForbiddenException('User authentication required');
    }

    // Se é uma rota @Authenticated, apenas verificar se está autenticado
    if (isAuthenticatedRoute && !requiredRoles) {
      this.logger.debug(
        `User ${user.userId} with role ${user.role || 'none'} granted access to authenticated route`,
      );
      return true;
    }

    // Verificação normal de roles
    if (!user.role) {
      this.logger.warn(`User ${user.userId} has no role assigned`);
      throw new ForbiddenException('User role not assigned');
    }

    const hasRequiredRole = requiredRoles?.includes(user.role);

    if (!hasRequiredRole && requiredRoles?.length > 0) {
      this.logger.warn(
        `User ${user.userId} with role ${user.role} attempted to access resource requiring roles: ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException('Insufficient permissions');
    }

    this.logger.debug(
      `User ${user.userId} with role ${user.role} granted access`,
    );
    return true;
  }
}
