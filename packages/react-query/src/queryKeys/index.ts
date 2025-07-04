// providers/queryKeys/products.ts

export const QueryKeys = {
  // Chaves existentes:
  getCategories: () => ["categories"] as const,
  getCategoryDataBySlug: (slug: string) => ["categories", slug] as const,
  getProductsBySearch: (query: string) => ["products", "search", query] as const,
  getRelatedCategories: (slug: string) => ["categories", slug, "related"] as const,
  // getBySlug: (slug: string) => ["products", 'products', slug] as const, // Se existir

  getSectionsByWebsite: (websiteName: string) => ["sections", websiteName] as const,
  getSectionByWebsiteAndType: (websiteId: string, type: string) => ["sections", websiteId, type] as const,
  getActiveSections: () => ["sections", "active"] as const,

  // Novas chaves para buscar 'all'
  getAllProducts: () => ["products", "all"] as const,
  getAllCategorySections: () => ["category", "sections", "all"] as const,

  getImages: () => ["images"] as const,

  getUser: () => ["user"] as const,

  getClass: (date?: string) => (date ? (["class", date] as const) : (["class"] as const)),
};
