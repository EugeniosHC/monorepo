"use client";

import { Handshake, Ticket, TicketSlash } from "lucide-react";
import ClientSupportCard from "./ClientSupportCard";
import { motion } from "framer-motion";

const apoioaocliente = [
  {
    id: "vouher",
    icon: <Ticket className="h-6 w-6 text-primary" />,
    title: "Validade do Voucher",
    description: "Os vouchers têm uma validade de 3 meses a partir da data de compra.",
  },
  {
    id: "reserva",
    icon: <Handshake className="h-6 w-6 text-primary" />,
    title: "Reserva",
    description: "Ligue até 48h antes para efetuar a reserva.",
  },
  {
    id: "cancelamento",
    icon: <TicketSlash className="h-6 w-6 text-primary" />,
    title: "Cancelamento",
    description: "Cancelamentos devem ser feitos com 24h de antecedência.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

export default function ClientSupportSection() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {apoioaocliente.map((item, index) => (
          <ClientSupportCard
            key={item.id}
            id={item.id}
            icon={item.icon}
            title={item.title}
            description={item.description}
          />
        ))}
      </motion.div>
      <motion.div
        className="flex justify-center mt-10"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.7,
          delay: 0.8,
          type: "spring",
          stiffness: 100,
          damping: 12,
        }}
      />
    </motion.div>
  );
}
