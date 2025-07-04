import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { verifyToken, createClerkClient } from '@clerk/backend';
import { ClerkConfig } from '../../config/clerk.config';
import {
  ClerkUser,
  UserRole,
  type ClerkTokenPayload,
} from './types/auth.types';
import * as cookieParser from 'cookie-parser';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly clerkClient;

  constructor(private readonly clerkConfig: ClerkConfig) {
    this.clerkClient = createClerkClient({
      secretKey: this.clerkConfig.secretKey,
    });
  }

  async verifyJwtToken(token: string): Promise<ClerkUser> {
    try {
      // 1. Verificar e decodificar o token JWT usando apenas secret key
      const payload = await verifyToken(token, {
        secretKey: this.clerkConfig.secretKey,
      });

      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const userId = payload.sub;
      this.logger.debug(`Token verified for user: ${userId}`);

      // 2. Buscar dados completos do usuário no Clerk
      const clerkUser = await this.clerkClient.users.getUser(userId);

      if (!clerkUser) {
        throw new UnauthorizedException('User not found');
      }

      // 3. Extrair role dos metadados
      const role = this.extractUserRole(clerkUser);

      // 4. Montar objeto ClerkUser com dados seguros
      const user: ClerkUser = {
        userId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        role,
      };

      this.logger.debug(
        `User data fetched: ${user.userId} with role: ${user.role}`,
      );

      return user;
    } catch (error) {
      this.logger.error('Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractUserRole(clerkUser: any): UserRole {
    // Prioridade: private_metadata > public_metadata > default
    const role =
      clerkUser.privateMetadata?.role ||
      clerkUser.publicMetadata?.role ||
      UserRole.USER;

    // Validar se o role é válido
    if (!Object.values(UserRole).includes(role)) {
      this.logger.warn(`Invalid role detected: ${role}, defaulting to USER`);
      return UserRole.USER;
    }

    return role;
  }

  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
