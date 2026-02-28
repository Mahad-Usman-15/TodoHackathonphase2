import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";

export default function HeroSection() {
  return (
    <section className="relative bg-brand-bg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-deep/20 to-transparent pointer-events-none" />
      <div className="relative mx-auto max-w-4xl px-4 py-24 md:py-36 text-center">
        <FadeIn immediate delay={0.05}>
          <h1 className="font-heading font-bold text-4xl md:text-6xl text-white leading-tight mb-6">
            Manage Your Tasks,{" "}
            <span className="text-brand-cta">Effortlessly</span>
          </h1>
        </FadeIn>
        <FadeIn immediate delay={0.2}>
          <p className="font-body text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Taskify is a secure, fast task manager built with JWT authentication
            and a clean interface. Focus on what matters — your tasks.
          </p>
        </FadeIn>
        <FadeIn immediate delay={0.35}>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/auth/register"
              className="font-heading font-semibold text-base bg-brand-cta hover:bg-brand-cta-hover text-white px-8 py-4 rounded-xl transition-colors shadow-lg shadow-brand-cta/20"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/login"
              className="font-body text-base text-white/70 hover:text-white border border-brand-primary/30 hover:border-brand-primary/60 px-8 py-4 rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
