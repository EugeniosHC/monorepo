import * as z from "zod";
import { SectionType } from "@eugenios/types";

export const baseSectionSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
});

export const heroSectionSchema = baseSectionSchema.extend({
  type: z.literal(SectionType.HERO),
  slides: z.array(
    z
      .object({
        title: z.string().min(2, "Title must be at least 2 characters."),
        subtitle: z.string().min(10, "Subtitle must be at least 10 characters."),
        buttonIsVisible: z.boolean().default(true),
        buttonText: z.string().optional(),
        buttonUrl: z.string().optional(),
        imageUrl: z.string().min(2, "Image url must be at least 2 characters."),
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
          if (!data.buttonUrl || !z.string().safeParse(data.buttonUrl).success) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Please enter a valid URL.",
              path: ["buttonUrl"],
            });
          }
        }
      })
  ),
});

export const marqueeSectionSchema = baseSectionSchema.extend({
  type: z.literal(SectionType.MARQUEE),
  icons: z.array(
    z.object({
      icon: z.string(),
      iconLibrary: z.string().optional().default("tabler"),
      description: z.string().min(10, "Description must be at least 10 characters."),
    })
  ),
});

export const formSchema = z.discriminatedUnion("type", [heroSectionSchema, marqueeSectionSchema]);

export type FormData = z.infer<typeof formSchema>;
