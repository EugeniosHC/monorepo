"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@eugenios/react-query/queries/useCategories";
import { Typography } from "@eugenios/ui/components/ui/Typography";
import { Skeleton } from "@eugenios/ui/components/skeleton";

const WellnessGrid = () => {
  const { data: categories, isLoading, isError, error } = useCategories();

  const colSpanClasses = [
    "col-span-2 md:col-span-3",
    "col-span-2 md:col-span-2",
    "col-span-2 md:col-span-2 ",
    "col-span-2 md:col-span-3",
    "col-span-2 md:col-span-5",
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={index}
            className={`h-96 ${colSpanClasses[index % colSpanClasses.length]} bg-gray-200 animate-pulse rounded-lg`}
          ></Skeleton>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="container py-12 text-center">
        <p>Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {categories.map((category, index) => {
        const id = category.id;
        const title = category.name || "Produto sem título";
        const imageSrc = category.imageUrl || "/img/placeholder.png";
        const imageAlt = title;
        const slug = category.slug;

        const linkHref = slug ? `/produtos/${slug}` : "#";
        const colSpan = colSpanClasses[index % colSpanClasses.length];

        return (
          <Link
            key={id}
            href={linkHref}
            className={`block ${colSpan} relative overflow-hidden rounded-lg h-96 cursor-pointer group transition-all duration-300`}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 z-10"></div>

            <Image
              width={500}
              height={500}
              src={imageSrc}
              alt={imageAlt}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
              <Typography
                as="h3"
                variant="subtitle"
                className="text-white font-bold drop-shadow-lg transition-all duration-300 ease-out group-hover:-translate-y-4 group-hover:opacity-0"
              >
                {title}
              </Typography>
              <div className="absolute bottom-6 left-6 text-white text-xl font-bold opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 translate-y-4">
                Ver agora &rarr;
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default WellnessGrid;
