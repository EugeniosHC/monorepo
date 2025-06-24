import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategorySectionDto } from './dto/create-category.dto';

@Injectable()
export class CategorySectionService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllSections(): Promise<any[] | null> {
    return this.prismaService.categorySection.findMany();
  }

  async createCategorySection(
    createCategorySectionDto: CreateCategorySectionDto,
  ): Promise<any | null> {
    const { title, content } = createCategorySectionDto;

    return this.prismaService.categorySection.create({
      data: {
        title,
        content,
      },
    });
  }
}
