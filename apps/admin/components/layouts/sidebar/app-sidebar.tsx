"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  CameraIcon,
  Command,
  Dumbbell,
  FolderIcon,
  Frame,
  LayoutTemplate,
  LifeBuoy,
  Map,
  MapIcon,
  Package,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/layouts/sidebar/nav-main";
import { NavSecondary } from "@/components/layouts/sidebar/nav-secondary";
import { NavUser } from "@/components/layouts/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@eugenios/ui/components/sidebar";
import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Secções",
      url: "/dashboard/sections",
      icon: LayoutTemplate,
      isActive: true,
      items: [
        {
          title: "Web",
          url: "/dashboard/sections/web",
          items: [
            {
              title: "Overview",
              url: "/dashboard/sections/web",
            },
            {
              title: "Hero",
              url: "/dashboard/sections/web/hero",
            },
            {
              title: "Highlights",
              url: "/dashboard/sections/web/highlights",
            },
            {
              title: "Features",
              url: "/dashboard/sections/web/features",
            },
            {
              title: "Testimonials",
              url: "/dashboard/sections/web/testimonials",
            },
          ],
        },
        {
          title: "Shop",
          url: "/dashboard/sections/shop",
          items: [
            {
              title: "Overview",
              url: "/dashboard/sections/shop",
            },
            {
              title: "Hero",
              url: "/dashboard/sections/shop/hero",
            },
            {
              title: "Highlights",
              url: "/dashboard/sections/shop/highlights",
            },
            {
              title: "Features",
              url: "/dashboard/sections/shop/features",
            },
            {
              title: "Testimonials",
              url: "/dashboard/sections/shop/testimonials",
            },
          ],
        },
      ],
    },
    {
      title: "Mapa de Aulas",
      url: "/dashboard/classes",
      icon: MapIcon,
    },
    {
      title: "Categorias",
      url: "/dashboard/categories",
      icon: FolderIcon,
    },
    {
      title: "Produtos",
      url: "/dashboard/products",
      icon: Package,
    },
    {
      title: "Galeria",
      url: "/dashboard/gallery",
      icon: CameraIcon,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Dumbbell className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Eugénios</span>
                  <span className="truncate text-xs">HealthClub & Spa</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
