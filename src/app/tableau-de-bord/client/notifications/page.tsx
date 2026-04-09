"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Check, ExternalLink, ChevronDown, Search, Inbox,
  ShoppingBag, MessageCircle, AlertTriangle, Star, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Notification {
  id: string;
  channel: string;
  title: string;
  body: string;
  data: Record<string, string> | null;
  readAt: string | null;
  createdAt: string;
}

type StatusFilter = "all" | "unread" | "read";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  order: ShoppingBag,
  payment: CreditCard,
  message: MessageCircle,
  dispute: AlertTriangle,
  review: Star,
};

function guessCategory(n: Notification): string {
  const d = n.data;
  if (d?.orderId) return "order";
  if (d?.conversationId) return "message";
  if (d?.disputeId) return "dispute";
  if (n.title.toLowerCase().includes("avis")) return "review";
  if (n.title.toLowerCase().includes("paiement")) return "payment";
  return "other";
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(
    async (c?: string | null) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "20", status: filter });
        if (c) params.set("cursor", c);
        if (search) params.set("search", search);
        const res = await fetch(`/api/notifications?${params}`);
        const data = await res.json();
        setItems((prev) => (c ? [...prev, ...data.items] : data.items));
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
        setTotalCount(data.totalCount);
        setUnreadCount(data.unreadCount);
      } catch {
        /* skip */
      }
      setLoading(false);
    },
    [filter, search],
  );

  useEffect(() => {
    setItems([]);
    setCursor(null);
    fetchNotifications();
  }, [fetchNotifications]);

  async function markAllRead() {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setUnreadCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
  }

  async function markRead(ids: string[]) {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setUnreadCount((c) => Math.max(0, c - ids.length));
    setItems((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, readAt: new Date().toISOString() } : n)),
    );
  }

  function handleClick(n: Notification) {
    if (!n.readAt) markRead([n.id]);
    const link = n.data?.link;
    if (link) router.push(link);
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    if (isToday) {
      return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function groupByDate(
    notifications: Notification[],
  ): { label: string; items: Notification[] }[] {
    const groups: Map<string, Notification[]> = new Map();
    const today = new Date();

    for (const n of notifications) {
      const d = new Date(n.createdAt);
      let label: string;

      const diffDays = Math.floor(
        (today.getTime() - d.getTime()) / 86400000,
      );
      if (diffDays === 0) label = "Aujourd'hui";
      else if (diffDays === 1) label = "Hier";
      else if (diffDays < 7) label = "Cette semaine";
      else if (diffDays < 30) label = "Ce mois";
      else label = "Plus ancien";

      const existing = groups.get(label) ?? [];
      existing.push(n);
      groups.set(label, existing);
    }

    return Array.from(groups.entries()).map(([label, items]) => ({
      label,
      items,
    }));
  }

  const groups = groupByDate(items);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-900">Centre de notifications</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
              {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-xs text-gray-400">{totalCount} au total</span>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <Check className="mr-1 h-3.5 w-3.5" /> Tout marquer lu
          </Button>
        )}
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 text-xs">
          {(["all", "unread", "read"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 font-medium transition first:rounded-l-lg last:rounded-r-lg ${
                filter === s
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s === "all" ? "Toutes" : s === "unread" ? "Non lues" : "Lues"}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-1.5 pl-9 pr-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Notification groups */}
      {groups.length === 0 && !loading && (
        <Card className="py-12 text-center">
          <Inbox className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">
            {filter === "unread"
              ? "Aucune notification non lue."
              : search
                ? "Aucun résultat pour cette recherche."
                : "Aucune notification pour le moment."}
          </p>
        </Card>
      )}

      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {group.label}
          </p>
          <Card padding="none">
            {group.items.map((n) => {
              const cat = guessCategory(n);
              const CatIcon = CATEGORY_ICONS[cat] ?? Bell;
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex w-full items-start gap-3 border-b border-gray-50 px-5 py-4 text-left transition hover:bg-gray-50 last:border-b-0 ${
                    !n.readAt ? "bg-primary-50/30" : ""
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <CatIcon className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!n.readAt && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                      )}
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">{n.body}</p>
                    <p className="mt-1 text-xs text-gray-400">{formatDate(n.createdAt)}</p>
                  </div>
                  {n.data?.link && (
                    <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-gray-300" />
                  )}
                </button>
              );
            })}
          </Card>
        </div>
      ))}

      {loading && (
        <div className="py-4 text-center text-sm text-gray-400">Chargement…</div>
      )}

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
