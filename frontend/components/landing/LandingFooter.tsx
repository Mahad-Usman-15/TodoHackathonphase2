import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";

export default function LandingFooter() {
  return (
    <footer className="bg-brand-deep/10 border-t border-brand-primary/20 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <FadeIn>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-heading font-bold text-white text-lg">
              Taskify
            </span>
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="font-body text-sm text-white/60 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/auth/login"
                className="font-body text-sm text-white/60 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="font-body text-sm text-white/60 hover:text-white transition-colors"
              >
                Get Started
              </Link>
            </nav>
            <p className="font-body text-xs text-white/40">
              © 2026 Taskify. All rights reserved.
            </p>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}
