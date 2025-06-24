import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader } from "@eugenios/ui/components/dialog";
import { Button } from "@eugenios/ui/components/button";
import { IconSelector } from "./IconSelector";
import { iconManager } from "@eugenios/icons/src/index";
import type { IconLibrary } from "@eugenios/icons/src/index";

interface IconPickerDialogProps {
  value?: { name: string; library: IconLibrary };
  onChange: (value: { name: string; library: IconLibrary }) => void;
  trigger?: React.ReactNode;
}

export const IconPickerDialog: React.FC<IconPickerDialogProps> = ({ value, onChange, trigger }) => {
  const [open, setOpen] = useState(false);

  const renderSelectedIcon = () => {
    if (!value) return null;

    const Icon = iconManager.getIconComponent(value.name, value.library);
    return Icon ? <Icon size={20} /> : null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            {value ? (
              <div className="flex items-center gap-2">
                {renderSelectedIcon()}
                <span>{value.name}</span>
              </div>
            ) : (
              "Select Icon"
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>Select an Icon</DialogHeader>
        <IconSelector
          onSelect={(name, library) => {
            onChange({ name, library });
            setOpen(false);
          }}
          selectedIcon={value?.name}
          selectedLibrary={value?.library}
        />
      </DialogContent>
    </Dialog>
  );
};
