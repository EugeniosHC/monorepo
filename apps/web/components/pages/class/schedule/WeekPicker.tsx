"use client";

import { Button } from "@eugenios/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekPickerProps {
  selectedWeek: Date;
  onNavigateWeek: (direction: "prev" | "next") => void;
}

export function WeekPicker({ selectedWeek, onNavigateWeek }: WeekPickerProps) {
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const formatWeekRange = () => {
    const weekStart = getWeekStart(selectedWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const mondayDay = weekStart.getDate().toString().padStart(2, "0");
    const mondayMonth = (weekStart.getMonth() + 1).toString().padStart(2, "0");
    const sundayDay = weekEnd.getDate().toString().padStart(2, "0");
    const sundayMonth = (weekEnd.getMonth() + 1).toString().padStart(2, "0");

    return `Segunda ${mondayDay}/${mondayMonth} - Domingo ${sundayDay}/${sundayMonth}`;
  };

  return (
    <div className="hidden lg:flex items-center justify-center mb-4">
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigateWeek("prev")}
          className="h-10 w-10 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">{formatWeekRange()}</div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigateWeek("next")}
          className="h-10 w-10 rounded-full hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
