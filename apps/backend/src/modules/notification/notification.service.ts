import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AdminService } from '../admin/admin.service';
import { UserRole } from '../auth';
import { SendCurriculoDto } from './dto/send-curriculo.dto';
import { SendContactDto } from './dto/send-contact.dto';
import emailConfig from 'src/config/email.config';

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
    private adminService: AdminService,
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
  ${aula.duracao} min 
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
  ${aula.duracao} min 
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
    subject?: string,
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
        subject:
          subject || "Alterações no Horário de Aulas - Eugenio's Health Club",
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

  /**
   * Envia currículo por email para o departamento de recursos humanos
   * @param applicationData Dados do formulário de candidatura
   * @param curriculumFile Arquivo do currículo em PDF
   */
  async sendCurriculumApplication(
    sendCurriculoDto: SendCurriculoDto,
    curriculumFile: Express.Multer.File,
  ): Promise<void> {
    try {
      const recipientEmail = 'geral@eugenioshc.com';
      const subject = `Nova Candidatura - ${sendCurriculoDto.function}`;

      // Preparar conteúdo do email
      const emailContent = this.prepareCurriculumEmailContent(sendCurriculoDto);

      // Enviar email com anexo
      await this.sendEmailWithAttachment(
        recipientEmail,
        emailContent,
        subject,
        curriculumFile,
      );

      this.logger.log(
        `Candidatura enviada com sucesso para ${recipientEmail} - ${sendCurriculoDto.name}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar candidatura: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Prepara o conteúdo HTML do email para candidatura
   */
  private prepareCurriculumEmailContent(
    sendCurriculoDto: SendCurriculoDto,
  ): string {
    const currentDate = new Date().toLocaleString('pt-BR');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Candidatura - ${sendCurriculoDto.function}</title>
  <style>
    body { 
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; 
      line-height: 1.6; 
      color: #2d3748; 
      margin: 0; 
      padding: 0; 
      background-color: #f7fafc; 
    }
    .container { 
      max-width: 600px; 
      margin: 30px auto; 
      background-color: white; 
      border-radius: 8px; 
      box-shadow: 0 4px 12px rgba(41, 60, 89, 0.08); 
      overflow: hidden; 
    }
    .header { 
      background: #293c59;
      color: white; 
      padding: 32px 24px; 
      text-align: center; 
    }
    .logo { 
      font-size: 18px; 
      font-weight: 600; 
      margin-bottom: 8px;
      opacity: 0.9;
    }
    .header h1 { 
      margin: 0; 
      font-size: 24px; 
      font-weight: 600; 
    }
    .header p { 
      margin: 4px 0 0 0; 
      opacity: 0.8; 
      font-size: 14px; 
    }
    .content { 
      padding: 32px 24px; 
    }
    .intro-text {
      font-size: 15px;
      color: #4a5568;
      margin-bottom: 24px;
    }
    .candidate-info { 
      border: 1px solid #e2e8f0; 
      border-radius: 6px; 
      padding: 20px; 
      margin: 24px 0; 
      background: #fafafa;
    }
    .info-row { 
      display: flex; 
      margin-bottom: 12px; 
      align-items: flex-start; 
    }
    .info-row:last-child { 
      margin-bottom: 0; 
    }
    .info-label { 
      font-weight: 600; 
      color: #293c59; 
      min-width: 80px; 
      margin-right: 12px; 
      font-size: 14px;
    }
    .info-value { 
      color: #2d3748; 
      flex: 1; 
      font-size: 14px;
    }
    .info-value strong {
      color: #1a202c;
    }
    .info-value a {
      color: #293c59;
      text-decoration: none;
    }
    .info-value a:hover {
      text-decoration: underline;
    }
    .position-badge { 
      display: inline-block; 
      padding: 4px 12px; 
      border-radius: 4px; 
      font-weight: 500; 
      background: #293c59; 
      color: white; 
      font-size: 13px; 
    }
    .attachment-info { 
      background: #f0f9ff;
      border: 1px solid #bfdbfe; 
      border-radius: 6px; 
      padding: 16px; 
      margin: 24px 0; 
      display: flex; 
      align-items: center; 
    }
    .attachment-icon { 
      width: 36px; 
      height: 36px; 
      background: #293c59; 
      border-radius: 4px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      margin-right: 12px; 
      color: white; 
      font-size: 14px;
    }
    .attachment-text {
      flex: 1;
    }
    .attachment-text strong {
      color: #1a202c;
      font-size: 14px;
    }
    .attachment-text small {
      color: #6b7280;
      font-size: 12px;
    }
    .contact-section {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 16px;
      margin: 24px 0;
      text-align: center;
    }
    .contact-section p {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #4a5568;
    }
    .contact-link {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 8px 16px;
      background: #293c59;
      border-radius: 4px;
      display: inline-block;
      font-size: 14px;
    }

    .contact-link a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 8px 16px;
      background: #293c59;
      border-radius: 4px;
      display: inline-block;
      font-size: 14px;
    }

  
    .contact-link:hover {
      background: #3e5a86;
    }
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 24px 0;
    }
    .footer { 
      background: #f7fafc;
      color: #6b7280;
      padding: 20px 24px; 
      text-align: center; 
      border-top: 1px solid #e2e8f0;
    }
    .footer p { 
      margin: 0; 
      font-size: 12px; 
      line-height: 1.4;
    }
    .footer p:first-child {
      margin-bottom: 4px;
    }
    @media (max-width: 600px) {
      .container {
        margin: 15px;
        border-radius: 6px;
      }
      .header, .content, .footer {
        padding: 20px 16px;
      }
      .info-row {
        flex-direction: column;
        margin-bottom: 16px;
      }
      .info-label {
        margin-bottom: 4px;
        min-width: auto;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Eugenio's Health Club</div>
      <h1>Nova Candidatura</h1>
      <p>Recursos Humanos</p>
    </div>
    
    <div class="content">
      <p class="intro-text">Nova candidatura recebida através do website:</p>
      
      <div class="candidate-info">
        <div class="info-row">
          <span class="info-label">Nome:</span>
          <span class="info-value"><strong>${sendCurriculoDto.name}</strong></span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">
            <a href="mailto:${sendCurriculoDto.email}">
              ${sendCurriculoDto.email}
            </a>
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Telefone:</span>
          <span class="info-value">
            <a href="tel:${sendCurriculoDto.phone}">
              ${sendCurriculoDto.phone}
            </a>
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Função:</span>
          <span class="info-value">
            <span class="position-badge">${sendCurriculoDto.function}</span>
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Data:</span>
          <span class="info-value">${currentDate}</span>
        </div>
      </div>

      <div class="attachment-info">
        <div class="attachment-icon">📄</div>
        <div class="attachment-text">
          <strong>Currículo em anexo</strong>
          <br>
          <small>Arquivo PDF incluído neste email</small>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div class="contact-section">
        <p>Para responder ao candidato:</p>
        <a href="mailto:${sendCurriculoDto.email}" class="contact-link" style="text-decoration: none; color: white;">
          Enviar Email
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p>Sistema de candidaturas - Eugenio's Health Club</p>
      <p>${currentDate}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Envia email com anexo
   */
  private async sendEmailWithAttachment(
    recipientEmail: string,
    content: string,
    subject: string,
    attachment: Express.Multer.File,
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
        this.logger.log(`[SIMULAÇÃO] Assunto: ${subject}`);
        this.logger.log(`[SIMULAÇÃO] Anexo: ${attachment.originalname}`);
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

      // Definir opções do email com anexo
      const mailOptions = {
        from: emailConfig.from,
        to: recipientEmail,
        subject: subject,
        html: content,
        attachments: [
          {
            filename: attachment.originalname,
            content: attachment.buffer,
            contentType: attachment.mimetype,
          },
        ],
      };

      // Enviar email
      const info = await transporter.sendMail(mailOptions);
      this.logger.log(`Email com anexo enviado: ${info.messageId}`);
    } catch (error) {
      this.logger.error(
        `Erro ao enviar email com anexo: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Notifica todos os administradores e gerentes de clube sobre mudanças no status do schedule
   * @param scheduleId ID do schedule que teve seu status alterado
   * @param newStatus Novo status do schedule
   * @param changedBy Usuário que fez a alteração
   * @param note Nota opcional sobre a alteração
   */
  async notifyAdminsAndManagersAboutStatusChange(
    scheduleId: string,
    newStatus: string,
    changedBy: any,
    note?: string,
  ): Promise<void> {
    try {
      // Buscar o schedule que teve seu status alterado
      const schedule = await this.prisma.classSchedule.findUnique({
        where: { id: scheduleId },
      });

      if (!schedule) {
        this.logger.warn(
          `Schedule ${scheduleId} não encontrado para notificação de status`,
        );
        return;
      }

      // Buscar todos os usuários admin e club_manager
      const { users } = await this.adminService.getAllUsers(
        UserRole.ADMIN, // Permissão necessária para buscar usuários
        1, // Página
        100, // Limite (ajustar conforme necessário)
      );

      // Filtrar apenas admin e club_manager
      const adminAndManagerUsers = users.filter(
        (user) =>
          user.role === UserRole.ADMIN || user.role === UserRole.CLUB_MANAGER,
      );

      if (adminAndManagerUsers.length === 0) {
        this.logger.warn(
          'Nenhum administrador ou gerente encontrado para notificar',
        );
        return;
      }

      // Preparar o conteúdo do email
      const statusLabels = {
        RASCUNHO: 'Rascunho',
        PENDENTE: 'Pendente de Aprovação',
        APROVADO: 'Aprovado',
        ATIVO: 'Ativo',
        SUBSTITUIDO: 'Substituído',
        REJEITADO: 'Rejeitado',
      };

      const statusColors = {
        RASCUNHO: '#6B7280', // gray-500
        PENDENTE: '#F59E0B', // amber-500
        APROVADO: '#10B981', // emerald-500
        ATIVO: '#3B82F6', // blue-500
        SUBSTITUIDO: '#6366F1', // indigo-500
        REJEITADO: '#EF4444', // red-500
      };

      const changedByName =
        changedBy?.firstName && changedBy?.lastName
          ? `${changedBy.firstName} ${changedBy.lastName}`
          : changedBy?.email || 'Sistema';

      const statusLabel = statusLabels[newStatus] || newStatus;
      const statusColor = statusColors[newStatus] || '#6B7280';

      const emailSubject = `Alteração de Status do Horário - ${schedule.titulo}`;

      const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    .status-badge { 
      display: inline-block; 
      padding: 6px 12px; 
      border-radius: 16px; 
      font-weight: bold; 
      background-color: ${statusColor}; 
      color: white; 
    }
    .details { 
      background-color: #f9fafb; 
      border: 1px solid #e5e7eb; 
      border-radius: 8px; 
      padding: 15px; 
      margin: 20px 0; 
    }
    .footer { 
      font-size: 12px; 
      color: #6B7280; 
      text-align: center; 
      margin-top: 30px; 
      border-top: 1px solid #e5e7eb; 
      padding-top: 15px; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Alteração de Status do Horário</h1>
    </div>
    
    <p>O horário <strong>${schedule.titulo}</strong> teve seu status alterado para <span class="status-badge">${statusLabel}</span></p>
    
    <div class="details">
      <p><strong>Detalhes da alteração:</strong></p>
      <ul>
        <li><strong>ID do Horário:</strong> ${schedule.id}</li>
        <li><strong>Nome do Horário:</strong> ${schedule.titulo}</li>
        <li><strong>Status anterior:</strong> ${statusLabels[schedule.status] || schedule.status}</li>
        <li><strong>Novo status:</strong> ${statusLabel}</li>
        <li><strong>Alterado por:</strong> ${changedByName}</li>
        <li><strong>Data da alteração:</strong> ${new Date().toLocaleString('pt-BR')}</li>
        ${note ? `<li><strong>Nota:</strong> ${note}</li>` : ''}
      </ul>
    </div>
    
    <p>
      Para visualizar ou gerenciar este horário, acesse o <a href="${process.env.FRONTEND_ADMIN_URL || 'http://localhost:3003'}/dashboard/classes">Painel de Administração</a>.
    </p>
    
    <div class="footer">
      <p>Esta é uma mensagem automática. Por favor, não responda a este email.</p>
      <p>Eugenio's Health Club - Sistema de Gerenciamento de Aulas</p>
    </div>
  </div>
</body>
</html>
      `;

      // Enviar email para cada administrador e gerente
      for (const user of adminAndManagerUsers) {
        if (user.email) {
          await this.sendEmail(user.email, emailContent, emailSubject);
          this.logger.log(
            `Email de notificação de status enviado para ${user.email}`,
          );
        }
      }

      this.logger.log(
        `Notificação de alteração de status enviada para ${adminAndManagerUsers.length} administradores e gerentes`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação de status para admins e gerentes: ${error.message}`,
        error.stack,
      );
      // Não lançar exceção para não interromper o fluxo principal
    }
  }

  /**
   * Processa e envia mensagem de contacto
   * @param sendContactDto Dados da mensagem de contacto
   */
  async sendContactMessage(sendContactDto: SendContactDto): Promise<void> {
    try {
      const emailConfig = this.configService.get('email');

      const recipientEmail =
        emailConfig.recipientEmail || 'afonsovelosof@gmail.com';

      const subject = `Nova mensagem de contacto: ${sendContactDto.subject}`;

      // Preparar conteúdo do email
      const emailContent = this.prepareContactEmailContent(sendContactDto);

      // Enviar email
      await this.sendContactEmail(recipientEmail, emailContent, subject);

      this.logger.log(
        `Mensagem de contacto enviada com sucesso para ${recipientEmail} - ${sendContactDto.name}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar mensagem de contacto: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Prepara o conteúdo HTML do email para mensagem de contacto
   * @param sendContactDto Dados da mensagem de contacto
   * @returns Conteúdo HTML formatado
   */
  private prepareContactEmailContent(sendContactDto: SendContactDto): string {
    return `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Mensagem de Contacto</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #293c59 0%, #4a5f7a 100%);
            color: white;
            padding: 25px;
            border-radius: 10px 10px 0 0;
            margin: -30px -30px 30px -30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .info-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #293c59;
        }
        .info-item {
            margin: 10px 0;
            font-size: 16px;
        }
        .info-label {
            font-weight: 600;
            color: #293c59;
            display: inline-block;
            width: 80px;
        }
        .message-section {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            margin: 20px 0;
        }
        .message-title {
            color: #293c59;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 15px 0;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 8px;
        }
        .message-content {
            line-height: 1.8;
            white-space: pre-wrap;
            font-size: 15px;
            color: #444;
        }
        .footer {
            margin-top: 30px;
            padding: 20px;
            background-color: #e8f4f8;
            border-radius: 8px;
            text-align: center;
        }
        .footer p {
            margin: 0;
            font-size: 14px;
            color: #666;
        }
        .reply-section {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .reply-link {
            display: inline-block;
            background-color: #293c59;
            color: white !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 10px;
            transition: background-color 0.3s;
        }
        .reply-link:hover {
            background-color: #1e2a3f;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Nova Mensagem de Contacto</h1>
        </div>
        
        <div class="info-section">
            <div class="info-item">
                <span class="info-label">Nome:</span>
                <strong>${sendContactDto.name}</strong>
            </div>
            <div class="info-item">
                <span class="info-label">Email:</span>
                <strong>${sendContactDto.email}</strong>
            </div>
            <div class="info-item">
                <span class="info-label">Assunto:</span>
                <strong>${sendContactDto.subject}</strong>
            </div>
        </div>
        
        <div class="message-section">
            <h3 class="message-title">Mensagem:</h3>
            <div class="message-content">${sendContactDto.message}</div>
        </div>
        
        <div class="reply-section">
            <p><strong>Responder ao cliente:</strong></p>
            <a href="mailto:${sendContactDto.email}?subject=Re: ${sendContactDto.subject}" class="reply-link">
                Responder por Email
            </a>
        </div>
        
        <div class="footer">
            <p>Esta mensagem foi enviada através do formulário de contacto do site <strong>Eugénios Health Club</strong>.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Envia email de contacto público
   * @param recipientEmail Email do destinatário
   * @param content Conteúdo HTML do email
   * @param subject Assunto do email
   */
  async sendContactEmail(
    recipientEmail: string,
    content: string,
    subject: string,
  ): Promise<void> {
    try {
      await this.sendEmail(recipientEmail, content, subject);
      this.logger.log(`Email de contacto enviado para ${recipientEmail}`);
    } catch (error) {
      this.logger.error(
        `Erro ao enviar email de contacto: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
