import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OVGService } from '../ovg/ovg.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClassCategory, ScheduleStatus } from '@prisma/client';

@Injectable()
export class ClassService {
  private readonly logger = new Logger(ClassService.name);
  private weeklyClassesCache = new Map<string, any>();
  private cacheExpiration = new Map<string, number>();
  private readonly CACHE_DURATION_MS = 30 * 60 * 1000;

  constructor(
    private ovgService: OVGService,
    private prisma: PrismaService,
  ) {}

  async getAllClasses(date?: string): Promise<any> {
    if (!date) return {};

    const inputDate = new Date(date);
    if (isNaN(inputDate.getTime())) {
      throw new BadRequestException('Data inválida fornecida.');
    }

    const mondayOfWeek = this.getMondayOfWeek(inputDate);
    this.logger.debug(`Buscando aulas para a semana de ${mondayOfWeek}`);

    const cacheKey = mondayOfWeek;
    const cachedData = this.getFromCache(cacheKey);

    if (cachedData) {
      this.logger.debug('Retornando dados do cache');
      return cachedData;
    }

    try {
      // Buscar aulas da OVG
      const classes = await this.ovgService.sendGetRequest(
        'InformationGroupClasses/27/' + mondayOfWeek,
      );

      let classesData = [];

      if (classes?.getGroupClassesWeeklyCalendar) {
        classesData = classes.getGroupClassesWeeklyCalendar;
      } else if (classes?.data?.getGroupClassesWeeklyCalendar) {
        classesData = classes.data.getGroupClassesWeeklyCalendar;
      } else if (classes?.data) {
        classesData = classes.data;
      } else if (Array.isArray(classes)) {
        classesData = classes;
      }

      this.logger.debug(`Encontradas ${classesData.length} aulas da OVG`);

      // Agrupar as aulas da OVG por dia da semana
      const groupedClasses = this.groupClassesByWeekday(classesData);

      // Buscar e adicionar as aulas Express do schedule ativo
      await this.addExpressClassesFromActiveSchedule(groupedClasses, inputDate);

      this.setCache(cacheKey, groupedClasses);

      return groupedClasses;
    } catch (error) {
      this.logger.error(`Erro ao buscar aulas: ${error.message}`, error.stack);
      throw new BadRequestException('Falha ao buscar aulas: ' + error.message);
    }
  }

  private getMondayOfWeek(date: Date): string {
    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajustar para segunda-feira

    const monday = new Date(date.setDate(diff));

    // Retornar no formato YYYY-MM-DD
    return monday.toISOString().split('T')[0];
  }

