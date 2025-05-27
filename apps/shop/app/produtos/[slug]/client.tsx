"use client";

import { useCategoryDataBySlug, useRelatedCategories } from "@eugenios/react-query/queries/useCategories";
import ProductInfoAccordion from "@/components/pages/product/ProductInfoAccordion";
import SelectionConfigurator from "@/components/pages/product/SelectionConfigurator";
import RelatedProducts from "@/components/pages/product/RelatedProducts";
import { ImageGallery } from "@/components/pages/product/ImageGallery";
import { Award, Clock, Heart, Star } from "lucide-react";
import { Badge } from "@eugenios/ui/components/badge";
import ClientSupportSection from "@/components/sections/ClientSupportSection";
import Breadcrumb from "@/components/pages/product/Breadcrumb";
import Reviews from "@/components/pages/product/Reviews";
import PageSection from "@eugenios/ui/src/components/ui/PageSection";

export async function generateMetadata(name: string) {
  return {
    title: `EugéniosHC - ${name}`,
    description: `Detalhes do produto ${name}`,
    openGraph: {
      title: `EugéniosHC - ${name}`,
      description: `Veja detalhes da categoria ${name}`,
    },
  };
}

export function CategoryDataClient({ slug }: { slug: string }) {
  const { data: categoryData, isLoading, isError, error } = useCategoryDataBySlug(slug);
  const { data: relatedCategories } = useRelatedCategories(slug);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 md:py-36 text-center">Carregando detalhes do produto...</div>;
  }

  if (isError || !categoryData) {
    if (isError) {
      console.error("Erro ao carregar detalhes do produto:", error);
    } else if (!categoryData) {
      console.warn("Dados não encontrados para o slug:", slug);
    }
    return (
      <div className="container mx-auto px-4 py-8 md:py-36 text-center text-red-500">
        Dados não encontrados ou ocorreu um erro ao carregar.
      </div>
    );
  }

  generateMetadata(categoryData.name);

  let imagesToDisplay: string[] = [];
  let productsTitles: string[] = [];

  imagesToDisplay.push(categoryData.imageUrl);
  productsTitles.push(categoryData.name);

  categoryData.products?.forEach((product) => {
    if (product.imageUrl) {
      imagesToDisplay.push(product.imageUrl);
    }
    productsTitles.push(product.name);
  });

  imagesToDisplay = Array.from(new Set(imagesToDisplay));
  productsTitles = Array.from(new Set(productsTitles));

  return (
    <>
      <PageSection className="md:pt-36 mb-12" id="detalhes-do-produto">
        <Breadcrumb categoryName={categoryData.name} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Coluna da Esquerda (Imagens do Produto) */}
          <div>
            <ImageGallery CategoryData={categoryData} />
          </div>
          {/* Coluna da Direita (Título e Opções de Compra Interativas) */}
          <div className="md:sticky md:top-32 md:self-start h-fit">
            <h2 className="font-bold mb-2">{categoryData.title || categoryData.name}</h2>
            {categoryData.subtitle && <p className="text-muted-foreground mb-4">{categoryData.subtitle}</p>}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">4.9 (127 avaliações)</span>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Duração Personalizada
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Award className="h-3 w-3" /> Terapeutas Certificados
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Heart className="h-3 w-3" /> 98% Satisfação
              </Badge>
            </div>
            <SelectionConfigurator categoryData={categoryData} />

            <div className="mt-8">
              <p className="text-sm text-muted-foreground">{categoryData.description}</p>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection className="mt-8 mb-12" id="suporte-cliente">
        <ClientSupportSection />
      </PageSection>

      <PageSection className="mt-16 mb-12" id="reviews">
        <Reviews />
      </PageSection>

      {relatedCategories && relatedCategories.length > 0 && (
        <PageSection className="mb-24 ">
          <RelatedProducts categories={relatedCategories} />
        </PageSection>
      )}
      <PageSection className="mb-24">
        <ProductInfoAccordion
          sections={categoryData.sections}
          title="INFORMAÇÕES DO PRODUTO"
          subtitle="Detalhes importantes"
        />
      </PageSection>
    </>
  );
}
