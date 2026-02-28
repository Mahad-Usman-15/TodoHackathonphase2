"use client";

import { motion, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** When true, animates on mount instead of on scroll entry */
  immediate?: boolean;
}

export default function FadeIn({
  children,
  delay = 0,
  className,
  immediate = false,
}: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      variants={fadeUp}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
      {...(immediate
        ? { animate: "visible" }
        : { whileInView: "visible", viewport: { once: true, margin: "-60px" } })}
    >
      {children}
    </motion.div>
  );
}
