import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  ValidationPipe,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { AuthGuard } from '../auth/guards/auth.guard';

class SendScheduleNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  prevScheduleId: string;

  @IsUUID()
  @IsNotEmpty()
  newScheduleId: string;

  @IsEmail()
  @IsOptional()
  emailTo?: string;
}

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Retorna as diferenças entre dois schedules
   */
  @Get('schedule-changes')
  async getScheduleChanges(
    @Query('prevScheduleId') prevScheduleId: string,
    @Query('newScheduleId') newScheduleId: string,
  ) {
    return this.notificationService.getScheduleChanges(
      prevScheduleId,
      newScheduleId,
    );
  }

  /**
   * Envia email com as diferenças entre dois schedules
   */
  @Post('send-schedule-notification')
  async sendScheduleNotification(
    @Body(ValidationPipe) dto: SendScheduleNotificationDto,
  ) {
    return this.notificationService.getScheduleChanges(
      dto.prevScheduleId,
      dto.newScheduleId,
      dto.emailTo,
    );
  }
}
