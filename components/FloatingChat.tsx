"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "ai"; text: string };

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((p) => [...p, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((p) => [
        ...p,
        { role: "ai", text: data.reply ?? "Something went wrong." },
      ]);
    } catch {
      setMessages((p) => [...p, { role: "ai", text: "Connection failed." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[min(22rem,calc(100vw-3rem))] h-[28rem] rounded-3xl bg-surface border border-surface-hi shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-hi">
            <div>
              <p className="text-sm font-medium">Film talk</p>
              <p className="text-xs text-muted">Cinema only</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted hover:text-cream transition-colors cursor-pointer text-lg leading-none"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-xs text-muted leading-relaxed">
                Ask me anything about film. Try:
                <br />
                <span className="text-lavender">
                  &ldquo;What should I watch if I loved Parasite?&rdquo;
                </span>
              </p>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                  m.role === "user"
                    ? "bg-blush text-ink ml-auto rounded-br-md"
                    : "bg-surface-hi rounded-bl-md"
                }`}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="bg-surface-hi px-3.5 py-2.5 rounded-2xl rounded-bl-md w-fit">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:300ms]" />
                </span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form onSubmit={send} className="p-3 border-t border-surface-hi flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a film…"
              className="flex-1 px-4 py-2.5 rounded-full bg-ink outline-none text-sm placeholder:text-muted"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 shrink-0 rounded-full bg-blush text-ink disabled:opacity-30 transition-opacity cursor-pointer"
              aria-label="Send"
            >
              ↑
            </button>
          </form>
        </div>
      )}

      {/* Bubble */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blush text-ink text-xl shadow-lg hover:bg-apricot hover:scale-105 transition-all cursor-pointer flex items-center justify-center"
        aria-label={open ? "Close chat" : "Open film chat"}
      >
        {open ? "×" : "🎬"}
      </button>
    </>
  );
}