"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface ConversationItem {
  id: string;
  type: string;
  service: { id: string; title: string; slug: string } | null;
  otherUser: { id: string; name: string; image: string | null } | null;
  lastMessage: {
    body: string | null;
    isSystem: boolean;
    createdAt: string;
    isMine: boolean;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

interface Props {
  basePath: string; // e.g. "/tableau-de-bord/client/messages"
  activeId?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}

export function ConversationList({ basePath, activeId }: Props) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => {
        setConversations(d.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10_000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<MessageCircle className="h-8 w-8" />}
          title="Aucune conversation"
          description="Vos conversations avec les vendeurs et clients apparaîtront ici."
        />
      </div>
    );
  }

  return (
    <nav className="divide-y divide-gray-100">
      {conversations.map((conv) => {
        const isActive = conv.id === activeId;
        const preview = conv.lastMessage?.isSystem
          ? "Conversation créée"
          : conv.lastMessage?.body
            ? `${conv.lastMessage.isMine ? "Vous : " : ""}${conv.lastMessage.body}`
            : "…";

        return (
          <Link
            key={conv.id}
            href={`${basePath}/${conv.id}`}
            className={cn(
              "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50",
              isActive && "bg-primary-50 hover:bg-primary-50",
            )}
          >
            <Avatar
              name={conv.otherUser?.name ?? "?"}
              src={conv.otherUser?.image}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "truncate text-sm",
                    conv.unreadCount > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700",
                  )}
                >
                  {conv.otherUser?.name ?? "Utilisateur"}
                </p>
                {conv.lastMessage && (
                  <span className="shrink-0 text-xs text-gray-400">
                    {timeAgo(conv.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs text-gray-500">{preview}</p>
                {conv.unreadCount > 0 && (
                  <Badge variant="primary" className="shrink-0 text-[10px]">
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
              {conv.service && (
                <p className="mt-0.5 truncate text-[11px] text-gray-400">
                  {conv.service.title}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
