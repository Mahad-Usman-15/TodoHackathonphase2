"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";

const aiFeatures = [
  {
    id: "natural-language",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: "Natural Language Input",
    description: 'Just say "Add a task to call my dentist" — the AI parses intent and creates the task instantly.',
  },
  {
    id: "smart-match",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: "Smart Name Matching",
    description: 'Say "Complete the dentist task" and the AI looks up the exact ID — no guessing, no hallucinations.',
  },
  {
    id: "memory",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m0 4.5c0 2.278 3.694 4.125 8.25 4.125s8.25-1.847 8.25-4.125" />
      </svg>
    ),
    title: "Persistent Memory",
    description: "Conversation history is saved to the database. Pick up exactly where you left off every session.",
  },
  {
    id: "multi-step",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
    title: "Full CRUD via Chat",
    description: "Add, list, complete, update, and delete tasks — all through natural conversation. No UI required.",
  },
];

export default function AiSection() {
  return (
    <section className="bg-brand-bg py-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4">

        {/* ── CTA Banner ── */}
        <FadeIn>
          <div className="relative rounded-2xl border border-brand-primary/30 overflow-hidden mb-20">

            {/* Animated background glow orbs */}
            <motion.div
              className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-brand-primary/20 blur-3xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-brand-cta/15 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.45, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            />

            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(#9B3922 1px, transparent 1px), linear-gradient(90deg, #9B3922 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Banner content */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 px-8 py-14">

              {/* Left: text + CTA */}
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 bg-brand-cta/10 border border-brand-cta/30 rounded-full px-4 py-1.5 mb-5"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-cta animate-pulse" />
                  <span className="font-body text-xs text-brand-cta font-medium tracking-wide uppercase">
                    New · AI Agent
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.1 }}
                  className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white leading-tight mb-4"
                >
                  Manage Tasks with{" "}
                  <span className="text-brand-cta">Natural Language</span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.2 }}
                  className="font-body text-white/60 text-base md:text-lg max-w-lg mx-auto lg:mx-0 mb-8"
                >
                  Powered by Groq + llama-3.3-70b and MCP tools. Just chat — your AI agent adds, completes,
                  and deletes tasks in real time.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
                >
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center gap-2 bg-brand-cta hover:bg-brand-cta-hover text-white font-body font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                  >
                    Try AI Agent Free
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-brand-primary/10 text-white/70 hover:text-white font-body text-sm px-6 py-3 rounded-xl border border-brand-primary/30 hover:border-brand-primary/60 transition-colors"
                  >
                    Sign In
                  </Link>
                </motion.div>
              </div>

              {/* Right: animated chat preview */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-shrink-0 w-full max-w-sm"
              >
                <div className="bg-brand-bg/80 border border-brand-primary/25 rounded-2xl p-5 backdrop-blur-sm">
                  {/* Chat header */}
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-brand-primary/20">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-cta animate-pulse" />
                    <span className="font-body text-xs text-white/50">AI Agent · online</span>
                  </div>
                  {/* Chat messages */}
                  <div className="space-y-3 text-sm font-body">
                    <div className="flex justify-end">
                      <div className="bg-brand-cta text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                        Add a task to buy groceries
                      </div>
                    </div>
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 6 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                    >
                      <div className="bg-brand-primary/15 border border-brand-primary/20 text-white/80 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%]">
                        ✓ Task &quot;Buy groceries&quot; created!
                      </div>
                    </motion.div>
                    <div className="flex justify-end">
                      <div className="bg-brand-cta text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                        Show my pending tasks
                      </div>
                    </div>
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 6 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.8 }}
                    >
                      <div className="bg-brand-primary/15 border border-brand-primary/20 text-white/80 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%]">
                        You have 3 pending tasks
                        <motion.span
                          className="inline-block ml-0.5 w-0.5 h-4 bg-brand-cta align-middle"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </FadeIn>

        {/* ── AI Feature Cards ── */}
        <FadeIn>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white text-center mb-3">
            Everything Your Agent Can Do
          </h2>
          <p className="font-body text-white/50 text-center text-sm mb-10 max-w-md mx-auto">
            One conversation. Full task control.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {aiFeatures.map((f, i) => (
            <FadeIn key={f.id} delay={0.08 + i * 0.1}>
              <motion.div
                className="h-full bg-brand-deep/10 border border-brand-primary/20 rounded-xl p-5 cursor-default"
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                {/* Icon with glow ring */}
                <div className="relative mb-4 w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-xl bg-brand-cta/10" />
                  <div className="relative text-brand-cta">{f.icon}</div>
                </div>
                <h3 className="font-heading font-semibold text-white text-base mb-2">
                  {f.title}
                </h3>
                <p className="font-body text-white/60 text-sm leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}
