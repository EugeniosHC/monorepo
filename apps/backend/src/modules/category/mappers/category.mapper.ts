import { Product, CategorySection, Category } from 'src/types'; // Ajusta o path conforme tua estrutura
import {
  Category as PrismaCategory,
  Product as PrismaProduct,
  CategorySection as PrismaSection,
} from '@prisma/client';

export function mapProductFromPrisma(product: PrismaProduct): Product {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    description: product.description,
    imageUrl: product.imageUrl,
    duration: product.duration ?? undefined,
  };
}

export function mapSectionFromPrisma(section: PrismaSection): CategorySection {
  return {
    id: section.id,
    title: section.title,
    content: section.content,
  };
}

export function mapCategoryFromPrisma(
  category: PrismaCategory & {
    products: PrismaProduct[];
    sections: PrismaSection[];
  },
): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    title: category.title,
    subtitle: category.subtitle,
    description: category.description,
    helpDescription: category.helpDescription,
    imageUrl: category.imageUrl,
    products: category.products.map(mapProductFromPrisma),
    sections: category.sections.map(mapSectionFromPrisma),
  };
}
