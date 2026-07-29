"use client";

import { useState } from "react";

type Msg = { role: "user" | "ai"; text: string };

export default function ChatBox() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

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
      setMessages((p) => [...p, { role: "ai", text: data.reply ?? "Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Ask about film</h1>
      <p className="text-sm text-muted mb-8">
        Cinema only — it will politely refuse anything else.
      </p>

      <div className="space-y-4 mb-6 min-h-[300px]">
        {messages.length === 0 && (
          <p className="text-muted text-sm">
            Try: &ldquo;What should I watch if I loved Parasite?&rdquo;
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`px-4 py-3 rounded-2xl text-sm max-w-[85%] ${
              m.role === "user"
                ? "bg-blush text-ink ml-auto"
                : "bg-surface"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <p className="text-muted text-sm">thinking…</p>}
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a film…"
          className="flex-1 px-4 py-3 rounded-full bg-surface outline-none text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-full bg-blush text-ink text-sm font-medium disabled:opacity-40 cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
}