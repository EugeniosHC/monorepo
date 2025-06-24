import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category, CategoryWithMinPrice } from 'src/types';
import { mapCategoryFromPrisma } from './mappers/category.mapper';
import { CreateCategoryDto } from './dto/create-category.dto';
import { min } from 'class-validator';
import { CloudflareService } from '../cloudflare/cloudflare.service';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudflareService: CloudflareService,
  ) {}
  async getAllCategories(): Promise<Category[] | null> {
    const categories = await this.prismaService.category.findMany({
      include: {
        products: true,
        sections: true,
      },
    });

    if (!categories || categories.length === 0) {
      return null;
    }

    return categories.map(mapCategoryFromPrisma);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const category = await this.prismaService.category.findUnique({
        where: { slug: slug },
        include: {
          products: true,
          sections: true,
        },
      });

      if (!category) {
        return null;
      }

      const response = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        title: category.title,
        subtitle: category.subtitle,
        description: category.description,
        helpDescription: category.helpDescription,
        imageUrl: category.imageUrl,
        products: category.products || [],
        sections: category.sections || [],
      };

      return response as Category;
    } catch (error) {
      console.error(`Erro ao buscar categoria ${slug}:`, error);
      throw new Error(`Falha ao buscar categoria ${slug}`);
    }
  }

  async getRelatedCategories(
    slug: string,
  ): Promise<CategoryWithMinPrice[] | null> {
    const categoryExists = await this.prismaService.category.findUnique({
      where: { slug: slug },
    });
    if (!categoryExists) {
      throw new BadRequestException('Category not found');
    }

    const category = await this.prismaService.category.findUnique({
      where: { slug: slug },
      include: {
        products: true,
        sections: true,
      },
    });

    if (!category) {
      return null;
    }

    const relatedCategories = await this.prismaService.category.findMany({
      where: {
        id: { not: category.id },
      },
      include: {
        products: true,
      },
    });

    if (!category) {
      return null;
    }
    // Filter categories to only include those that have products
    const categoriesWithProducts = relatedCategories.filter(
      (cat) => cat.products && cat.products.length > 0,
    );

    const response = categoriesWithProducts.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      title: cat.title,
      subtitle: cat.subtitle,
      description: cat.description,
      helpDescription: cat.helpDescription,
      imageUrl: cat.imageUrl,
      products: cat.products,
      minPrice: Math.min(...cat.products.map((p) => p.price)),
    }));
    return response as CategoryWithMinPrice[];
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const categoryAlreadyExists = await this.prismaService.category.findUnique({
      where: { slug: createCategoryDto.slug },
    });

    if (categoryAlreadyExists) {
      throw new BadRequestException('Category already exists');
    }

    return await this.prismaService.category.create({
      data: {
        name: createCategoryDto.name,
        slug: createCategoryDto.slug,
        title: createCategoryDto.title,
        subtitle: createCategoryDto.subtitle,
        description: createCategoryDto.description,
        helpDescription: createCategoryDto.helpDescription,
        imageUrl: createCategoryDto.imageUrl,
      },
    });
  }

  async updateCategory(
    slug: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    let image = null;
    const category = await this.prismaService.category.findUnique({
      where: { slug: slug },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return await this.prismaService.category.update({
      where: { slug: slug },
      data: {
        name: updateCategoryDto.name,
        slug: updateCategoryDto.slug,
        title: updateCategoryDto.title,
        subtitle: updateCategoryDto.subtitle,
        description: updateCategoryDto.description,
        helpDescription: updateCategoryDto.helpDescription,
        imageUrl: updateCategoryDto.imageUrl || category.imageUrl,
      },
    });
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.prismaService.category.findUnique({
      where: { id: id },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }
    await this.prismaService.category.update({
      where: { id: category.id },
      data: {
        products: {
          set: [],
        },
        sections: {
          set: [],
        },
      },
    });

    await this.prismaService.category.delete({
      where: { id: category.id },
    });
  }

  async addProductToCategory(
    categoryId: string,
    productId: string,
  ): Promise<Category> {
    const category = await this.prismaService.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return await this.prismaService.category.update({
      where: { id: categoryId },
      data: {
        products: {
          connect: { id: productId },
        },
      },
    });
  }

  async removeProductFromCategory(
    categoryId: string,
    productId: string,
  ): Promise<Category> {
    const category = await this.prismaService.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return await this.prismaService.category.update({
      where: { id: categoryId },
      data: {
        products: {
          disconnect: { id: productId },
        },
      },
    });
  }

  async addSectionToCategory(
    categoryId: string,
    sectionId: string,
  ): Promise<Category> {
    const category = await this.prismaService.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return await this.prismaService.category.update({
      where: { id: categoryId },
      data: {
        sections: {
          connect: { id: sectionId },
        },
      },
    });
  }

  async removeSectionFromCategory(
    categoryId: string,
    sectionId: string,
  ): Promise<Category> {
    const category = await this.prismaService.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return await this.prismaService.category.update({
      where: { id: categoryId },
      data: {
        sections: {
          disconnect: { id: sectionId },
        },
      },
    });
  }
}
