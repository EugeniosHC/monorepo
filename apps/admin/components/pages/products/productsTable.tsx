"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@eugenios/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@eugenios/ui/components/dropdown-menu";
import { Input } from "@eugenios/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@eugenios/ui/components/table";

import { EditProductModal } from "./editProductModal";
import { Product } from "@eugenios/types";
import { useProducts } from "@eugenios/react-query/queries/useProducts";
import DeleteProductModal from "./deleteProductModal";

export function ProductTable() {
  const { data: productsData } = useProducts();
  const products = productsData || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [isDeleteProductModalOpen, setDeleteProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  // 🔍 Filtra produtos com base no termo de pesquisa
  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // 📊 Define colunas da tabela
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "imageUrl",
        header: "Imagem",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <div className="relative h-16 w-16 overflow-hidden rounded-md">
              <Image
                src={row.original.imageUrl || "/placeholder.svg"}
                alt={row.original.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      },
      {
        accessorKey: "price",
        header: "Preço",
        cell: ({ row }) => (
          <div className="font-medium">
            {new Intl.NumberFormat("pt-PT", {
              style: "currency",
              currency: "EUR",
            }).format(row.original.price)}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Descrição",
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate" title={row.original.description}>
            {row.original.description}
          </div>
        ),
      },
      {
        accessorKey: "duration",
        header: "Duração",
        cell: ({ row }) => <div>{row.original.duration || "N/A"}</div>,
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setEditingProduct(row.original);
                setEditModalOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => {
                setDeleteConfirmProduct(row.original);
                setDeleteProductModalOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Apagar</span>
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable<Product>({
    data: filteredProducts,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full">
      {/* 🔍 Barra de Pesquisa */}
      <div className="mb-4 flex items-center justify-between">
        <Input
          type="text"
          placeholder="Pesquisar por nome ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm"
        />
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-center font-semibold text-slate-700">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-slate-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Próximo
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Itens por página</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {table.getState().pagination.pageSize}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <DropdownMenuItem key={pageSize} onClick={() => table.setPageSize(pageSize)}>
                  {pageSize}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isEditModalOpen={editModalOpen}
          setIsEditModalOpen={(open) => {
            setEditModalOpen(open);
            if (!open) setEditingProduct(null);
          }}
        />
      )}

      {deleteConfirmProduct && (
        <DeleteProductModal
          product={deleteConfirmProduct}
          isDeleteProductModalOpen={isDeleteProductModalOpen}
          setDeleteProductModalOpen={setDeleteProductModalOpen}
        />
      )}
    </div>
  );
}
