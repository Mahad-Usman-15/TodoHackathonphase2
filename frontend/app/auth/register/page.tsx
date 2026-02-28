import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Join Taskify for free. Create an account and start managing your tasks today.",
  alternates: {
    canonical: "/auth/register",
  },
  openGraph: {
    title: "Create Account | Taskify",
    url: "/auth/register",
  },
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-deep to-brand-bg flex items-center justify-center px-4 py-12">
      <FadeIn immediate delay={0.1} className="w-full max-w-md">
      <div className="bg-brand-deep/10 backdrop-blur-md border border-brand-primary/20 rounded-2xl px-8 py-10 shadow-2xl shadow-brand-bg/50">
        <div className="mb-8 text-center">
          <h1 className="font-heading font-bold text-2xl text-white mb-2">
            Create your account
          </h1>
          <p className="font-body text-sm text-white/60">
            Join Taskify — it&apos;s free
          </p>
        </div>
        <RegisterForm />
      </div>
      </FadeIn>
    </div>
  );
}
