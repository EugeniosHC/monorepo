"use client";

import { ReactNode } from "react";
import { HydrationBoundary, HydrationBoundaryProps } from "@tanstack/react-query";

type HydrationProviderProps = {
  children: ReactNode;
  state: HydrationBoundaryProps["state"];
};

/**
 * HydrationProvider provides Hydration Boundary for React Query
 * to support server-side rendering of queries
 */
export default function HydrationProvider({ children, state }: HydrationProviderProps) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
