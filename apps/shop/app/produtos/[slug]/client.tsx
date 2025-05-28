"use client";

import { useCategoryDataBySlug, useRelatedCategories } from "@eugenios/react-query/queries/useCategories";
import dynamic from "next/dynamic";
import { ImageGallery } from "@/components/pages/product/ImageGallery";
import { Award, Clock, Heart, Star } from "lucide-react";
import { Badge } from "@eugenios/ui/components/badge";
import Breadcrumb from "@/components/pages/product/Breadcrumb";
import PageSection from "@eugenios/ui/src/components/ui/PageSection";
import { Typography } from "@eugenios/ui/components/ui/Typography";
import { useEffect, Suspense } from "react";

// Carregar componentes pesados dinamicamente
const ProductInfoAccordion = dynamic(() => import("@/components/pages/product/ProductInfoAccordion"), {
  loading: () => <div className="animate-pulse h-48 bg-gray-200 rounded-md"></div>,
  ssr: false,
});

const SelectionConfigurator = dynamic(() => import("@/components/pages/product/SelectionConfigurator"), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded-md"></div>,
});

const RelatedProducts = dynamic(() => import("@/components/pages/product/RelatedProducts"), {
  loading: () => <div className="animate-pulse h-48 bg-gray-200 rounded-md"></div>,
});

const ClientSupportSection = dynamic(() => import("@/components/sections/ClientSupportSection"), {
  loading: () => <div className="animate-pulse h-32 bg-gray-200 rounded-md"></div>,
});

const Reviews = dynamic(() => import("@/components/pages/product/Reviews"), {
  loading: () => <div className="animate-pulse h-48 bg-gray-200 rounded-md"></div>,
  ssr: false,
});

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

  // Efeito para rolar para o topo da página quando o componente montar ou quando o slug mudar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

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
      <PageSection className="pt-20 md:pt-36 mb-12" id="detalhes-do-produto">
        <Breadcrumb categoryName={categoryData.name} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Coluna da Esquerda (Imagens do Produto) */}
          <div className="max-h-full overflow-hidden">
            <ImageGallery CategoryData={categoryData} />
          </div>
          {/* Coluna da Direita (Título e Opções de Compra Interativas) */}
          <div className="md:sticky md:top-8 md:self-start h-fit">
            <Typography as="h2" variant="title" className="font-bold mb-2">
              {categoryData.title || categoryData.name}
            </Typography>
            {categoryData.subtitle && <p className="text-muted-foreground mb-2">{categoryData.subtitle}</p>}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-secondary text-secondary" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">4.9 (127 avaliações)</span>
            </div>

            <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded-md"></div>}>
              <SelectionConfigurator categoryData={categoryData} />
            </Suspense>

            <div className="mt-8">
              <p className="text-sm text-muted-foreground">{categoryData.description}</p>
            </div>
          </div>
        </div>
      </PageSection>

      <Suspense fallback={<div className="animate-pulse h-32 bg-gray-200 rounded-md"></div>}>
        <PageSection className="mt-8 mb-24" id="suporte-cliente">
          <ClientSupportSection />
        </PageSection>
      </Suspense>

      <Suspense fallback={<div className="animate-pulse h-48 bg-gray-200 rounded-md"></div>}>
        <PageSection className="mb-24" id="reviews">
          <Reviews />
        </PageSection>
      </Suspense>

      {relatedCategories && relatedCategories.length > 0 && (
        <Suspense fallback={<div className="animate-pulse h-48 bg-gray-200 rounded-md"></div>}>
          <PageSection className="mb-24 ">
            <RelatedProducts categories={relatedCategories} />
          </PageSection>
        </Suspense>
      )}

      <Suspense fallback={<div className="animate-pulse h-48 bg-gray-200 rounded-md"></div>}>
        <PageSection className="mb-24">
          <ProductInfoAccordion
            sections={categoryData.sections}
            title="INFORMAÇÕES DO PRODUTO"
            subtitle="Detalhes importantes"
          />
        </PageSection>
      </Suspense>
    </>
  );
}
