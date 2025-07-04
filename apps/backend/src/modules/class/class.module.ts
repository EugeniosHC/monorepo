import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { Module } from '@nestjs/common';
import { OVGModule } from '../ovg/ovg.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { ScheduleCronService } from './schedule.cron.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [OVGModule, PrismaModule, AuthModule, NotificationModule],
  controllers: [ClassController, ScheduleController],
  providers: [ClassService, ScheduleService, ScheduleCronService],
})
export class ClassModule {}
