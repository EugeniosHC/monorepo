import { loadTablerIcons } from "./tabler";
import { loadLucideIcons } from "./lucide";
import type { IconMetadata, IconLibrary } from "./types";

export class IconManager {
  private tablerIcons: IconMetadata[] = [];
  private lucideIcons: IconMetadata[] = [];
  private initialized = false;

  public async initialize() {
    if (this.initialized) return;

    try {
      this.tablerIcons = loadTablerIcons();

      this.lucideIcons = loadLucideIcons();

      this.initialized = true;
    } catch (error) {
      console.error("Error during IconManager initialization:", error);
    }
  }

  public getIcons(library: IconLibrary, searchTerm = ""): IconMetadata[] {
    const icons = library === "tabler" ? this.tablerIcons : this.lucideIcons;

    if (!icons || icons.length === 0) {
      console.warn(`No icons found for library: ${library}`);
      return [];
    }

    if (!searchTerm) return icons;

    return icons.filter((icon) => icon.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  public getIconComponent(
    name: string,
    library: IconLibrary
  ): React.ComponentType<React.SVGProps<SVGSVGElement>> | null {
    const icons = library === "tabler" ? this.tablerIcons : this.lucideIcons;

    if (!icons || icons.length === 0) {
      console.warn(`No icons found for library: ${library}`);
      return null;
    }

    const icon = icons.find((i) => i.name === name);

    if (!icon) {
      console.warn(`Icon not found: ${name} (${library})`);
      return null;
    }

    return icon.component;
  }
}

export const iconManager = new IconManager();
export type { IconLibrary, IconMetadata };
