/*
https://docs.nestjs.com/providers#services
*/

import { BadRequestException, Injectable } from '@nestjs/common';
import { OVGService } from '../ovg/ovg.service';

@Injectable()
export class ClassService {
  private weeklyClassesCache = new Map<string, any>();
  private cacheExpiration = new Map<string, number>();
  private readonly CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutos

  constructor(private ovgService: OVGService) {}

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
      'domingo',
      'segunda',
      'terca',
      'quarta',
      'quinta',
      'sexta',
      'sabado',
    ];

    // Inicializar objeto com todos os dias da semana
    const groupedClasses = {};
    daysOfWeek.forEach((day) => {
      groupedClasses[day] = [];
    });

    // Agrupar as aulas por dia da semana
    classes.forEach((classItem) => {
      if (classItem.start) {
        const classDate = new Date(classItem.start);
        const dayOfWeek = classDate.getDay(); // 0 = Domingo, 1 = Segunda, etc.
        const dayName = daysOfWeek[dayOfWeek];

        groupedClasses[dayName].push(classItem);
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

  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, expiration] of this.cacheExpiration.entries()) {
      if (now > expiration) {
        this.weeklyClassesCache.delete(key);
        this.cacheExpiration.delete(key);
      }
    }
  }
}
