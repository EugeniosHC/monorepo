// packages/ui/components/typography.tsx

import { cn } from "@eugenios/ui/lib/utils";
import { ElementType, ReactNode } from "react";

type TypographyVariant =
  | "hero"
  | "heroSubtitle"
  | "sectionTitle"
  | "title"
  | "footerSubtitle"
  | "footerText"
  | "subtitle"
  | "body"
  | "caption";

type TypographyProps = {
  as?: ElementType;
  variant?: TypographyVariant;
  className?: string;
  children: ReactNode;
};

const variantClasses: Record<TypographyVariant, string> = {
  hero: "text-4xl sm:text-5xl md:text-7xl font-bold",
  heroSubtitle: "text-2xl md:text-4xl",
  sectionTitle: "text-3xl sm:text-4xl md:text-5xl font-bold",
  title: "text-2xl md:text-3xl",
  footerSubtitle: "text-xl",
  footerText: "text-base  text-white/80",
  subtitle: "text-xl md:text-2xl",
  body: "text-lg", //pode ser mudado para apenas text-lg (teste)
  caption: "text-sm text-muted-foreground",
};

export const Typography = ({ as: Component = "p", variant = "body", className, children }: TypographyProps) => {
  return <Component className={cn(variantClasses[variant], className)}>{children}</Component>;
};
