export enum SectionType {
  HERO = 'HERO',
  ABOUTUS = 'ABOUTUS',
  SERVICES = 'SERVICES',
  BANNER = 'BANNER',
  FEEDBACK = 'FEEDBACK',
  CONTACT = 'CONTACT',
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  type: SectionType;
  data: JSON;
  isActive: boolean;
  websiteId: string;
}

export interface CategorySection {
  id: string;
  title: string;
  content: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  duration?: string; // Duração do serviço, se aplicável
}

export interface SearchProduct extends Product {
  slug: string;
  category: string; // Categoria do produto, se aplicável
}

export interface SearchData {
  found: boolean;
  products?: SearchProduct[]; // Lista de produtos encontrados
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  helpDescription: string; // Descrição de ajuda para a categoria
  imageUrl: string;
  sections?: CategorySection[]; // Seções associadas a esta categoria
  products?: Product[]; // Produtos associados a esta categoria
}

export interface CategoryWithMinPrice extends Category {
  minPrice?: number;
}

export interface EditCategory {
  name: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  helpDescription: string; // Descrição de ajuda para a categoria
  imageUrl: string;
}

export interface CreateCategory {
  name: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  helpDescription: string;
  imageUrl: string;
}
export interface Image {
  key: string;
  url: string;
  size: string;
  LastModified: string;
}
export interface ImageGallery {
  images: Image[];
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}

// Tipos de itens arrastáveis
export const ItemTypes = {
  PRODUCT: 'product',
  SECTION: 'section',
};

// Define tipos para o DnD
export interface DragItem {
  id: string;
  type: string;
}
