import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CloudflareService } from '../cloudflare/cloudflare.service';
import { AuthModule } from '../auth';

@Module({
  imports: [AuthModule],
  providers: [CategoryService, PrismaService, CloudflareService],
  controllers: [CategoryController],
})
export class CategoryModule {}