  private groupClassesByWeekday(classes: any[]): any {
    // Validar se classes é um array
    if (!Array.isArray(classes)) {
      this.logger.error(
        'Classes data is not an array. Type: ' + typeof classes,
      );
      throw new BadRequestException(
        'Dados de aulas inválidos. Esperado um array de aulas.',
      );
    }

    this.logger.debug(
      'Agrupando aulas da OVG por dia da semana - categorias: Terra/Água apenas',
    );

    const daysOfWeek = [
      'segunda-feira',
      'terça-feira',
      'quarta-feira',
      'quinta-feira',
      'sexta-feira',
      'sábado',
      'domingo',
    ];

    // Inicializar objeto com todos os dias da semana
    const groupedClasses = {
      aulas_da_semana: daysOfWeek.map((dia, index) => ({
        dia,
        data: '', // Será preenchido quando tivermos dados
        aulas: [],
      })),
    };

    // Agrupar as aulas por dia da semana
    classes.forEach((classItem) => {
      if (classItem.start) {
        const classDate = new Date(classItem.start);
        const dayOfWeek = classDate.getDay(); // 0 = Domingo, 1 = Segunda, etc.

        // Ajustar índice para nosso array (Segunda = 0, Domingo = 6)
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        // Se ainda não temos data para este dia, definir
        if (!groupedClasses.aulas_da_semana[dayIndex].data) {
          groupedClasses.aulas_da_semana[dayIndex].data = classDate
            .getDate()
            .toString()
            .padStart(2, '0');
        }

        // Calcular duração em minutos
        const startTime = new Date(classItem.start);
        const endTime = new Date(classItem.end);
        const durationMinutes = Math.round(
          (endTime.getTime() - startTime.getTime()) / (1000 * 60),
        );

        // Determinar categoria baseada no estúdio/sala e no título da aula
        let categoria: string = 'Terra'; // padrão para frontend
        const estudioLower = (classItem.estudio || '').toLowerCase();
        const titleLower = (classItem.title || '').toLowerCase();

        if (
          estudioLower.includes('piscina') ||
          titleLower.includes('natação') ||
          titleLower.includes('hidro') ||
          titleLower.includes('aqua')
        ) {
          categoria = 'Água';
        }
        // Removido a classificação Express aqui
        // As aulas Express virão apenas do schedule ativo

        // Mapear intensidade de texto para número
        const intensidadeText = (
          classItem.intensidade || 'moderada'
        ).toLowerCase();
        const intensidadeValue = this.mapIntensityToNumber(intensidadeText);

        // Formatar a aula no formato esperado pelo frontend
        const formattedClass = {
          nome: classItem.title || 'Aula sem nome',
          categoria: categoria,
          intensidade: intensidadeValue,
          professor: classItem.nickname || 'Professor não disponível',
          sala: classItem.estudio || 'Sala não disponível',
          hora_inicio: startTime.toTimeString().slice(0, 5), // HH:MM
          hora_fim: endTime.toTimeString().slice(0, 5), // HH:MM
          duracao: durationMinutes,
        };

        groupedClasses.aulas_da_semana[dayIndex].aulas.push(formattedClass);
      }
    });

    return groupedClasses;
  }

  private getFromCache(key: string): any | null {
    const expiration = this.cacheExpiration.get(key);

    if (!expiration || Date.now() > expiration) {
      // Cache expirado ou não existe
      this.weeklyClassesCache.delete(key);
      this.cacheExpiration.delete(key);
      this.logger.debug(`Cache expirado ou não encontrado para chave: ${key}`);
      return null;
    }

    this.logger.debug(`Usando dados em cache para chave: ${key}`);
    return this.weeklyClassesCache.get(key) || null;
  }

  private setCache(key: string, data: any): void {
    this.weeklyClassesCache.set(key, data);
    this.cacheExpiration.set(key, Date.now() + this.CACHE_DURATION_MS);
    this.logger.debug(
      `Cache atualizado para chave: ${key}, expira em ${this.CACHE_DURATION_MS / 60000} minutos`,
    );
  }

