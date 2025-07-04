import { Module } from '@nestjs/common';
import { CategorySectionController } from './section.controller';
import { CategorySectionService } from './section.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth';

@Module({
  imports: [AuthModule],
  controllers: [CategorySectionController],
  providers: [CategorySectionService, PrismaService],
})
export class CategorySectionModule {}
