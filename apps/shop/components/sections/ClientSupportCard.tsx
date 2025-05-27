"use client";

import React from "react";
import { Card, CardContent } from "@eugenios/ui/components/card";
import { motion } from "framer-motion";

interface ClientSupportCardProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      duration: 0.6,
    },
  },
  hover: {
    y: -5,
    transition: {
      duration: 0.3,
    },
  },
};

const iconVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.1,
    rotate: [0, -5, 5, -3, 0],
    transition: {
      rotate: {
        repeat: 0,
        duration: 0.5,
      },
    },
  },
};

const titleVariants = {
  initial: { y: 0 },
  hover: {
    y: -5,
    transition: {
      duration: 0.3,
    },
  },
};

export default function ClientSupportCard({ id, icon, title, description }: ClientSupportCardProps) {
  return (
    <motion.div
      key={id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
      className="will-change-transform"
    >
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <motion.div
            className="mb-4 p-3 rounded-full bg-primary/10 flex items-center justify-center"
            variants={iconVariants}
            initial="initial"
            whileHover="hover"
          >
            {icon}
          </motion.div>
          <motion.h3 className="text-lg font-semibold mb-2" variants={titleVariants}>
            {title}
          </motion.h3>{" "}
          <motion.p
            className="text-sm text-gray-600"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          >
            {description}
          </motion.p>
          <motion.div
            className="w-0 h-1 bg-primary mt-4 rounded-full"
            initial={{ width: 0 }}
            whileHover={{ width: "70%", transition: { type: "spring", stiffness: 400, damping: 10 } }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
