import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { ClerkConfig } from '../../config/clerk.config';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, ClerkConfig],
  exports: [AdminService],
})
export class AdminModule {}
