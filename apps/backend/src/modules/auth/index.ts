// Module
export { AuthModule } from './auth.module';

// Services
export { AuthService } from './auth.service';

// Guards
export { AuthGuard } from './guards/auth.guard';
export { RolesGuard } from './guards/roles.guard';

// Decorators
export { Roles } from './decorators/roles.decorator';
export { CurrentUser } from './decorators/current-user.decorator';
export { Authenticated } from './decorators/authenticated.decorator';

// Types
export {
  ClerkUser,
  UserRole,
  AuthenticatedRequest,
  ClerkTokenPayload,
} from './types/auth.types';

// Config
export { ClerkConfig } from '../../config/clerk.config';
