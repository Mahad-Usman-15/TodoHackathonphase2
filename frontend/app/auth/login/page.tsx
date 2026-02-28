import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Taskify account and manage your tasks.",
  alternates: {
    canonical: "/auth/login",
  },
  openGraph: {
    title: "Sign In | Taskify",
    url: "/auth/login",
  },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-deep to-brand-bg flex items-center justify-center px-4 py-12">
      <FadeIn immediate delay={0.1} className="w-full max-w-md">
      <div className="bg-brand-deep/10 backdrop-blur-md border border-brand-primary/20 rounded-2xl px-8 py-10 shadow-2xl shadow-brand-bg/50">
        <div className="mb-8 text-center">
          <h1 className="font-heading font-bold text-2xl text-white mb-2">
            Welcome back
          </h1>
          <p className="font-body text-sm text-white/60">
            Sign in to your account
          </p>
        </div>
        <LoginForm />
      </div>
      </FadeIn>
    </div>
  );
}
