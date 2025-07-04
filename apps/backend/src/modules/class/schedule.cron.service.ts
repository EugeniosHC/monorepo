import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleService } from './schedule.service';
import { ScheduleStatus } from '@prisma/client';

@Injectable()
export class ScheduleCronService {
  private readonly logger = new Logger(ScheduleCronService.name);

  constructor(
    private prisma: PrismaService,
    private scheduleService: ScheduleService,
  ) {}

  // Executar a cada hora para verificar programações que precisam ser ativadas
  @Cron(CronExpression.EVERY_HOUR)
  async checkScheduledActivations() {
    this.logger.log('Verificando programações com ativação agendada...');

    try {
      // Buscar todas as programações aprovadas com data de ativação no passado
      const schedulesToActivate = await this.prisma.classSchedule.findMany({
        where: {
          status: ScheduleStatus.APROVADO,
          dataAtivacao: {
            not: null,
            lte: new Date(), // Data de ativação menor ou igual a agora
          },
        },
      });

      if (schedulesToActivate.length === 0) {
        this.logger.log('Nenhuma programação para ativar automaticamente.');
        return;
      }

      this.logger.log(
        `Encontradas ${schedulesToActivate.length} programações para ativar.`,
      );

      // Ativar cada programação encontrada
      for (const schedule of schedulesToActivate) {
        try {
          // Usar um usuário "sistema" para a ativação automática
          const systemUser = {
            userId: 'system',
            email: 'system@sistema.com',
            firstName: 'Sistema',
            lastName: 'Automático',
          };

          await this.scheduleService.changeScheduleStatus(
            {
              scheduleId: schedule.id,
              novoStatus: ScheduleStatus.ATIVO,
              nota: `Ativação automática agendada para ${schedule.dataAtivacao.toLocaleString()}`,
            },
            systemUser,
          );

          this.logger.log(
            `Programação ${schedule.id} (${schedule.titulo}) ativada automaticamente.`,
          );
        } catch (error) {
          this.logger.error(
            `Erro ao ativar programação ${schedule.id}: ${error.message}`,
            error.stack,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Erro ao verificar programações agendadas: ${error.message}`,
        error.stack,
      );
    }
  }
}
