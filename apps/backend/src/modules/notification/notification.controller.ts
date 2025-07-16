import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  ValidationPipe,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { SendScheduleNotificationDto } from './dto/send-schedule-notification.dto';
import { SendCurriculoDto } from './dto/send-curriculo.dto';
import { SendContactDto } from './dto/send-contact.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Endpoint público para receber mensagens de contacto
   */
  @Post('contact')
  @HttpCode(HttpStatus.OK)
  async submitContact(@Body(ValidationPipe) sendContactDto: SendContactDto) {
    try {
      // Enviar mensagem de contacto por email
      await this.notificationService.sendContactMessage(sendContactDto);

      return {
        success: true,
        message:
          'Mensagem enviada com sucesso! Entraremos em contacto em breve.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Erro ao processar mensagem de contacto');
    }
  }

  /**
   * Endpoint público para receber candidaturas
   */
  @Post('candidatura')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('curriculo'))
  async submitCandidatura(
    @Body() sendCurriculoDto: SendCurriculoDto,
    @UploadedFile() curriculo: Express.Multer.File,
  ) {
    try {
      // Validar se o arquivo foi enviado
      if (!curriculo) {
        throw new BadRequestException('Currículo é obrigatório');
      }

      // Validar se é um arquivo PDF
      if (curriculo.mimetype !== 'application/pdf') {
        throw new BadRequestException('Apenas arquivos PDF são aceitos');
      }

      // Validar tamanho do arquivo (10MB)
      if (curriculo.size > 10 * 1024 * 1024) {
        throw new BadRequestException('Arquivo muito grande. Máximo 10MB');
      }

      // Enviar candidatura por email
      await this.notificationService.sendCurriculumApplication(
        sendCurriculoDto,
        curriculo,
      );

      return {
        success: true,
        message: 'Candidatura enviada com sucesso',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Erro ao processar candidatura');
    }
  }

  /**
   * Retorna as diferenças entre dois schedules
   */
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
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
