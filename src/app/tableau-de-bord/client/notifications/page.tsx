"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, ExternalLink, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Notification {
  id: string;
  title: string;
  body: string;
  data: Record<string, string> | null;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = useCallback(async (c?: string | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (c) params.set("cursor", c);
      const res = await fetch(`/api/notifications?${params}`);
      const data = await res.json();
      setItems((prev) => (c ? [...prev, ...data.items] : data.items));
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch { /* skip */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markAllRead() {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
  }

  async function markRead(ids: string[]) {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setItems((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, readAt: new Date().toISOString() } : n)),
    );
  }

  function handleClick(n: Notification) {
    if (!n.readAt) markRead([n.id]);
    const link = n.data?.link;
    if (link) router.push(link);
  }

  const displayed = filter === "unread" ? items.filter((n) => !n.readAt) : items;
  const unreadCount = items.filter((n) => !n.readAt).length;

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
              {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-l-lg px-3 py-1.5 font-medium transition ${
                filter === "all" ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`rounded-r-lg px-3 py-1.5 font-medium transition ${
                filter === "unread" ? "bg-primary-50 text-primary-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Non lues
            </button>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              <Check className="mr-1 h-3.5 w-3.5" /> Tout marquer lu
            </Button>
          )}
        </div>
      </div>

      <Card padding="none">
        {displayed.length === 0 && !loading && (
          <div className="px-6 py-12 text-center">
            <Bell className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">
              {filter === "unread"
                ? "Aucune notification non lue."
                : "Aucune notification pour le moment."}
            </p>
          </div>
        )}

        {displayed.map((n) => (
          <button
            key={n.id}
            onClick={() => handleClick(n)}
            className={`flex w-full items-start gap-3 border-b border-gray-50 px-5 py-4 text-left transition hover:bg-gray-50 last:border-b-0 ${
              !n.readAt ? "bg-primary-50/30" : ""
            }`}
          >
            <div className="mt-1.5 shrink-0">
              {!n.readAt ? (
                <span className="block h-2.5 w-2.5 rounded-full bg-primary-500" />
              ) : (
                <span className="block h-2.5 w-2.5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{n.title}</p>
              <p className="mt-0.5 text-sm text-gray-500">{n.body}</p>
              <p className="mt-1 text-xs text-gray-400">{formatDate(n.createdAt)}</p>
            </div>
            {n.data?.link && <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-gray-300" />}
          </button>
        ))}

        {loading && (
          <div className="px-6 py-4 text-center text-sm text-gray-400">Chargement…</div>
        )}
      </Card>

      {hasMore && !loading && (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => fetchNotifications(cursor)}
            icon={<ChevronDown className="h-4 w-4" />}
          >
            Charger plus
          </Button>
        </div>
      )}
    </div>
  );
}
