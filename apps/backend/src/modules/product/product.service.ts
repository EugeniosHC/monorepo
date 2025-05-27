import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product } from 'src/types';
import { CreateProductDto } from './dto/create-product';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllProducts(): Promise<any[] | null> {
    return this.prismaService.product.findMany();
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    return this.prismaService.product.create({ data: createProductDto });
  }

  async updateProduct(id: string, product: Product): Promise<Product> {
    return this.prismaService.product.update({
      where: { id },
      data: product,
    });
  }

  async deleteProduct(id: string): Promise<Product> {
    try {
      // Check if the product exists
      const existingProduct = await this.prismaService.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new Error('Product not found');
      }

      // Delete the product and return the deleted product
      return await this.prismaService.product.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  async findProductsByImageKeys(
    imageKeys: string[],
  ): Promise<Record<string, boolean>> {
    // Create a map of keys to usage status
    const usageMap: Record<string, boolean> = {};

    // Initialize all keys as not in use
    imageKeys.forEach((key) => {
      usageMap[key] = false;
    });

    // Find products with these image URLs
    const products = await this.prismaService.product.findMany({
      select: { imageUrl: true },
    });

    // Find categories with these image URLs
    const categories = await this.prismaService.category.findMany({
      select: { imageUrl: true },
    });

    // Combine all entities that might use images
    const allEntities = [...products, ...categories];

    // Mark keys that are in use by extracting the key from the URL
    allEntities.forEach((entity) => {
      if (entity.imageUrl) {
        imageKeys.forEach((key) => {
          // Extract the filename part which contains the key
          const urlParts = entity.imageUrl.split('/');
          const filename = urlParts[urlParts.length - 1];

          if (filename.includes(key)) {
            usageMap[key] = true;
          }
        });
      }
    });

    return usageMap;
  }
}
