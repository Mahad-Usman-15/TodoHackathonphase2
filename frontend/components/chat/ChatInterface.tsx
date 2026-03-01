"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id?: number;
}

interface ChatInterfaceProps {
  userId: number;
  conversationId?: number | null;
  onNewConversation?: () => void;
  onConversationCreated?: (id: number) => void;
}

export default function ChatInterface({
  userId,
  conversationId,
  onNewConversation,
  onConversationCreated,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeConvId, setActiveConvId] = useState<number | null>(
    conversationId ?? null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load history when conversationId changes
  useEffect(() => {
    setActiveConvId(conversationId ?? null);
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setIsLoadingHistory(true);
    fetch(`${BASE_URL}/${userId}/conversations/${conversationId}/messages`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ChatMessage[]) => {
        setMessages(data);
      })
      .catch(() => {
        setMessages([]);
      })
      .finally(() => {
        setIsLoadingHistory(false);
      });
  }, [conversationId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setIsLoading(true);

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch(`${BASE_URL}/${userId}/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversation_id: activeConvId ?? undefined,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Add empty assistant message placeholder for streaming
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json) continue;
          try {
            const event = JSON.parse(json);
            if (event.type === "delta") {
              // Append delta to the last assistant message in real time
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + event.delta,
                  };
                }
                return updated;
              });
            } else if (event.type === "tool_called") {
              // Briefly show a tool indicator in the streaming message
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant" && last.content === "") {
                  updated[updated.length - 1] = {
                    ...last,
                    content: `_Using ${event.tool}…_`,
                  };
                }
                return updated;
              });
            } else if (event.type === "done") {
              // Replace streaming placeholder with the canonical final response
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: event.response,
                };
                return updated;
              });
              if (event.conversation_id && !activeConvId) {
                setActiveConvId(event.conversation_id);
                onConversationCreated?.(event.conversation_id);
              }
            } else if (event.type === "error") {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: event.error,
                };
                return updated;
              });
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble responding right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, userId, activeConvId, onConversationCreated]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-primary/20">
        <h2 className="font-heading font-semibold text-white text-lg">
          AI Agent
        </h2>
        {onNewConversation && (
          <button
            onClick={onNewConversation}
            title="New conversation"
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-brand-cta border border-brand-primary/30 hover:border-brand-cta rounded-lg px-3 py-1.5 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isLoadingHistory ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-brand-primary/20 rounded w-3/4 mb-2" />
                <div className="h-4 bg-brand-primary/20 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brand-cta"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="font-body text-white/60 text-sm">
              Start a conversation to manage your tasks with AI
            </p>
            <p className="font-body text-white/40 text-xs mt-2">
              Try: &quot;Add a task to buy groceries&quot; or &quot;Show my pending tasks&quot;
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-body ${
                  msg.role === "user"
                    ? "bg-brand-cta text-white rounded-br-sm"
                    : "bg-brand-primary/20 text-white/90 rounded-bl-sm border border-brand-primary/20"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-brand-primary/20 border border-brand-primary/20 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-brand-cta rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="w-2 h-2 bg-brand-cta rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 bg-brand-cta rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-brand-primary/20">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message your AI assistant…"
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-xl bg-brand-primary/10 border border-brand-primary/30 text-white placeholder-white/40 font-body text-sm px-4 py-2.5 focus:outline-none focus:border-brand-cta transition-colors disabled:opacity-50 max-h-32 overflow-auto"
            style={{ minHeight: "42px" }}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-cta hover:bg-brand-cta-hover disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22 11 13 2 9l20-7z" />
            </svg>
          </button>
        </div>
        <p className="text-white/30 text-xs font-body mt-1.5 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
