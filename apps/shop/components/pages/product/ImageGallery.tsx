import Image from "next/image";
import { Category } from "@eugenios/types";
import ImageCarousel from "./image-carousel";

interface ImageGalleryProps {
  CategoryData: Category;
}

export function ImageGallery({ CategoryData }: ImageGalleryProps) {
  return (
    <div className="pt-12 md:pt-0 space-y-4">
      {" "}
      <div className="relative rounded-lg overflow-hidden border h-[600px] bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <Image
          src={CategoryData.imageUrl}
          alt={`Imagem do produto ${CategoryData.name}`}
          fill
          quality={100}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
          }}
        />
      </div>
      <ImageCarousel
        images={
          CategoryData.products?.map((product) => ({
            src: product.imageUrl || "/placeholder.svg?height=200&width=200",
            alt: `Imagem do produto ${product.name}`,
          })) ?? []
        }
      />
    </div>
  );
}
