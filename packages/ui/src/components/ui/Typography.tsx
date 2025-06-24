// packages/ui/components/typography.tsx

import { cn } from "@eugenios/ui/lib/utils";
import { ElementType, ReactNode, Fragment } from "react";

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
  formatText?: boolean; // New prop to enable text formatting
  strongClassName?: string; // Custom class for strong text, defaults to "font-normal"
};

const variantClasses: Record<TypographyVariant, string> = {
  hero: "text-4xl sm:text-5xl md:text-7xl font-bold",
  heroSubtitle: "text-2xl md:text-3xl",
  sectionTitle: "text-3xl sm:text-4xl md:text-5xl font-bold",
  title: "text-2xl md:text-3xl",
  footerSubtitle: "text-xl",
  footerText: "text-base  text-white/80",
  subtitle: "text-xl md:text-2xl",
  body: "text-lg", //pode ser mudado para apenas text-lg (teste)
  caption: "text-sm text-muted-foreground",
};

// Function to format text with special tokens
const formatContentWithTokens = (content: string, strongClassName: string = "font-normal") => {
  if (typeof content !== "string") return content;

  // Handle both regular \n and escaped \\n in strings
  // This makes it work with both types of line break formats
  const lines = content.includes("\\n") ? content.split("\\n") : content.split("\n");

  return lines.map((line, lineIndex) => {
    // Split by strong text markers (#text#)
    const parts = line.split(/#([^#]+)#/).filter(Boolean);

    return (
      <Fragment key={`line-${lineIndex}`}>
        {parts.map((part, partIndex) => {
          // Check if this part was wrapped in # characters in the original string
          const isStrong = content.includes(`#${part}#`);

          return isStrong ? (
            <span key={`part-${partIndex}`} className={strongClassName}>
              {part}
            </span>
          ) : (
            part
          );
        })}
        {lineIndex < lines.length - 1 && <br />}
      </Fragment>
    );
  });
};

export const Typography = ({
  as: Component = "p",
  variant = "body",
  className,
  children,
  formatText = false,
  strongClassName = "font-normal",
}: TypographyProps) => {
  // Format text if the formatText prop is true and children is a string
  const formattedContent =
    formatText && typeof children === "string" ? formatContentWithTokens(children, strongClassName) : children;

  return <Component className={cn(variantClasses[variant], className)}>{formattedContent}</Component>;
};
