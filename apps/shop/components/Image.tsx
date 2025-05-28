// apps/web/components/Image.tsx
"use client";
import NextImage from "next/image";
import { useState } from "react";

export const Image = (props: React.ComponentProps<typeof NextImage>) => {
  const [isLoading, setLoading] = useState(true);

  // Desestruturar as props para adicionar ou modificar propriedades
  const { className, onLoad, ...rest } = props;

  return (
    <NextImage
      className={`${className} ${isLoading ? "blur-sm scale-105" : "blur-0 scale-100"} transition-all duration-300`}
      onLoad={(event) => {
        setLoading(false);
        if (onLoad) onLoad(event);
      }}
      {...rest}
    />
  );
};
