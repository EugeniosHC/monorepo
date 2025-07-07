"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditorIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/editor/hero-section");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Redirecionando para o editor...</p>
    </div>
  );
}
