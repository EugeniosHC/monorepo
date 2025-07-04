import { Metadata, Viewport } from "next";
import Link from "next/link";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Página não encontrada | Eugenios HC",
  description: "A página que você está procurando não foi encontrada.",
};

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Página não encontrada</h2>
        <p className="text-gray-600 mb-8">A página que você está procurando não existe ou foi movida.</p>
        <Link href="/" className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
          Voltar para Home
        </Link>
      </div>
    </div>
  );
}
