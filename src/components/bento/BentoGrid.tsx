import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { fadeUp, stagger } from "@/lib/motion";

export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={stagger(0.08)}
      initial="hidden"
      animate="visible"
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[160px]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

type Size = "sm" | "md" | "lg" | "xl";

const sizeClass: Record<Size, string> = {
  sm: "lg:col-span-1 lg:row-span-1",
  md: "lg:col-span-2 lg:row-span-1",
  lg: "lg:col-span-2 lg:row-span-2",
  xl: "lg:col-span-4 lg:row-span-2",
};

interface BentoCardProps extends HTMLMotionProps<"div"> {
  size?: Size;
  children: ReactNode;
}

export function BentoCard({ size = "sm", children, className, ...props }: BentoCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "glass glass-hover relative overflow-hidden rounded-2xl p-5",
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
