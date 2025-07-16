import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/modules/auth/auth.service';
import { ClerkUser } from 'src/modules/auth/types/auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        throw new UnauthorizedException('Authorization header is missing');
      }

      const token = this.authService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new UnauthorizedException('Invalid authorization header format');
      }

      const user = await this.authService.verifyJwtToken(token);

      (request as Request & { user: ClerkUser }).user = user;

      this.logger.debug(`User authenticated: ${user.userId}`);

      return true;
    } catch (error) {
      this.logger.error('Authentication failed:', error.message);
      throw new UnauthorizedException(error.message || 'Authentication failed');
    }
  }
}
