import { icons } from "lucide-react";
import { IconMetadata } from "./types";

export const loadLucideIcons = (): IconMetadata[] => {
  console.log("Loading Lucide icons dynamically");

  try {
    // Convert the lucide-react icons object to our IconMetadata format
    const iconMetadataList = Object.entries(icons).map(([name, component]) => ({
      name,
      library: "lucide" as const,
      component,
    }));

    console.log(`Successfully loaded ${iconMetadataList.length} Lucide icons dynamically`);
    return iconMetadataList;
  } catch (error) {
    console.error("Error loading Lucide icons:", error);
    return [];
  }
};
