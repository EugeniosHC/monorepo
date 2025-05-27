import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CloudflareService } from '../cloudflare/cloudflare.service';

@Module({
  providers: [CategoryService, PrismaService, CloudflareService],
  controllers: [CategoryController],
})
export class CategoryModule {}
