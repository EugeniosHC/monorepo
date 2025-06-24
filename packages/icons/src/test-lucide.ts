// test-lucide.ts
import { loadLucideIcons } from "./lucide";

console.log("Testing Lucide icons loader...");
const icons = loadLucideIcons();
console.log(`Loaded ${icons.length} Lucide icons`);

if (icons.length > 0) {
  // Log the first few icons
  console.log("First few icons:");
  icons.slice(0, 5).forEach((icon, i) => {
    console.log(`${i + 1}. ${icon.name} (${typeof icon.component})`);
  });
} else {
  console.log("No icons loaded!");
}
