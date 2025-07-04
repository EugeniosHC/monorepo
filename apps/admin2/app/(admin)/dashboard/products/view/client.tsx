"use client";

// @ts-ignore
import { useRouter } from "next/navigation";
import { Button } from "@eugenios/ui/components/button";
import { ProductTable } from "@/components/pages/products/productsTable";
import { useState } from "react";
import { CreateProductModal } from "@/components/pages/products/createProductModal";

export default function ProductboardClient() {
  const router = useRouter();
  const [isCreateProductModalOpen, setCreateProductModalOpen] = useState(false);
  return (
    <main className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className=" text-3xl font-bold">Gerenciamento de Produtos</h1>
        <Button onClick={() => setCreateProductModalOpen(true)}>Adicionar Produto</Button>
      </div>
      <ProductTable />
      <CreateProductModal
        isCreateModalOpen={isCreateProductModalOpen}
        setIsCreateModalOpen={setCreateProductModalOpen}
      />
    </main>
  );
}
