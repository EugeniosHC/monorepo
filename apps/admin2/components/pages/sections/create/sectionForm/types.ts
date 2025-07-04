import * as z from "zod";
import { SectionType } from "@eugenios/types";

// Schemas
export const slideSchema = z
  .object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    subtitle: z.string().min(10, "Subtitle must be at least 10 characters."),
    buttonIsVisible: z.boolean().default(true),
    buttonText: z.string().optional(),
    buttonUrl: z.string().optional(),
    imageUrl: z.string().url("Please enter a valid image URL."),
    imageAlt: z.string().min(2, "Image alt text must be at least 2 characters."),
  })
  .superRefine((data, ctx) => {
    // Only validate button fields if button is visible
    if (data.buttonIsVisible) {
      if (!data.buttonText || data.buttonText.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Button text must be at least 2 characters.",
          path: ["buttonText"],
        });
      }
      if (!data.buttonUrl || !z.string().url().safeParse(data.buttonUrl).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid URL.",
          path: ["buttonUrl"],
        });
      }
    }
  });

export const highlightSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  icon: z.string().optional(),
});

// Schema combinado - um único schema para todo o formulário
export const completeFormSchema = z
  .object({
    // Section data
    title: z.string().min(2, "Title must be at least 2 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    type: z.nativeEnum(SectionType),

    // Hero data (opcional)
    slides: z.array(slideSchema).optional(),

    // Features data (opcional)
    highlights: z.array(highlightSchema).optional(),
  })
  .superRefine((data, ctx) => {
    // Only validate slides if this is a HERO section
    if (data.type === SectionType.HERO) {
      if (!data.slides || data.slides.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one slide is required for Hero sections",
          path: ["slides"],
        });
      }
      // Validate slides array if it exists and has items
      if (data.slides && data.slides.length > 0) {
        data.slides.forEach((slide, index) => {
          const slideValidation = slideSchema.safeParse(slide);
          if (!slideValidation.success) {
            slideValidation.error.errors.forEach((error) => {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: error.message,
                path: ["slides", index, ...error.path],
              });
            });
          }
        });
      }
    }

    // Only validate highlights if this is a MARQUEE section
    if (data.type === SectionType.MARQUEE) {
      if (!data.highlights || data.highlights.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one highlight is required for Marquee sections",
          path: ["highlights"],
        });
      }
      // Validate highlights array if it exists and has items
      if (data.highlights && data.highlights.length > 0) {
        data.highlights.forEach((highlight, index) => {
          const highlightValidation = highlightSchema.safeParse(highlight);
          if (!highlightValidation.success) {
            highlightValidation.error.errors.forEach((error) => {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: error.message,
                path: ["highlights", index, ...error.path],
              });
            });
          }
        });
      }
    }
  });

export type CompleteFormData = z.infer<typeof completeFormSchema>;

// Default values
export function defaultSlide() {
  return {
    title: "",
    subtitle: "",
    buttonIsVisible: true,
    buttonText: "",
    buttonUrl: "",
    imageUrl: "",
    imageAlt: "",
  };
}

export function defaultHighlight() {
  return {
    title: "",
    description: "",
    icon: "",
  };
}