  /**
   * Busca as aulas Express do schedule ativo e adiciona aos dias da semana
   * onde a OVG retornou aulas (para evitar adicionar em feriados)
   * NOTA: Esta é a ÚNICA fonte de aulas Express. Todas as aulas da OVG são Terra ou Água.
   */
  private async addExpressClassesFromActiveSchedule(
    groupedClasses: any,
    referenceDate: Date,
  ): Promise<void> {
    try {
      this.logger.debug(
        'Buscando aulas Express do schedule ativo - ÚNICA fonte de aulas Express',
      );

      // Buscar o schedule ativo
      const activeSchedule = await this.prisma.classSchedule.findFirst({
        where: {
          status: ScheduleStatus.ATIVO,
        },
        include: {
          aulas: {
            where: {
              categoria: ClassCategory.EXPRESS, // Apenas as aulas Express
            },
          },
        },
      });

      if (!activeSchedule || !activeSchedule.aulas.length) {
        this.logger.debug(
          'Nenhum schedule ativo ou sem aulas Express encontradas',
        );
        return; // Não há schedule ativo ou não há aulas Express
      }

      this.logger.debug(
        `Encontradas ${activeSchedule.aulas.length} aulas Express no schedule ativo`,
      );

      // Mapear dias da semana
      const daysMap = {
        0: 6, // Domingo -> índice 6
        1: 0, // Segunda -> índice 0
        2: 1, // Terça -> índice 1
        3: 2, // Quarta -> índice 2
        4: 3, // Quinta -> índice 3
        5: 4, // Sexta -> índice 4
        6: 5, // Sábado -> índice 5
      };

      // Agrupar aulas Express por dia da semana
      const expressClassesByDay = {};
      for (let i = 0; i < 7; i++) {
        expressClassesByDay[i] = [];
      }

      // Organizar as aulas Express por dia da semana
      activeSchedule.aulas.forEach((item) => {
        const dayIndex = daysMap[item.diaSemana];

        // Formatar a aula no formato esperado pelo frontend
        const formattedClass = {
          nome: item.nome || 'Aula Express',
          categoria: 'Express',
          intensidade: this.mapIntensityToNumber(item.intensidade) || 3,
          professor: item.professor || 'Professor não disponível',
          sala: item.sala || 'Sala não disponível',
          hora_inicio: this.formatTime(item.horaInicio),
          hora_fim: this.calculateEndTime(item.horaInicio, item.duracao),
          duracao: item.duracao || 45,
          isExpressClass: true, // Marcador para identificar aulas Express do schedule
        };

        expressClassesByDay[dayIndex].push(formattedClass);
      });

      // Adicionar as aulas Express apenas aos dias em que a OVG retornou aulas
      groupedClasses.aulas_da_semana.forEach((daySchedule, index) => {
        // Só adicionar aulas Express se houver aulas da OVG neste dia
        // (para evitar adicionar em feriados ou dias sem aulas)
        if (daySchedule.aulas && daySchedule.aulas.length > 0) {
          const expressClassesForDay = expressClassesByDay[index] || [];
          this.logger.debug(
            `Adicionando ${expressClassesForDay.length} aulas Express ao dia ${daySchedule.dia}`,
          );

          // Adicionar as aulas Express ao array de aulas do dia
          daySchedule.aulas = [...daySchedule.aulas, ...expressClassesForDay];

          // Ordenar as aulas por hora de início
          daySchedule.aulas.sort((a, b) => {
            return a.hora_inicio.localeCompare(b.hora_inicio);
          });
        }
      });
    } catch (error) {
      this.logger.error(
        `Erro ao adicionar aulas Express: ${error.message}`,
        error.stack,
      );
      // Não lançar exceção para não interromper o fluxo principal
    }
  }

  /**
   * Formata o tempo de "HH:MM:SS" para "HH:MM"
   */
  private formatTime(time: string): string {
    if (!time) return '00:00';
    // Se já estiver no formato HH:MM, retorna como está
    if (/^\d{2}:\d{2}$/.test(time)) {
      return time;
    }
    // Se estiver no formato HH:MM:SS, retorna apenas HH:MM
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
      return time.substring(0, 5);
    }
    // Casos inválidos
    this.logger.warn(`Formato de hora inválido: ${time}`);
    return '00:00';
  }

  /**
   * Calcula a hora de término com base na hora de início e duração
   */
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    try {
      const [hours, minutes] = startTime.split(':').map(Number);

      // Calcular total de minutos
      let totalMinutes = hours * 60 + minutes + durationMinutes;

      // Ajustar para o formato de 24 horas
      const endHours = Math.floor(totalMinutes / 60) % 24;
      const endMinutes = totalMinutes % 60;

      // Formatar com zeros à esquerda
      return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    } catch (error) {
      this.logger.error(`Erro ao calcular hora de término: ${error.message}`);
      return '00:00';
    }
  }

  /**
   * Mapeia a intensidade em texto para um número (1-4)
   */
  private mapIntensityToNumber(intensidade: string): number {
    if (!intensidade) return 2; // valor padrão

    const intensidadeMap = {
      baixa: 1,
      suave: 1,
      leve: 1,
      moderada: 2,
      média: 2,
      'moderada/alta': 3,
      alta: 4,
      intensa: 4,
      máxima: 4,
      extrema: 4,
    };

    const intensidadeText = intensidade.toLowerCase();
    return intensidadeMap[intensidadeText] || 2; // valor padrão se não encontrado
  }
}
