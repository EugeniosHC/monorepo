"use client";

import { motion } from "framer-motion";
import { cn } from "@eugenios/ui/lib/utils";

export default function MotionDiv({ className, ...props }: React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      className={cn("transition-all duration-500 ease-in-out", className)}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      {...props}
    />
  );
}
