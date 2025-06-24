import { Module } from '@nestjs/common';
import { CategorySectionController } from './section.controller';
import { CategorySectionService } from './section.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CategorySectionController],
  providers: [CategorySectionService, PrismaService],
})
export class CategorySectionModule {}
