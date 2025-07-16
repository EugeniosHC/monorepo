import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SendScheduleNotificationDto {
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
