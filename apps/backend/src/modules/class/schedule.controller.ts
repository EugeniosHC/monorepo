import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import {
  ChangeScheduleStatusDto,
  CreateScheduleDto,
  DuplicateScheduleDto,
  GetSchedulesDto,
  UpdateScheduleDto,
} from './dto/schedule.dto';
import { AuthGuard, ClerkUser, CurrentUser, Roles, UserRole } from '../auth';

@Controller('schedules')
@UseGuards(AuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getAllSchedules(
    @Query(new ValidationPipe({ transform: true })) query: GetSchedulesDto,
  ) {
    return this.scheduleService.getAllSchedules(query);
  }

  @Get('active')
  async getActiveSchedule() {
    return this.scheduleService.getActiveSchedule();
  }

  @Get('history')
  async getScheduleHistory() {
    return this.scheduleService.getScheduleHistory();
  }

  @Get(':id')
  async getScheduleById(@Param('id') id: string) {
    return this.scheduleService.getScheduleById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async createSchedule(
    @Body(new ValidationPipe({ transform: true }))
    createScheduleDto: CreateScheduleDto,
    @CurrentUser() user: ClerkUser,
  ) {
    return this.scheduleService.createSchedule(createScheduleDto, user);
  }

  @Put()
  @Roles(UserRole.ADMIN)
  async updateSchedule(
    @Body(new ValidationPipe({ transform: true }))
    updateScheduleDto: UpdateScheduleDto,
    @CurrentUser() user: ClerkUser,
  ) {
    return this.scheduleService.updateSchedule(updateScheduleDto, user);
  }

  @Post('duplicate')
  @Roles(UserRole.ADMIN)
  async duplicateSchedule(
    @Body(new ValidationPipe({ transform: true }))
    duplicateDto: DuplicateScheduleDto,
    @CurrentUser() user: ClerkUser,
  ) {
    return this.scheduleService.duplicateSchedule(duplicateDto, user);
  }

  @Post('status')
  @Roles(UserRole.ADMIN)
  async changeScheduleStatus(
    @Body(new ValidationPipe({ transform: true }))
    changeStatusDto: ChangeScheduleStatusDto,
    @CurrentUser() user: ClerkUser,
  ) {
    return this.scheduleService.changeScheduleStatus(changeStatusDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteSchedule(@Param('id') id: string) {
    return this.scheduleService.deleteSchedule(id);
  }
}
