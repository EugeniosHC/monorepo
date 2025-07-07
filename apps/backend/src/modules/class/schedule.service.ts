import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ChangeScheduleStatusDto,
  CreateScheduleDto,
  DuplicateScheduleDto,
  GetSchedulesDto,
  UpdateScheduleDto,
} from './dto/schedule.dto';
import {
  ClassSchedule,
  ScheduleStatus,
  Prisma,
  ClassCategory,
} from '@prisma/client';
import { ClerkUser } from '../auth';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Obtém todos os schedules com filtragem opcional por status
   */
  async getAllSchedules(query: GetSchedulesDto) {
    const { status } = query;

    const whereClause: Prisma.ClassScheduleWhereInput = {};
    if (status) {
      whereClause.status = status;
    }

    const schedules = await this.prisma.classSchedule.findMany({
      where: whereClause,
      include: {
        aulas: true,
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: [
        { status: 'asc' }, // ATIVO primeiro
        { updatedAt: 'desc' }, // Mais recentes primeiro
      ],
    });

    return {
      total: schedules.length,
      schedules,
    };
  }

  /**
   * Obtém um único schedule pelo ID
   */
  async getScheduleById(id: string) {
    const schedule = await this.prisma.classSchedule.findUnique({
      where: { id },
      include: {
        aulas: {
          orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        original: true,
        versoes: {
          where: {
            id: {
              not: id, // Não incluir o próprio schedule nas versões
            },
          },
          select: {
            id: true,
            titulo: true,
            status: true,
            criadoPor: true,
            atualizadoPor: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
        substituido: {
          select: {
            id: true,
            titulo: true,
            status: true,
          },
        },
        substituidores: {
          select: {
            id: true,
            titulo: true,
            status: true,
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule com ID ${id} não encontrado`);
    }

    return schedule;
  }

  /**
   * Obtém o schedule ativo atual
   */
  async getActiveSchedule() {
    const activeSchedule = await this.prisma.classSchedule.findFirst({
      where: {
        status: ScheduleStatus.ATIVO,
      },
      include: {
        aulas: {
          orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
        },
      },
    });

    return activeSchedule;
  }

  /**
   * Cria um novo schedule
   */
  async createSchedule(createScheduleDto: CreateScheduleDto, user: ClerkUser) {
    const { titulo, descricao, orcamento, aulas } = createScheduleDto;

    // Verificar o orçamento total baseado nas aulas
    let calculatedOrcamento = 0;
    aulas.forEach((aula) => {
      if (aula.categoria !== ClassCategory.EXPRESS && aula.custo) {
        calculatedOrcamento += aula.custo;
      }
    });

    const schedule = await this.prisma.classSchedule.create({
      data: {
        titulo,
        descricao,
        orcamento: orcamento || calculatedOrcamento,
        isOriginal: true, // É um schedule original (não é uma versão de outro)
        status: ScheduleStatus.RASCUNHO,
        criadoPor:
          user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.email,
        emailCriador: user?.email,
        aulas: {
          create: aulas.map((aula) => ({
            nome: aula.nome,
            categoria: aula.categoria,
            diaSemana: aula.diaSemana,
            horaInicio: aula.horaInicio,
            duracao: aula.duracao,
            sala: aula.sala,
            professor: aula.professor,
            intensidade: aula.intensidade,
            custo: aula.categoria === ClassCategory.EXPRESS ? null : aula.custo,
          })),
        },
        statusHistory: {
          create: {
            statusAntigo: ScheduleStatus.RASCUNHO,
            statusNovo: ScheduleStatus.RASCUNHO,
            alteradoPor:
              user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email,
            emailAlterador: user?.email,
            nota: 'Schedule criado inicialmente como rascunho',
          },
        },
      },
      include: {
        aulas: true,
      },
    });

    return schedule;
  }

  /**
   * Atualiza um schedule existente
   */
  async updateSchedule(updateScheduleDto: UpdateScheduleDto, user: ClerkUser) {
    const { id, titulo, descricao, orcamento, aulas } = updateScheduleDto;

    // Verificar se o schedule existe
    const existingSchedule = await this.prisma.classSchedule.findUnique({
      where: { id },
      include: { aulas: true },
    });

    if (!existingSchedule) {
      throw new NotFoundException(`Schedule com ID ${id} não encontrado`);
    }

    // Verificar se o schedule está ativo e adicionar um aviso no log
    if (existingSchedule.status === ScheduleStatus.ATIVO) {
      this.logger.warn(
        `Editando schedule ativo ${id} - ${existingSchedule.titulo} por ${user.firstName} ${user.lastName}`,
      );
    }

    // Calcular orçamento baseado nas aulas se não foi fornecido
    let calculatedOrcamento = 0;
    aulas.forEach((aula) => {
      if (aula.categoria !== ClassCategory.EXPRESS && aula.custo) {
        calculatedOrcamento += aula.custo;
      }
    });

    // Atualizar o schedule usando uma transação
    const updatedSchedule = await this.prisma.$transaction(async (prisma) => {
      // 1. Excluir todas as aulas existentes
      await prisma.class.deleteMany({
        where: { scheduleId: id },
      });

      // 2. Atualizar o schedule e adicionar novas aulas
      return prisma.classSchedule.update({
        where: { id },
        data: {
          titulo,
          descricao,
          orcamento: orcamento || calculatedOrcamento,
          atualizadoPor: user?.email,
          updatedAt: new Date(),
          aulas: {
            create: aulas.map((aula) => ({
              nome: aula.nome,
              categoria: aula.categoria,
              diaSemana: aula.diaSemana,
              horaInicio: aula.horaInicio,
              duracao: aula.duracao,
              sala: aula.sala,
              professor: aula.professor,
              intensidade: aula.intensidade,
              custo:
                aula.categoria === ClassCategory.EXPRESS ? null : aula.custo,
            })),
          },
        },
        include: {
          aulas: true,
        },
      });
    });

    return updatedSchedule;
  }

  /**
   * Duplica um schedule existente para criar uma nova versão
   */
  async duplicateSchedule(duplicateDto: DuplicateScheduleDto, user: ClerkUser) {
    const { scheduleId, novoTitulo } = duplicateDto;

    // Buscar o schedule original com todas as aulas
    const originalSchedule = await this.prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      include: { aulas: true },
    });

    if (!originalSchedule) {
      throw new NotFoundException(
        `Schedule com ID ${scheduleId} não encontrado`,
      );
    }

    // Criar uma nova versão do schedule
    const newSchedule = await this.prisma.classSchedule.create({
      data: {
        titulo: novoTitulo || `${originalSchedule.titulo} (Nova Versão)`,
        descricao: originalSchedule.descricao,
        orcamento: originalSchedule.orcamento,
        isOriginal: false, // É uma versão de outro schedule
        originalId: scheduleId, // Referência ao schedule original
        status: ScheduleStatus.RASCUNHO,
        criadoPor:
          user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.email,
        emailCriador: user?.email,
        aulas: {
          create: originalSchedule.aulas.map((aula) => ({
            nome: aula.nome,
            categoria: aula.categoria,
            diaSemana: aula.diaSemana,
            horaInicio: aula.horaInicio,
            duracao: aula.duracao,
            sala: aula.sala,
            professor: aula.professor,
            intensidade: aula.intensidade,
            custo: aula.custo,
          })),
        },
        statusHistory: {
          create: {
            statusAntigo: ScheduleStatus.RASCUNHO,
            statusNovo: ScheduleStatus.RASCUNHO,
            alteradoPor:
              user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email,
            emailAlterador: user?.email,
            nota: `Duplicado a partir do schedule ${originalSchedule.titulo}`,
          },
        },
      },
      include: {
        aulas: true,
      },
    });

    return newSchedule;
  }

  /**
   * Altera o status de um schedule
   */
  async changeScheduleStatus(
    changeStatusDto: ChangeScheduleStatusDto,
    user: ClerkUser,
  ) {
    const { scheduleId, novoStatus, nota, dataAtivacao } = changeStatusDto;

    // Buscar o schedule atual
    const currentSchedule = await this.prisma.classSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!currentSchedule) {
      throw new NotFoundException(
        `Schedule com ID ${scheduleId} não encontrado`,
      );
    }

    const antigoStatus = currentSchedule.status;

    // Verificar se o novo status é igual ao atual
    if (antigoStatus === novoStatus) {
      throw new BadRequestException(
        `O schedule já está com o status ${novoStatus}`,
      );
    }

    // Notificar administradores e gerentes sobre a mudança de status
    try {
      await this.notificationService.notifyAdminsAndManagersAboutStatusChange(
        scheduleId,
        novoStatus,
        user,
        nota,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação de status para admins e gerentes: ${error.message}`,
        error.stack,
      );
      // Não interromper o fluxo se a notificação falhar
    }

    // Regras especiais para ativação de um schedule
    if (novoStatus === ScheduleStatus.ATIVO) {
      // Se estamos ativando um schedule, precisamos desativar o schedule ativo atual
      const activeSchedule = await this.prisma.classSchedule.findFirst({
        where: { status: ScheduleStatus.ATIVO },
      });

      if (activeSchedule) {
        // Atualizar o schedule ativo atual para SUBSTITUIDO
        const result = await this.prisma.$transaction([
          // Desativar o schedule atual
          this.prisma.classSchedule.update({
            where: { id: activeSchedule.id },
            data: {
              status: ScheduleStatus.SUBSTITUIDO,
              dataDesativacao: new Date(),
              statusHistory: {
                create: {
                  statusAntigo: ScheduleStatus.ATIVO,
                  statusNovo: ScheduleStatus.SUBSTITUIDO,
                  alteradoPor:
                    user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email,
                  emailAlterador: user?.email,
                  nota: `Desativado automaticamente ao ativar o schedule ${currentSchedule.titulo}`,
                },
              },
            },
          }),

          // Atualizar o novo schedule para ATIVO
          this.prisma.classSchedule.update({
            where: { id: scheduleId },
            data: {
              status: ScheduleStatus.ATIVO,
              dataAtivacao: new Date(),
              substituidoId: activeSchedule.id, // Referência ao schedule que foi substituído
              statusHistory: {
                create: {
                  statusAntigo: antigoStatus,
                  statusNovo: ScheduleStatus.ATIVO,
                  alteradoPor:
                    user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email,
                  emailAlterador: user?.email,
                  nota:
                    nota ||
                    `Ativado em substituição ao schedule ${activeSchedule.titulo}`,
                },
              },
            },
          }),
        ]);

        // Após ativar o novo schedule, enviar notificação com as diferenças
        try {
          await this.notificationService.sendScheduleChangesNotification(
            activeSchedule.id,
            scheduleId,
            user,
          );
          this.logger.log(
            `Notificação de alterações do schedule enviada com sucesso`,
          );
        } catch (error) {
          this.logger.error(
            `Erro ao enviar notificação de alterações do schedule: ${error.message}`,
            error.stack,
          );
          // Não falhar a operação se a notificação falhar
        }
      } else {
        // Não há schedule ativo, simplesmente ativar o atual
        await this.prisma.classSchedule.update({
          where: { id: scheduleId },
          data: {
            status: ScheduleStatus.ATIVO,
            dataAtivacao: new Date(),
            statusHistory: {
              create: {
                statusAntigo: antigoStatus,
                statusNovo: ScheduleStatus.ATIVO,
                alteradoPor:
                  user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email,
                emailAlterador: user?.email,
                nota: nota || 'Ativado como primeiro schedule',
              },
            },
          },
        });

        // Como é o primeiro schedule, não há comparação a ser feita, mas podemos registrar
        // este schedule como base para futuras comparações
        try {
          await this.notificationService.registerInitialSchedule(scheduleId);
          this.logger.log(`Schedule inicial registrado com sucesso`);
        } catch (error) {
          this.logger.error(
            `Erro ao registrar schedule inicial: ${error.message}`,
            error.stack,
          );
          // Não falhar a operação se o registro falhar
        }
      }
    } else if (novoStatus === ScheduleStatus.APROVADO) {
      // Verificar se já existe um schedule aprovado
      const approvedSchedule = await this.prisma.classSchedule.findFirst({
        where: { status: ScheduleStatus.APROVADO },
      });

      if (approvedSchedule && approvedSchedule.id !== scheduleId) {
        // Se já existe um schedule aprovado, mudar ele para PENDENTE
        await this.prisma.$transaction([
          // Mudar o schedule aprovado atual para PENDENTE
          this.prisma.classSchedule.update({
            where: { id: approvedSchedule.id },
            data: {
              status: ScheduleStatus.PENDENTE,
              dataAtivacao: null, // Remover qualquer data de ativação
              statusHistory: {
                create: {
                  statusAntigo: ScheduleStatus.APROVADO,
                  statusNovo: ScheduleStatus.PENDENTE,
                  alteradoPor:
                    user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email,
                  emailAlterador: user?.email,
                  nota: `Retornado automaticamente para PENDENTE ao aprovar o schedule ${currentSchedule.titulo}`,
                },
              },
            },
          }),

          // Aprovar o novo schedule
          this.prisma.classSchedule.update({
            where: { id: scheduleId },
            data: {
              status: ScheduleStatus.APROVADO,
              aprovadoPor:
                user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email,
              emailAprovador: user?.email,
              dataAprovacao: new Date(),
              dataAtivacao: dataAtivacao ? new Date(dataAtivacao) : null,
              notaAprovacao:
                nota ||
                `Aprovado em substituição ao schedule ${approvedSchedule.titulo}`,
              statusHistory: {
                create: {
                  statusAntigo: antigoStatus,
                  statusNovo: ScheduleStatus.APROVADO,
                  alteradoPor:
                    user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email,
                  emailAlterador: user?.email,
                  nota: dataAtivacao
                    ? `Aprovado em substituição ao schedule ${approvedSchedule.titulo}. Ativação agendada para ${dataAtivacao}`
                    : nota ||
                      `Aprovado em substituição ao schedule ${approvedSchedule.titulo}`,
                },
              },
            },
          }),
        ]);
      } else {
        // Não há schedule aprovado, simplesmente aprovar o atual
        await this.prisma.classSchedule.update({
          where: { id: scheduleId },
          data: {
            status: novoStatus,
            aprovadoPor:
              user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email,
            emailAprovador: user?.email,
            dataAprovacao: new Date(),
            // Adicionar data de ativação agendada se fornecida
            dataAtivacao: dataAtivacao ? new Date(dataAtivacao) : null,
            notaAprovacao: nota || 'Aprovado',
            statusHistory: {
              create: {
                statusAntigo: antigoStatus,
                statusNovo: novoStatus,
                alteradoPor:
                  user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email,
                emailAlterador: user?.email,
                nota: dataAtivacao
                  ? `Status alterado de ${antigoStatus} para ${novoStatus}. Ativação agendada para ${dataAtivacao}`
                  : nota ||
                    `Status alterado de ${antigoStatus} para ${novoStatus}`,
              },
            },
          },
        });
      }
    } else {
      // Para outros status, simplesmente atualizamos o schedule
      await this.prisma.classSchedule.update({
        where: { id: scheduleId },
        data: {
          status: novoStatus,
          aprovadoPor:
            novoStatus === ScheduleStatus.REJEITADO
              ? user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email
              : currentSchedule.aprovadoPor,
          emailAprovador:
            novoStatus === ScheduleStatus.REJEITADO
              ? user?.email
              : currentSchedule.emailAprovador,
          dataAprovacao:
            novoStatus === ScheduleStatus.REJEITADO
              ? new Date()
              : currentSchedule.dataAprovacao,
          notaAprovacao:
            novoStatus === ScheduleStatus.REJEITADO
              ? nota || currentSchedule.notaAprovacao
              : currentSchedule.notaAprovacao,
          statusHistory: {
            create: {
              statusAntigo: antigoStatus,
              statusNovo: novoStatus,
              alteradoPor:
                user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email,
              emailAlterador: user?.email,
              nota:
                nota || `Status alterado de ${antigoStatus} para ${novoStatus}`,
            },
          },
        },
      });
    }

    // Buscar o schedule atualizado
    return this.getScheduleById(scheduleId);
  }

  /**
   * Obtém o histórico de schedules ativos
   */
  async getScheduleHistory() {
    const history = await this.prisma.classSchedule.findMany({
      where: {
        OR: [
          { status: ScheduleStatus.ATIVO },
          { status: ScheduleStatus.SUBSTITUIDO },
        ],
      },
      include: {
        statusHistory: {
          where: {
            OR: [
              { statusNovo: ScheduleStatus.ATIVO },
              { statusAntigo: ScheduleStatus.ATIVO },
            ],
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [
        { status: 'asc' }, // ATIVO primeiro
        { dataAtivacao: 'desc' }, // Mais recentes primeiro
      ],
    });

    return {
      total: history.length,
      history,
    };
  }

  /**
   * Exclui um schedule (apenas para rascunhos)
   */
  async deleteSchedule(id: string) {
    const schedule = await this.prisma.classSchedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule com ID ${id} não encontrado`);
    }

    if (
      schedule.status !== ScheduleStatus.RASCUNHO &&
      schedule.status !== ScheduleStatus.REJEITADO
    ) {
      throw new BadRequestException(
        'Apenas schedules em rascunho ou rejeitados podem ser excluídos',
      );
    }

    // Excluir o schedule e todas as aulas relacionadas
    await this.prisma.$transaction([
      this.prisma.class.deleteMany({
        where: { scheduleId: id },
      }),
      this.prisma.scheduleStatusLog.deleteMany({
        where: { scheduleId: id },
      }),
      this.prisma.classSchedule.delete({
        where: { id },
      }),
    ]);

    return { success: true, message: 'Schedule excluído com sucesso' };
  }
}
