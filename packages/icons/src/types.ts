export type IconLibrary = "tabler" | "lucide";

export interface IconMetadata {
  name: string;
  library: IconLibrary;
  component: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface IconPickerOptions {
  searchTerm?: string;
  libraries?: IconLibrary[];
}
