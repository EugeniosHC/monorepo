"use client";

import { useState } from "react";
import { Button } from "@eugenios/ui/components/button";
import { ChevronDown, X } from "lucide-react";
import { Badge } from "@eugenios/ui/components/badge";
import { Checkbox } from "@eugenios/ui/components/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@eugenios/ui/components/popover";

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder: string;
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onSelectionChange,
  placeholder,
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSelection = (value: string) => {
    if (selected.includes(value)) {
      onSelectionChange(selected.filter((item) => item !== value));
    } else {
      onSelectionChange([...selected, value]);
    }
  };

  const removeSelection = (value: string) => {
    onSelectionChange(selected.filter((item) => item !== value));
  };

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-12 justify-between text-left font-medium border-gray-300 bg-white hover:bg-white rounded-full px-4"
          >
            <span className={selected.length === 0 ? "text-gray-500" : "text-gray-900"}>
              {selected.length === 0
                ? label
                : `${selected.length} ${label.toLowerCase()} selecionada${selected.length > 1 ? "s" : ""}`}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 rounded-2xl border-gray-200 shadow-lg" align="start">
          <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option}
                className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-xl transition-colors"
              >
                <Checkbox
                  id={option}
                  checked={selected.includes(option)}
                  onCheckedChange={() => toggleSelection(option)}
                  className="rounded-md"
                />
                <label htmlFor={option} className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Tags dos selecionados */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selected.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {item}
              <button
                onClick={() => removeSelection(item)}
                className="ml-2 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
