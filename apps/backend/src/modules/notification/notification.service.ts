import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface ClassChange {
  changeType: 'ADDED' | 'REMOVED' | 'MODIFIED';
  className: string;
  classData: any;
  prevData?: any;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Envia email com as diferenças de aulas quando um novo schedule fica ativo
   * @param prevScheduleId ID do schedule anterior que foi substituído
   * @param newScheduleId ID do novo schedule ativo
   * @param user Informações do usuário que fez a alteração
   */
  async sendScheduleChangesNotification(
    prevScheduleId: string,
    newScheduleId: string,
    user: any,
  ): Promise<void> {
    try {
      // Buscar o schedule que acabou de ficar ativo
      const newSchedule = await this.prisma.classSchedule.findUnique({
        where: { id: newScheduleId },
        include: {
          aulas: {
            where: {
              categoria: {
                not: 'EXPRESS', // Excluir aulas EXPRESS conforme solicitado
              },
            },
          },
        },
      });

      if (!newSchedule) {
        this.logger.warn(
          `Schedule ${newScheduleId} não encontrado para notificação`,
        );
        return;
      }

      // Buscar o schedule anterior para comparação direta
      let prevSchedule = null;
      let prevClasses = [];

      if (prevScheduleId) {
        prevSchedule = await this.prisma.classSchedule.findUnique({
          where: { id: prevScheduleId },
          include: {
            aulas: {
              where: {
                categoria: {
                  not: 'EXPRESS', // Excluir aulas EXPRESS conforme solicitado
                },
              },
            },
          },
        });

        if (prevSchedule) {
          prevClasses = prevSchedule.aulas;
        }
      }

      // Comparar as aulas para encontrar diferenças
      const classChanges = this.compareClasses(prevClasses, newSchedule.aulas);

      // Se não houver diferenças, não enviar email
      if (classChanges.length === 0) {
        this.logger.log('Nenhuma diferença encontrada, email não enviado');
        return;
      }

      // Preparar o conteúdo do email
      const emailContent = this.prepareEmailContent(
        prevSchedule?.titulo,
        newSchedule.titulo,
        classChanges,
      );

      // Enviar o email
      const emailConfig = this.configService.get('email');
      const recipientEmail =
        emailConfig?.notification || 'programacoes@eugenios.pt';
      await this.sendEmail(recipientEmail, emailContent);

      // Registrar a notificação no banco de dados
      await this.saveNotificationRecord(
        prevScheduleId,
        newScheduleId,
        prevSchedule?.titulo,
        newSchedule.titulo,
        recipientEmail,
        emailContent,
        classChanges,
      );

      this.logger.log(
        `Notificação enviada com sucesso para schedule ${newSchedule.titulo}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação de alteração de schedule: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Compara as aulas antigas com as novas para identificar diferenças
   */
  private compareClasses(oldClasses: any[], newClasses: any[]): ClassChange[] {
    const changes: ClassChange[] = [];

    // Identificar aulas adicionadas ou modificadas
    for (const newClass of newClasses) {
      // Procurar por uma aula correspondente nas antigas
      const matchingOldClass = oldClasses.find(
        (oldClass) =>
          oldClass.nome === newClass.nome &&
          oldClass.diaSemana === newClass.diaSemana &&
          oldClass.horaInicio === newClass.horaInicio,
      );

      if (!matchingOldClass) {
        changes.push({
          changeType: 'ADDED',
          className: newClass.nome,
          classData: newClass,
        });
      } else {
        // Se encontrar, verificar se houve modificações
        if (
          matchingOldClass.duracao !== newClass.duracao ||
          matchingOldClass.sala !== newClass.sala ||
          matchingOldClass.professor !== newClass.professor ||
          matchingOldClass.intensidade !== newClass.intensidade ||
          matchingOldClass.categoria !== newClass.categoria
        ) {
          changes.push({
            changeType: 'MODIFIED',
            className: newClass.nome,
            classData: newClass,
            prevData: matchingOldClass,
          });
        }
      }
    }

    // Identificar aulas removidas
    for (const oldClass of oldClasses) {
      const wasRemoved = !newClasses.some(
        (newClass) =>
          newClass.nome === oldClass.nome &&
          newClass.diaSemana === oldClass.diaSemana &&
          newClass.horaInicio === oldClass.horaInicio,
      );

      if (wasRemoved) {
        changes.push({
          changeType: 'REMOVED',
          className: oldClass.nome,
          classData: oldClass,
        });
      }
    }

    return changes;
  }

  /**
   * Prepara o conteúdo do email com as diferenças
   */
  private prepareEmailContent(
    prevScheduleTitle: string | undefined,
    newScheduleTitle: string,
    changes: ClassChange[],
  ): string {
    const dayNames = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ];

    // Agrupar as mudanças por tipo
    const added = changes.filter((change) => change.changeType === 'ADDED');
    const removed = changes.filter((change) => change.changeType === 'REMOVED');
    const modified = changes.filter(
      (change) => change.changeType === 'MODIFIED',
    );

    let content = `<h1>Alterações no Horário de Aulas</h1>`;

    if (prevScheduleTitle) {
      content += `<p>O horário <strong>${prevScheduleTitle}</strong> foi substituído pelo novo horário <strong>${newScheduleTitle}</strong> e apresenta as seguintes diferenças:</p>`;
    } else {
      content += `<p>O novo horário <strong>${newScheduleTitle}</strong> foi ativado e apresenta as seguintes diferenças:</p>`;
    }

    // Aulas adicionadas
    if (added.length > 0) {
      content += `<h2>Novas Aulas (${added.length})</h2>
<ul>`;
      added.forEach((change) => {
        const aula = change.classData;
        content += `<li>
  <strong>${aula.nome}</strong> (${aula.categoria}) - 
  ${dayNames[aula.diaSemana]} às ${aula.horaInicio} - 
  ${aula.duracao} min - 
  Professor: ${aula.professor} - 
  Sala: ${aula.sala}
</li>`;
      });
      content += `</ul>`;
    }

    // Aulas removidas
    if (removed.length > 0) {
      content += `<h2>Aulas Removidas (${removed.length})</h2>
<ul>`;
      removed.forEach((change) => {
        const aula = change.classData;
        content += `<li>
  <strong>${aula.nome}</strong> (${aula.categoria}) - 
  ${dayNames[aula.diaSemana]} às ${aula.horaInicio} - 
  ${aula.duracao} min - 
  Professor: ${aula.professor} - 
  Sala: ${aula.sala}
</li>`;
      });
      content += `</ul>`;
    }

    // Aulas modificadas
    if (modified.length > 0) {
      content += `<h2>Aulas Modificadas (${modified.length})</h2>
<ul>`;
      modified.forEach((change) => {
        const newAula = change.classData;
        const oldAula = change.prevData;

        content += `<li>
  <strong>${newAula.nome}</strong> - ${dayNames[newAula.diaSemana]} às ${newAula.horaInicio}
  <ul>`;

        // Listar apenas os campos que foram alterados
        if (oldAula.categoria !== newAula.categoria) {
          content += `<li>Categoria: ${oldAula.categoria} → ${newAula.categoria}</li>`;
        }
        if (oldAula.duracao !== newAula.duracao) {
          content += `<li>Duração: ${oldAula.duracao} min → ${newAula.duracao} min</li>`;
        }
        if (oldAula.sala !== newAula.sala) {
          content += `<li>Sala: ${oldAula.sala} → ${newAula.sala}</li>`;
        }
        if (oldAula.professor !== newAula.professor) {
          content += `<li>Professor: ${oldAula.professor} → ${newAula.professor}</li>`;
        }
        if (oldAula.intensidade !== newAula.intensidade) {
          content += `<li>Intensidade: ${oldAula.intensidade} → ${newAula.intensidade}</li>`;
        }

        content += `  </ul>
</li>`;
      });
      content += `</ul>`;
    }

    content += `<p>Esta é uma mensagem automática. Por favor, não responda a este email.</p>`;

    return content;
  }

  /**
   * Salva o registro da notificação no banco de dados
   */
  private async saveNotificationRecord(
    prevScheduleId: string | null,
    newScheduleId: string,
    prevScheduleTitle: string | null,
    newScheduleTitle: string,
    emailSentTo: string,
    emailContent: string,
    classChanges: ClassChange[],
  ): Promise<void> {
    // Criar o registro da notificação
    const notification = await this.prisma.scheduleNotification.create({
      data: {
        schedulePrevId: prevScheduleId || null,
        scheduleNewId: newScheduleId,
        schedulePrevTitle: prevScheduleTitle || null,
        scheduleNewTitle: newScheduleTitle,
        emailSentTo: emailSentTo,
        emailContent: emailContent,
        classChanges: {
          create: classChanges.map((change) => {
            const baseData = {
              changeType: change.changeType,
              className: change.className,
              classCategory: change.classData.categoria,
              weekDay: change.classData.diaSemana,
              startTime: change.classData.horaInicio,
              duration: change.classData.duracao,
              room: change.classData.sala,
              teacher: change.classData.professor,
              intensity: change.classData.intensidade,
            };

            // Adicionar campos prev* para mudanças do tipo MODIFIED
            if (change.changeType === 'MODIFIED' && change.prevData) {
              return {
                ...baseData,
                prevCategory:
                  change.prevData.categoria !== change.classData.categoria
                    ? change.prevData.categoria
                    : null,
                prevDuration:
                  change.prevData.duracao !== change.classData.duracao
                    ? change.prevData.duracao
                    : null,
                prevRoom:
                  change.prevData.sala !== change.classData.sala
                    ? change.prevData.sala
                    : null,
                prevTeacher:
                  change.prevData.professor !== change.classData.professor
                    ? change.prevData.professor
                    : null,
                prevIntensity:
                  change.prevData.intensidade !== change.classData.intensidade
                    ? change.prevData.intensidade
                    : null,
              };
            }

            return baseData;
          }),
        },
      },
    });

    this.logger.log(`Registro de notificação salvo com ID ${notification.id}`);
  }

  /**
   * Obtém as diferenças entre dois schedules e opcionalmente envia por email
   * @param prevScheduleId ID do schedule anterior para comparação
   * @param newScheduleId ID do schedule atual
   * @param emailTo Email opcional para envio da notificação
   * @returns Objeto com as diferenças encontradas, agrupadas por dia da semana
   */
  async getScheduleChanges(
    prevScheduleId: string,
    newScheduleId: string,
    emailTo?: string,
  ): Promise<any> {
    try {
      // Buscar o schedule atual
      const newSchedule = await this.prisma.classSchedule.findUnique({
        where: { id: newScheduleId },
        include: {
          aulas: {
            where: {
              categoria: {
                not: 'EXPRESS', // Excluir aulas EXPRESS conforme solicitado
              },
            },
          },
        },
      });

      if (!newSchedule) {
        throw new Error(`Schedule ${newScheduleId} não encontrado`);
      }

      // Buscar o schedule anterior para comparação
      const prevSchedule = await this.prisma.classSchedule.findUnique({
        where: { id: prevScheduleId },
        include: {
          aulas: {
            where: {
              categoria: {
                not: 'EXPRESS', // Excluir aulas EXPRESS conforme solicitado
              },
            },
          },
        },
      });

      // Verificar se há notificações anteriores se o schedule anterior não existir
      let previousClasses = [];
      let classChanges = [];

      if (!prevSchedule) {
        this.logger.log(
          `Schedule anterior ${prevScheduleId} não encontrado, buscando última notificação`,
        );

        // Buscar a última notificação enviada para qualquer schedule
        const lastNotification =
          await this.prisma.scheduleNotification.findFirst({
            where: {
              // Podemos adicionar filtros adicionais se necessário
            },
            orderBy: {
              sentAt: 'desc', // A notificação mais recente
            },
            include: {
              classChanges: true,
            },
          });

        if (lastNotification) {
          this.logger.log(
            `Última notificação encontrada (ID: ${lastNotification.id}), comparando com suas classes`,
          );

          // Converter as mudanças de classe da última notificação em um formato compatível para comparação
          const classesFromLastNotification = lastNotification.classChanges
            .filter(
              (change) =>
                change.changeType === 'ADDED' ||
                change.changeType === 'MODIFIED',
            )
            .map((change) => ({
              id: change.id,
              nome: change.className,
              categoria: change.classCategory,
              diaSemana: change.weekDay,
              horaInicio: change.startTime,
              duracao: change.duration,
              sala: change.room,
              professor: change.teacher,
              intensidade: change.intensity,
            }));

          previousClasses = classesFromLastNotification;

          // Comparar com as aulas do novo schedule
          classChanges = this.compareClasses(
            previousClasses,
            newSchedule.aulas,
          );
        } else {
          this.logger.log(
            `Nenhuma notificação anterior encontrada, considerando todas as aulas como novas`,
          );
          // Criar mudanças do tipo ADDED para todas as aulas do novo schedule
          classChanges = newSchedule.aulas.map((aula) => ({
            changeType: 'ADDED',
            className: aula.nome,
            classData: aula,
          }));
        }
      } else {
        // Usar o schedule anterior normalmente para comparação
        previousClasses = prevSchedule.aulas;
        classChanges = this.compareClasses(previousClasses, newSchedule.aulas);
      }

      // Agrupar as alterações por dia da semana
      const changesByDay = this.groupChangesByDay(classChanges);

      // Se um email foi fornecido, enviar a notificação
      if (emailTo) {
        // Preparar o conteúdo do email com base se existe classes anteriores ou não
        const emailContent =
          previousClasses.length > 0
            ? this.prepareEmailContentByDay(
                prevSchedule?.titulo || 'Horário anterior',
                newSchedule.titulo,
                changesByDay,
              )
            : this.prepareEmailContentForInitialSchedule(
                newSchedule.titulo,
                changesByDay,
              );

        // Enviar o email
        await this.sendEmail(emailTo, emailContent);

        // Registrar a notificação enviada
        await this.saveNotificationRecord(
          prevSchedule ? prevScheduleId : null,
          newScheduleId,
          prevSchedule ? prevSchedule.titulo : null,
          newSchedule.titulo,
          emailTo,
          emailContent,
          classChanges,
        );

        this.logger.log(`Notificação manual enviada para ${emailTo}`);
      }

      // Retornar as diferenças encontradas
      return {
        prevSchedule: prevSchedule
          ? {
              id: prevSchedule.id,
              titulo: prevSchedule.titulo,
            }
          : null,
        newSchedule: {
          id: newSchedule.id,
          titulo: newSchedule.titulo,
        },
        changesByDay,
        totalChanges: classChanges.length,
        hadPreviousClasses: previousClasses.length > 0,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao obter alterações do schedule: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Agrupa as alterações por dia da semana
   * @param changes Lista de alterações
   * @returns Objeto com as alterações agrupadas por dia da semana
   */
  private groupChangesByDay(changes: ClassChange[]): any {
    const dayNames = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ];

    // Inicializar objeto com todos os dias da semana
    const changesByDay = {};
    for (let i = 0; i < 7; i++) {
      changesByDay[i] = {
        dayName: dayNames[i],
        added: [],
        removed: [],
        modified: [],
        hasChanges: false,
      };
    }

    // Distribuir as alterações por dia
    changes.forEach((change) => {
      const day = change.classData.diaSemana;

      switch (change.changeType) {
        case 'ADDED':
          changesByDay[day].added.push(change.classData);
          break;
        case 'REMOVED':
          changesByDay[day].removed.push(change.classData);
          break;
        case 'MODIFIED':
          changesByDay[day].modified.push({
            new: change.classData,
            old: change.prevData,
          });
          break;
      }

      // Marcar dia como tendo alterações
      if (
        changesByDay[day].added.length > 0 ||
        changesByDay[day].removed.length > 0 ||
        changesByDay[day].modified.length > 0
      ) {
        changesByDay[day].hasChanges = true;
      }
    });

    return changesByDay;
  }

  /**
   * Prepara o conteúdo do email para um schedule inicial (sem comparação)
   */
  private prepareEmailContentForInitialSchedule(
    scheduleTitle: string,
    changesByDay: any,
  ): string {
    let content = `<h1>Primeiro Horário de Aulas Ativado</h1>
<p>O horário <strong>${scheduleTitle}</strong> foi ativado como o primeiro horário e contém as seguintes aulas:</p>`;

    // Para cada dia da semana
    for (let i = 0; i < 7; i++) {
      const dayData = changesByDay[i];

      if (!dayData.hasChanges) {
        continue; // Pular dias sem aulas
      }

      content += `<h2>${dayData.dayName}</h2>`;

      // Listar as aulas (todas são novas)
      if (dayData.added.length > 0) {
        content += `<h3>Aulas (${dayData.added.length})</h3>
<ul>`;
        dayData.added.forEach((aula) => {
          content += `<li>
  <strong>${aula.nome}</strong> (${aula.categoria}) - 
  às ${aula.horaInicio} - 
  ${aula.duracao} min - 
  Professor: ${aula.professor} - 
  Sala: ${aula.sala}
</li>`;
        });
        content += `</ul>`;
      }
    }

    content += `<p>Esta é uma mensagem automática. Por favor, não responda a este email.</p>`;

    return content;
  }

  /**
   * Prepara o conteúdo do email com as diferenças, organizadas por dia da semana
   */
  private prepareEmailContentByDay(
    prevScheduleTitle: string,
    newScheduleTitle: string,
    changesByDay: any,
  ): string {
    let content = `<h1>Alterações no Horário de Aulas</h1>
<p>O horário <strong>${prevScheduleTitle}</strong> foi substituído pelo novo horário <strong>${newScheduleTitle}</strong> e apresenta as seguintes diferenças por dia:</p>`;

    // Para cada dia da semana
    for (let i = 0; i < 7; i++) {
      const dayData = changesByDay[i];

      if (!dayData.hasChanges) {
        content += `<h2>${dayData.dayName}</h2>
<p>Sem alterações para este dia.</p>`;
        continue;
      }

      content += `<h2>${dayData.dayName}</h2>`;

      // Aulas adicionadas
      if (dayData.added.length > 0) {
        content += `<h3>Novas Aulas (${dayData.added.length})</h3>
<ul>`;
        dayData.added.forEach((aula) => {
          content += `<li>
  <strong>${aula.nome}</strong> (${aula.categoria}) - 
  às ${aula.horaInicio} - 
  ${aula.duracao} min - 
  Professor: ${aula.professor} - 
  Sala: ${aula.sala}
</li>`;
        });
        content += `</ul>`;
      }

      // Aulas removidas
      if (dayData.removed.length > 0) {
        content += `<h3>Aulas Removidas (${dayData.removed.length})</h3>
<ul>`;
        dayData.removed.forEach((aula) => {
          content += `<li>
  <strong>${aula.nome}</strong> (${aula.categoria}) - 
  às ${aula.horaInicio} - 
  ${aula.duracao} min - 
  Professor: ${aula.professor} - 
  Sala: ${aula.sala}
</li>`;
        });
        content += `</ul>`;
      }

      // Aulas modificadas
      if (dayData.modified.length > 0) {
        content += `<h3>Aulas Modificadas (${dayData.modified.length})</h3>
<ul>`;
        dayData.modified.forEach((change) => {
          const newAula = change.new;
          const oldAula = change.old;

          content += `<li>
  <strong>${newAula.nome}</strong> - às ${newAula.horaInicio}
  <ul>`;

          // Listar apenas os campos que foram alterados
          if (oldAula.categoria !== newAula.categoria) {
            content += `<li>Categoria: ${oldAula.categoria} → ${newAula.categoria}</li>`;
          }
          if (oldAula.duracao !== newAula.duracao) {
            content += `<li>Duração: ${oldAula.duracao} min → ${newAula.duracao} min</li>`;
          }
          if (oldAula.sala !== newAula.sala) {
            content += `<li>Sala: ${oldAula.sala} → ${newAula.sala}</li>`;
          }
          if (oldAula.professor !== newAula.professor) {
            content += `<li>Professor: ${oldAula.professor} → ${newAula.professor}</li>`;
          }
          if (oldAula.intensidade !== newAula.intensidade) {
            content += `<li>Intensidade: ${oldAula.intensidade} → ${newAula.intensidade}</li>`;
          }

          content += `  </ul>
</li>`;
        });
        content += `</ul>`;
      }
    }

    content += `<p>Esta é uma mensagem automática. Por favor, não responda a este email.</p>`;

    return content;
  }

  /**
   * Envia o email com as diferenças
   */
  private async sendEmail(
    recipientEmail: string,
    content: string,
  ): Promise<void> {
    try {
      // Obter configurações de email das variáveis de ambiente
      const emailConfig = this.configService.get('email');

      if (
        !emailConfig ||
        !emailConfig.host ||
        !emailConfig.user ||
        !emailConfig.password
      ) {
        // Se não estiverem configuradas, apenas simular o envio
        this.logger.warn(
          'Configurações de email não definidas. Simulando envio...',
        );
        this.logger.log(`[SIMULAÇÃO] Email enviado para ${recipientEmail}`);
        this.logger.log(
          `[SIMULAÇÃO] Conteúdo do email: ${content.substring(0, 200)}...`,
        );
        return;
      }

      // Criar transportador de email
      const transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.port === 465, // true para 465, false para outros portos
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password,
        },
      });

      // Definir opções do email
      const mailOptions = {
        from: emailConfig.from,
        to: recipientEmail,
        subject: "Alterações no Horário de Aulas - Eugenio's Health Club",
        html: content,
      };

      // Enviar email
      const info = await transporter.sendMail(mailOptions);
      this.logger.log(`Email enviado: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email: ${error.message}`, error.stack);
      // Não lançar exceção para não interromper o fluxo principal
    }
  }

  /**
   * Registra um schedule como o primeiro (não há comparação a ser feita)
   */
  async registerInitialSchedule(scheduleId: string): Promise<void> {
    try {
      // Buscar o schedule inicial
      const initialSchedule = await this.prisma.classSchedule.findUnique({
        where: { id: scheduleId },
        include: {
          aulas: {
            where: {
              categoria: {
                not: 'EXPRESS', // Excluir aulas EXPRESS conforme solicitado
              },
            },
          },
        },
      });

      if (!initialSchedule) {
        this.logger.warn(
          `Schedule ${scheduleId} não encontrado para registro inicial`,
        );
        return;
      }

      // Criar um registro de notificação "inicial" para rastreamento
      const emailConfig = this.configService.get('email');
      const recipientEmail =
        emailConfig?.notification || 'programacoes@eugenios.pt';
      const emailContent = `<h1>Primeiro Horário de Aulas Ativado</h1>
<p>O horário <strong>${initialSchedule.titulo}</strong> foi ativado como o primeiro horário do sistema.</p>
<p>Contém ${initialSchedule.aulas.length} aulas.</p>`;

      await this.prisma.scheduleNotification.create({
        data: {
          scheduleNewId: scheduleId,
          scheduleNewTitle: initialSchedule.titulo,
          emailSentTo: recipientEmail,
          emailContent: emailContent,
          // Registrar todas as aulas como "ADDED"
          classChanges: {
            create: initialSchedule.aulas.map((aula) => ({
              changeType: 'ADDED',
              className: aula.nome,
              classCategory: aula.categoria,
              weekDay: aula.diaSemana,
              startTime: aula.horaInicio,
              duration: aula.duracao,
              room: aula.sala,
              teacher: aula.professor,
              intensity: aula.intensidade,
            })),
          },
        },
      });

      this.logger.log(
        `Schedule inicial ${initialSchedule.titulo} registrado com sucesso`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao registrar schedule inicial: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
