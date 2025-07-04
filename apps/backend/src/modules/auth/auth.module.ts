import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ClerkConfig } from '../../config/clerk.config';

@Module({
  providers: [
    ClerkConfig,
    AuthService,
    AuthGuard,
    RolesGuard,
    // Opcional: Aplicar AuthGuard globalmente
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
  exports: [AuthService, AuthGuard, RolesGuard, ClerkConfig],
})
export class AuthModule {}
