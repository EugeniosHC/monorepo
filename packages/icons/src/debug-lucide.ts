import * as LucideIcons from "lucide-react";

console.log("Lucide module type:", typeof LucideIcons);
console.log("Lucide keys count:", Object.keys(LucideIcons).length);
console.log("Sample keys:", Object.keys(LucideIcons).slice(0, 20));

// Check for a known icon
if ("Activity" in LucideIcons) {
  console.log("Activity icon found:", typeof (LucideIcons as any).Activity);
} else {
  console.log("Activity icon not found");
}

// Check what properties the module has
const props = [];
for (const key in LucideIcons) {
  props.push({
    name: key,
    type: typeof (LucideIcons as any)[key],
  });
}

console.log("Module properties:", props.slice(0, 20));

// If default export exists, check its structure
if ("default" in LucideIcons) {
  console.log("Default export type:", typeof (LucideIcons as any).default);
  if (typeof (LucideIcons as any).default === "object") {
    console.log("Default export keys:", Object.keys((LucideIcons as any).default).slice(0, 20));
  }
}
