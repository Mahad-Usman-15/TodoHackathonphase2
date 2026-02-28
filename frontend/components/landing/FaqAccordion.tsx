"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";

const faqs = [
  {
    id: "free",
    question: "Is Taskify free to use?",
    answer:
      "Yes, Taskify is completely free. No credit card required, no hidden fees — ever.",
  },
  {
    id: "secure",
    question: "Is my data secure?",
    answer:
      "Yes — your data is protected with JWT authentication and bcrypt password hashing. Only you can access your tasks.",
  },
  {
    id: "device",
    question: "Can I access my tasks from any device?",
    answer:
      "Yes — Taskify is a web application accessible from any browser on any device, including mobile and desktop.",
  },
  {
    id: "delete",
    question: "What happens to my data if I delete my account?",
    answer:
      "All your tasks and account data are permanently removed from our servers.",
  },
];

export default function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="bg-brand-bg py-20">
      <div className="mx-auto max-w-3xl px-4">
        <FadeIn>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white text-center mb-4">
            Frequently Asked Questions
          </h2>
          <p className="font-body text-white/60 text-center mb-12">
            Everything you need to know about Taskify.
          </p>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="divide-y divide-brand-primary/20">
            {faqs.map((faq) => (
              <div key={faq.id} className="py-5">
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full flex items-center justify-between text-left gap-4"
                  aria-expanded={openId === faq.id}
                >
                  <span className="font-heading text-white text-base font-medium">
                    {faq.question}
                  </span>
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 flex-shrink-0 text-brand-cta"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    animate={{ rotate: openId === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                </button>
                <AnimatePresence initial={false}>
                  {openId === faq.id && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="font-body text-white/70 text-sm mt-3 leading-relaxed pr-8">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
