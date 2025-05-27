"use client";

import { motion } from "framer-motion";
import { cn } from "@eugenios/ui/lib/utils";

/**
 * A reusable animated div component with predefined transition and animation settings.
 *
 * Wraps `motion.div` from `framer-motion`, applying default fade and vertical slide animations on mount and unmount, along with smooth transition classes. Additional props and class names are merged and passed through.
 */
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
