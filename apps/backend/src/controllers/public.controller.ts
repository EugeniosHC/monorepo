import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NotificationService } from '../modules/notification/notification.service';
import { Express } from 'express';
import { send } from 'process';
import { SendCurriculoDto } from 'src/modules/notification/dto/send-curriculo.dto';

@Controller('public')
export class PublicController {
  constructor(private notificationService: NotificationService) {}

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
}
