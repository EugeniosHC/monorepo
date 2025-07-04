"use client";

import ElegantClassSchedule from "@/components/pages/class/Schedule";
import { useClass } from "@eugenios/react-query/src/queries/useClass";
import { useState } from "react";

// Function to get Monday of a given week
function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  d.setDate(diff);
  return d.toISOString().split("T")[0]!; // Return YYYY-MM-DD format
}

export default function ClassClient() {
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const mondayDate = getMondayOfWeek(selectedWeek);

  const { data: aulas, isLoading, isError, isFetching } = useClass(mondayDate);

  return (
    <>
      <ElegantClassSchedule
        aulas={aulas || { aulas_da_semana: [] }}
        loading={isLoading}
        error={isError}
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
      />
      <div className="w-full ">
        <div className="bg-primary"></div>
      </div>
    </>
  );
}
