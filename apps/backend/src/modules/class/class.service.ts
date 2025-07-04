import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OVGService } from '../ovg/ovg.service';
import { CreateExpressClassesDTO } from './dto/create-express-class.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpressScheduleDto } from './dto/create-express-scheule.dto';
import { ClerkUser } from '../auth';

@Injectable()
export class ClassService {
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

    const mondayOfWeek = this.getMondayOfWeek(inputDate);

    const cacheKey = mondayOfWeek;
    const cachedData = this.getFromCache(cacheKey);

    if (cachedData) {
      return cachedData;
    }

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

    const groupedClasses = this.groupClassesByWeekday(classesData);

    this.setCache(cacheKey, groupedClasses);

    return groupedClasses;
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
      console.log('Classes data is not an array. Type:', typeof classes);
      throw new BadRequestException(
        'Dados de aulas inválidos. Esperado um array de aulas.',
      );
    }

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
            .toString();
        }

        // Calcular duração em minutos
        const startTime = new Date(classItem.start);
        const endTime = new Date(classItem.end);
        const durationMinutes = Math.round(
          (endTime.getTime() - startTime.getTime()) / (1000 * 60),
        );

        // Mapear intensidade de texto para número
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

        const intensidadeText = (
          classItem.intensidade || 'moderada'
        ).toLowerCase();
        const intensidadeValue = intensidadeMap[intensidadeText] || 2;

        // Determinar categoria baseada no estúdio/sala e no título da aula
        let categoria = 'Terra'; // padrão
        const estudioLower = (classItem.estudio || '').toLowerCase();
        const titleLower = (classItem.title || '').toLowerCase();

        if (
          estudioLower.includes('piscina') ||
          titleLower.includes('natação') ||
          titleLower.includes('hidro') ||
          titleLower.includes('aqua')
        ) {
          categoria = 'Água';
        } else if (
          titleLower.includes('cycling') ||
          titleLower.includes('spinning') ||
          titleLower.includes('crossfit') ||
          titleLower.includes('boxing') ||
          titleLower.includes('hiit') ||
          titleLower.includes('circuit') ||
          estudioLower.includes('spinning') ||
          estudioLower.includes('crossfit')
        ) {
          categoria = 'Express';
        }

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
      return null;
    }

    return this.weeklyClassesCache.get(key) || null;
  }

  private setCache(key: string, data: any): void {
    this.weeklyClassesCache.set(key, data);
    this.cacheExpiration.set(key, Date.now() + this.CACHE_DURATION_MS);
  }
}
