"use client";

import { MoreVerticalIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@eugenios/ui/components/avatar";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@eugenios/ui/components/sidebar";

import { UserButton, useUser } from "@clerk/nextjs";

export function NavUser() {
  const { user, isLoaded } = useUser();
  const { isMobile } = useSidebar();

  // Verificação mais robusta do estado de carregamento e user
  if (!isLoaded) {
    return null; // Ainda carregando
  }

  if (!user || !user.firstName || !user.emailAddresses?.length) {
    return null; // User não existe ou dados incompletos
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-3 py-2 min-h-[44px] rounded-md hover:bg-sidebar-accent/50 transition-colors relative">
          {/* UserButton invisível que ocupa toda a área */}
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                userButtonAvatarBox: "!hidden",
                userButtonTrigger: `
                  !absolute !inset-0 !w-full !h-full !bg-transparent !border-0 !p-0 
                  hover:!bg-transparent cursor-pointer !z-10 !outline-none
                  focus:!outline-none focus-visible:!outline-none
                  focus-visible:!ring-2 focus-visible:!ring-sidebar-ring focus-visible:!ring-offset-0
                  !rounded-md
                `,
              },
            }}
          />

          {/* Visual do componente */}
          <div className="w-8 h-8 flex-shrink-0 relative z-0">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.imageUrl} alt={user.firstName} />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium">
                {user.firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 grid text-left text-sm leading-tight overflow-hidden relative z-0">
            <span className="truncate font-medium text-sidebar-foreground">{user.firstName}</span>
            <span className="truncate text-xs text-sidebar-foreground/70">{user.emailAddresses[0]?.emailAddress}</span>
          </div>
          <MoreVerticalIcon className="flex-shrink-0 h-4 w-4 text-sidebar-foreground/50 relative z-0" />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
