import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Breadcrumb({ categoryName }: { categoryName: string }) {
  return (
    <div className="flex items-center text-md font-normal mb-6">
      <Link href="/" className="hover:text-primary">
        EugéniosHC
      </Link>
      <ChevronRight className="h-4 w-4 mx-1" />
      <Link href="/produtos" className="hover:text-primary">
        Produtos
      </Link>
      <ChevronRight className="h-4 w-4 mx-1" />
      <span className="text-primary font-medium">{categoryName}</span>
    </div>
  );
}
