"use client";

import { ReactNode } from "react";
import { HydrationBoundary, HydrationBoundaryProps } from "@tanstack/react-query";
import ReactQueryProvider from "./ReactQueryProvider";

type HydrationProviderProps = {
  children: ReactNode;
  state: HydrationBoundaryProps["state"];
};

export default function HydrationProvider({ children, state }: HydrationProviderProps) {
  return (
    <ReactQueryProvider>
      <HydrationBoundary state={state}>{children}</HydrationBoundary>
    </ReactQueryProvider>
  );
}
