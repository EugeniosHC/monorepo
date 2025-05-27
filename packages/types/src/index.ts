export interface Section {
  id: string;
  title: string;
  content: string; // Conteúdo pode ser texto, lista simples ou lista de key/value
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
  sections?: Section[]; // Seções associadas a esta categoria
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
