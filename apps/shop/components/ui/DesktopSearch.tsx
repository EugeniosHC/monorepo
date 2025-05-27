"use client";

import { SearchBar } from "./SearchBar";

interface DesktopSearchProps {
  hasHeaderBackground: boolean;
}

export function DesktopSearch({ hasHeaderBackground }: DesktopSearchProps) {
  return (
    <div className="hidden md:flex relative items-center">
      <SearchBar hasHeaderBackground={hasHeaderBackground} />
    </div>
  );
}
