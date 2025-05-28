import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SectionService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllSections(): Promise<any[] | null> {
    return this.prismaService.categorySection.findMany();
  }
}
