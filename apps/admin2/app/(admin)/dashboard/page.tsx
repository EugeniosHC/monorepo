import type React from "react";
import Link from "next/link";
import { CameraIcon, FolderIcon, Layers, LayoutTemplate, Package, ShoppingCart, Tag, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@eugenios/ui/components/card";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function DashboardCard({ title, description, icon, href }: DashboardCardProps) {
  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <Link href={href} className="block h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <div className="h-10 w-10 rounded-full bg-primary/10 p-2 text-primary">{icon}</div>
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Link>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="space-y-6">
        <div>
          <h2 className="font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Bem-vindo ao seu painel administrativo. Selecione uma opção abaixo para começar.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="Secções"
            description="Gerencie as secções do seu site"
            icon={<LayoutTemplate className="h-6 w-6" />}
            href="/dashboard/sections"
          />
          <DashboardCard
            title="Categorias"
            description="Organize seus produtos em categorias"
            icon={<FolderIcon className="h-6 w-6" />}
            href="/dashboard/categories"
          />
          <DashboardCard
            title="Produtos"
            description="Adicione e edite seus produtos"
            icon={<Package className="h-6 w-6" />}
            href="/dashboard/products"
          />
          <DashboardCard
            title="Galeria"
            description="Visualize e gerencie sua galeria"
            icon={<CameraIcon className="h-6 w-6" />}
            href="/dashboard/gallery"
          />
        </div>
      </div>
    </div>
  );
}
