import { AppSidebar } from "@/components/layouts/sidebar/app-sidebar";
import { Header } from "@/components/layouts/Header";
import { SidebarInset, SidebarProvider } from "@eugenios/ui/components/sidebar";
import type { Metadata } from "next";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Montserrat, Barlow } from "next/font/google";

export const metadata: Metadata = {
  title: "Eugenios HC - Admin",
  description: "O MELHOR HEALTH CLUB DE FAMALICÃO",
};

const barlow = Barlow({
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-barlow",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <Header />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ReactQueryProvider>
  );
}
