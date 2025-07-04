import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Category, CategoryWithMinPrice } from 'src/types';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '../auth';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories(): Promise<Category[] | null> {
    return this.categoryService.getAllCategories();
  }

  @Get(':slug')
  async getCategoryBySlug(
    @Param('slug') slug: string,
  ): Promise<Category | null> {
    return this.categoryService.getCategoryBySlug(slug);
  }

  @Get('related/:slug')
  async getRelatedCategories(
    @Param('slug') slug: string,
  ): Promise<CategoryWithMinPrice[] | null> {
    return this.categoryService.getRelatedCategories(slug);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @UseGuards(AuthGuard)
  @Put('/:slug')
  async updateCategory(
    @Param('slug') slug: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.updateCategory(slug, updateCategoryDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deleteCategory(@Param('id') id: string): Promise<void> {
    return this.categoryService.deleteCategory(id);
  }

  @UseGuards(AuthGuard)
  @Post('add-product')
  async addProductToCategory(
    @Body() addProductToCategoryDto: { categoryId: string; productId: string },
  ): Promise<Category> {
    return this.categoryService.addProductToCategory(
      addProductToCategoryDto.categoryId,
      addProductToCategoryDto.productId,
    );
  }

  @UseGuards(AuthGuard)
  @Post('remove-product')
  async removeProductFromCategory(
    @Body()
    removeProductFromCategoryDto: {
      categoryId: string;
      productId: string;
    },
  ): Promise<Category> {
    return this.categoryService.removeProductFromCategory(
      removeProductFromCategoryDto.categoryId,
      removeProductFromCategoryDto.productId,
    );
  }

  @UseGuards(AuthGuard)
  @Post('add-section')
  async addSectionToCategory(
    @Body() addSectionToCategoryDto: { categoryId: string; sectionId: string },
  ): Promise<Category> {
    return this.categoryService.addSectionToCategory(
      addSectionToCategoryDto.categoryId,
      addSectionToCategoryDto.sectionId,
    );
  }
  @UseGuards(AuthGuard)
  @Post('remove-section')
  async removeSectionFromCategory(
    @Body()
    removeSectionFromCategoryDto: {
      categoryId: string;
      sectionId: string;
    },
  ): Promise<Category> {
    return this.categoryService.removeSectionFromCategory(
      removeSectionFromCategoryDto.categoryId,
      removeSectionFromCategoryDto.sectionId,
    );
  }
}
