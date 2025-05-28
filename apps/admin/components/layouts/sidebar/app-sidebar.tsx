"use client";

import * as React from "react";
import { CameraIcon, Dumbbell, FolderIcon, LayoutDashboardIcon, ListIcon, Package } from "lucide-react";
import Link from "next/link";

import { NavMain } from "@/components/layouts/sidebar/nav-main";
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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
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
      title: "Secções",
      url: "/dashboard/sections",
      icon: ListIcon,
    },
    {
      title: "Galeria",
      url: "/dashboard/gallery",
      icon: CameraIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/dashboard">
                <Dumbbell className="h-5 w-5" />
                <span className="text-base font-bold">EugéniosHC</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
