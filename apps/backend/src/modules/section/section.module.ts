import { Module } from '@nestjs/common';
import { SectionController } from './section.controller';
import { SectionService } from './section.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SectionController],
  providers: [SectionService],
})
export class SectionModule {}
