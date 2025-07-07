"use client";

import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { ReactNode } from "react";

export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <ReactQueryProvider>
      <div className="h-screen w-screen overflow-hidden">{children}</div>
    </ReactQueryProvider>
  );
}
