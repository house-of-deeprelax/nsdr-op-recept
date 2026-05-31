import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { pageTransition } from "@/lib/motion";

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      className="relative z-10"
    >
      {children}
    </motion.div>
  );
}
