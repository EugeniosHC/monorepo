// app/admin/page.tsx
import ImageGalleryDashboardClient from "./client";
import { dehydrate } from "@tanstack/react-query";
import HydrationProvider from "@/providers/HydrationProvider";
import { createCachedQueryClient } from "@eugenios/react-query/src/server/getQueryClient";
import { cache } from "react";
import { prefetchGalleryImages } from "@eugenios/react-query/server/protectedQueries";
import { cookies } from "next/headers";
import { prefetchProtectedData } from "@eugenios/react-query/src/server/prefetchUtils";
import { QueryKeys } from "@eugenios/react-query/src/queryKeys";
import { getImages } from "@eugenios/services/src/imageService";

export const metadata = {
  title: "Dashboard Administrativo - Gerenciamento de Imagens",
  description: "Gerencie imagens na galeria",
};

export default async function ImageGalleryDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const getQueryClient = createCachedQueryClient(cache);
  const queryClient = getQueryClient();

  await prefetchProtectedData(queryClient, QueryKeys.getImages(), getImages, token);
  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <HydrationProvider state={dehydratedState}>
        <ImageGalleryDashboardClient />
      </HydrationProvider>
    </>
  );
}
