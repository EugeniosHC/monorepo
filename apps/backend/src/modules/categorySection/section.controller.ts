import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CategorySection } from 'src/types';
import { CategorySectionService } from './section.service';
import { CreateCategorySectionDto } from './dto/create-category.dto';
import { AuthGuard } from '../auth';

@Controller('categorySection')
export class CategorySectionController {
  constructor(private readonly sectionService: CategorySectionService) {}

  @Get()
  async getAllSections(): Promise<CategorySection[] | null> {
    return this.sectionService.getAllSections();
  }

  @UseGuards(AuthGuard)
  @Post()
  async createSection(
    @Body() createCategorySectionDto: CreateCategorySectionDto,
  ): Promise<CategorySection | null> {
    return this.sectionService.createCategorySection(createCategorySectionDto);
  }
}
