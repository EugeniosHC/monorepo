import { AppSidebar } from "@/components/layouts/sidebar/app-sidebar";
import { Header } from "@/components/layouts/Header";
import { SidebarInset, SidebarProvider } from "@eugenios/ui/components/sidebar";
import type { Metadata } from "next";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { AuthTokenProvider } from "@/components/security/AuthTokenProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Eugenios HC - Admin",
  description: "O MELHOR HEALTH CLUB DE FAMALICÃO",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <Header />
          <div className="flex flex-1 flex-col">
            <div className="container flex flex-1 flex-col gap-2">
              <Toaster richColors={true} />
              <AuthTokenProvider>{children}</AuthTokenProvider>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ReactQueryProvider>
  );
}
