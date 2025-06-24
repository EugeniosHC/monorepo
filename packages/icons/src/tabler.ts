import * as TablerIcons from "@tabler/icons-react";
import { IconMetadata } from "./types";

export const loadTablerIcons = (): IconMetadata[] => {
  // Debug the module
  console.log("Tabler module type:", typeof TablerIcons);

  // Try direct import approach
  try {
    // Get the keys but exclude functions and special properties
    const iconNames = Object.keys(TablerIcons).filter(
      (name) => name !== "createReactComponent" && name !== "default" && name.includes("Icon") // Most likely Tabler uses the Icon suffix
    );

    console.log(`Found ${iconNames.length} potential Tabler icon names`);

    // Map to our format
    const icons = iconNames.map((name) => {
      // Cast to any to avoid TypeScript errors
      const IconComponent = (TablerIcons as any)[name];

      return {
        name: name.replace("Icon", ""), // Remove 'Icon' suffix
        library: "tabler" as const,
        component: IconComponent,
      };
    });

    console.log(`Successfully mapped ${icons.length} Tabler icons`);
    return icons;
  } catch (error) {
    console.error("Error loading Tabler icons:", error);
    return [];
  }
};
