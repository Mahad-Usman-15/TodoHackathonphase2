"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth_context";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white px-8 py-10 shadow-sm border border-gray-200">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
            <p className="mt-2 text-sm text-gray-600">Start managing your tasks today</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
