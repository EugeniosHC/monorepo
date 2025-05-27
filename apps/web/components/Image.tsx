// apps/web/components/Image.tsx
"use client";
import NextImage from "next/image";

export const Image = (props: React.ComponentProps<typeof NextImage>) => {
  return <NextImage {...props} />;
};
