"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, ExternalLink } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  data: Record<string, string> | null;
  readAt: string | null;
  createdAt: string;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // SSE connection for real-time updates
  useEffect(() => {
    const es = new EventSource("/api/notifications/stream");

    es.addEventListener("unread_count", (e) => {
      const data = JSON.parse(e.data);
      setCount(data.count);
    });

    es.addEventListener("notification", (e) => {
      const n = JSON.parse(e.data);
      setItems((prev) => [{ ...n, readAt: null }, ...prev].slice(0, 10));
    });

    es.onerror = () => {
      es.close();
      // Fallback to polling on SSE failure
      const poll = setInterval(async () => {
        try {
          const res = await fetch("/api/notifications/unread-count");
          const data = await res.json();
          setCount(data.count);
        } catch { /* skip */ }
      }, 15000);
      return () => clearInterval(poll);
    };

    return () => es.close();
  }, []);

  // Fetch recent notifications when dropdown opens
  const fetchRecent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=8");
      const data = await res.json();
      setItems(data.items);
    } catch { /* skip */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) fetchRecent();
  }, [open, fetchRecent]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
  }

  function handleClick(n: Notification) {
    const link = n.data?.link;
    setOpen(false);
    if (link) router.push(link);
  }

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "À l'instant";
    if (min < 60) return `${min}min`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j`;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {count > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                <Check className="h-3 w-3" /> Tout marquer lu
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">Chargement…</div>
            )}
            {!loading && items.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                Aucune notification pour le moment.
              </div>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${
                  !n.readAt ? "bg-primary-50/40" : ""
                }`}
              >
                <div className="mt-0.5">
                  {!n.readAt && <span className="block h-2 w-2 rounded-full bg-primary-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{n.body}</p>
                  <p className="mt-1 text-[10px] text-gray-400">{timeAgo(n.createdAt)}</p>
                </div>
                {n.data?.link && <ExternalLink className="mt-1 h-3 w-3 shrink-0 text-gray-300" />}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/tableau-de-bord/client/notifications");
              }}
              className="w-full text-center text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
