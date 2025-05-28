"use client";

import { ReactNode } from "react";
import { HydrationBoundary, HydrationBoundaryProps } from "@tanstack/react-query";

type HydrationProviderProps = {
  children: ReactNode;
  state: HydrationBoundaryProps["state"];
};

export default function HydrationProvider({ children, state }: HydrationProviderProps) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
