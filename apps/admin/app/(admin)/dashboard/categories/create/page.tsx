// app/admin/categories/create/page.tsx
import { Metadata } from "next";
import CreateCategoryClient from "./client";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

export const metadata: Metadata = {
  title: "Criar Nova Categoria - Painel Administrativo",
  description: "Crie uma nova categoria para a loja",
};

export default function CreateCategoryPage() {
  return (
    <ReactQueryProvider>
      <CreateCategoryClient />
    </ReactQueryProvider>
  );
}
