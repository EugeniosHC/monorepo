import { dehydrate } from "@tanstack/react-query";
import { prefetchClass } from "@eugenios/react-query/src/server/useServerClass";
import HydrationProvider from "@/providers/HydrationProvider";
import ClassClient from "./client";
import { cache } from "react";
import { createCachedQueryClient } from "@eugenios/react-query/src/server/getQueryClient";

// Function to get Monday of current week
function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  d.setDate(diff);
  return d.toISOString().split("T")[0]!; // Return YYYY-MM-DD format
}

export default async function HomePage() {
  const getQueryClient = createCachedQueryClient(cache);
  const queryClient = getQueryClient();

  const currentMondayDate = getMondayOfWeek(new Date());
  console.log("Server Monday date:", currentMondayDate);

  await prefetchClass(queryClient, currentMondayDate);
  const dehydratedState = dehydrate(queryClient);
  console.log("Dehydrated State:", JSON.stringify(dehydratedState, null, 2));

  return (
    <>
      <HydrationProvider state={dehydratedState}>
        <ClassClient />
      </HydrationProvider>
    </>
  );
}
