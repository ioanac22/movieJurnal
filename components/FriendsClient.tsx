"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = { id: string; username: string; imageUrl: string };
type Request = { friendshipId: string; user: User };

export default function FriendsClient({
  friends,
  incoming,
}: {
  friends: User[];
  incoming: Request[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [sent, setSent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.users ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function sendRequest(targetId: string) {
    setSent((p) => [...p, targetId]);
    await fetch("/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId }),
    });
    router.refresh();
  }

  async function respond(friendshipId: string, accept: boolean) {
    await fetch("/api/friends/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendshipId, accept }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xl font-medium mb-4">Find people</h2>
        <form onSubmit={search} className="flex gap-2 mb-5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username…"
            className="flex-1 px-4 py-2.5 rounded-full bg-surface outline-none text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-full bg-blush text-ink text-sm font-medium disabled:opacity-40 cursor-pointer"
          >
            {loading ? "…" : "Search"}
          </button>
        </form>

        <div className="space-y-2">
          {results.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3"
            >
              <Image
                src={u.imageUrl}
                alt={u.username}
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="flex-1 text-sm">{u.username}</span>
              <button
                onClick={() => sendRequest(u.id)}
                disabled={sent.includes(u.id)}
                className="text-xs px-4 py-1.5 rounded-full bg-surface-hi hover:bg-blush hover:text-ink transition-colors disabled:opacity-40 cursor-pointer"
              >
                {sent.includes(u.id) ? "Sent" : "Add"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {incoming.length > 0 && (
        <section>
          <h2 className="text-xl font-medium mb-4">Requests</h2>
          <div className="space-y-2">
            {incoming.map((r) => (
              <div
                key={r.friendshipId}
                className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3"
              >
                <Image
                  src={r.user.imageUrl}
                  alt={r.user.username}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <span className="flex-1 text-sm">{r.user.username}</span>
                <button
                  onClick={() => respond(r.friendshipId, true)}
                  className="text-xs px-4 py-1.5 rounded-full bg-blush text-ink cursor-pointer"
                >
                  Accept
                </button>
                <button
                  onClick={() => respond(r.friendshipId, false)}
                  className="text-xs px-4 py-1.5 rounded-full bg-surface-hi hover:bg-surface transition-colors cursor-pointer"
                >
                  Decline
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-medium mb-4">Your friends</h2>
        {friends.length === 0 ? (
          <p className="text-sm text-muted">No friends yet. Search for someone above.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {friends.map((f) => (
              <Link
                key={f.id}
                href={`/u/${f.id}`}
                className="flex items-center gap-3 rounded-2xl bg-surface hover:bg-surface-hi transition-colors px-4 py-3"
              >
                <Image
                  src={f.imageUrl}
                  alt={f.username}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <span className="text-sm">{f.username}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}