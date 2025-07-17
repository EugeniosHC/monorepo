// Tipos TypeScript específicos para este componente
export interface Slide {
  title: string;
  imageAlt: string;
  imageUrl: string;
  subtitle: string;
  buttonUrl: string;
  buttonIcon: string;
  buttonText: string;
  buttonIsVisible: boolean;
}

// Interface para uso no editor que inclui o ID necessário
export interface SlideItem extends Slide {
  id: number;
  [key: string]: unknown;
}

export interface HeroSection {
  id: string;
  title: string;
  description: string; // Made required to match the sample data
  type: string; // Mantemos como string para aceitar valores como "HERO" e "MARQUEE"
  data: Slide[];
  isActive: boolean;
  websiteId: string;
  createdAt: string; // Made required to match the sample data
  updatedAt: string; // Made required to match the sample data
}

export interface Highlight {
  icon: string;
  description: string;
  iconLibrary: string;
}

export interface SectionData {
  slides?: Slide[];
  highlights?: Highlight[];
}

// Tipo para os dados mínimos necessários para criar uma seção
export interface CreateSectionData {
  title: string;
  description: string;
  type: SectionType;
  data: any; // Dados específicos da seção (slides, highlights, etc.)
}

// Usar uma interface compatível que pode aceitar tanto BaseSection quanto nossa extensão
export interface Section {
  id: string;
  title: string;
  description: string; // Made required to match the sample data
  type: string; // Mantemos como string para aceitar valores como "HERO" e "MARQUEE"
  data: SectionData | any; // Flexível para aceitar diferentes estruturas
  isActive: boolean;
  websiteId: string;
  createdAt: string; // Made required to match the sample data
  updatedAt: string; // Made required to match the sample data
}

export enum SectionType {
  HERO = "HERO",
  MARQUEE = "MARQUEE",
  ABOUTUS = "ABOUTUS",
  SERVICES = "SERVICES",
  BANNER = "BANNER",
  FEEDBACK = "FEEDBACK",
  CONTACT = "CONTACT",
}

export interface SectionResponse {
  type: SectionType;
  section: Section | null;
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
  PRODUCT: "product",
  SECTION: "section",
};

// Define tipos para o DnD
export interface DragItem {
  id: string;
  type: string;
}

export interface HeroSlide {
  title: string;
  subtitle: string;
  buttonIsVisible: boolean;
  buttonText: string;
  buttonUrl: string;
  buttonIcon: string;
  imageUrl: string;
  imageAlt: string;
}

interface Aula {
  nome: string;
  categoria: "Terra" | "Água" | "Express";
  hora_inicio: string; // formato: "HH:MM"
  hora_fim: string; // formato: "HH:MM"
  duracao: string; // em minutos, como string: "60"
  intensidade: 0 | 1 | 2 | 3 | 4;
  professor: string;
  sala: string;
}

// Representa um dia da semana com uma lista de aulas
interface DiaDaSemana {
  dia: string; // ex: "Segunda-feira"
  data: string; // ex: "23" (pode ser string ou number)
  aulas: Aula[];
}

// Interface raiz que representa todas as aulas da semana
export interface AulasDaSemanaResponse {
  aulas_da_semana: DiaDaSemana[];
}
