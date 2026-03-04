"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth_context";
import { api } from "@/lib/api";
import ChatInterface from "@/components/chat/ChatInterface";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function ChatPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoadingConv, setIsLoadingConv] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Load latest conversation on mount
  useEffect(() => {
    if (!user || isLoading) return;

    api.getLatestConversation(user.id)
      .then((data) => {
        setConversationId(data.conversation_id ?? null);
      })
      .catch(() => {
        setConversationId(null);
      })
      .finally(() => {
        setIsLoadingConv(false);
      });
  }, [user, isLoading]);

  const handleNewConversation = () => {
    setConversationId(null);
  };

  const handleConversationCreated = (id: number) => {
    setConversationId(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-cta border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col ">
      <DashboardHeader username={user.username} onLogout={logout} />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6 pb-24 sm:pb-6 flex flex-col">
        <div className="flex-1 rounded-2xl border border-brand-primary/20 overflow-hidden flex flex-col min-h-0">
          {isLoadingConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand-cta border-t-transparent" />
            </div>
          ) : (
            <ErrorBoundary>
              <ChatInterface
                userId={user.id}
                conversationId={conversationId}
                onNewConversation={handleNewConversation}
                onConversationCreated={handleConversationCreated}
              />
            </ErrorBoundary>
          )}
        </div>
      </main>
    </div>
  );
}
