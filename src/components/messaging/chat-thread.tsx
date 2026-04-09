"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FileText } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageInput } from "./message-input";
import { OfferPanel } from "./offer-panel";
import { OfferForm } from "./offer-form";
import { sendMessage, markConversationRead } from "@/lib/messaging-actions";

interface MessageItem {
  id: string;
  body: string | null;
  isSystem: boolean;
  createdAt: string;
  author: { id: string; name: string; image: string | null };
  isMine: boolean;
  attachments: { id: string; fileUrl: string; mimeType: string; sizeBytes: number }[];
}

interface Props {
  conversationId: string;
  otherUserName?: string;
  serviceName?: string;
  iAmSeller?: boolean;
  hasService?: boolean;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateSep(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export function ChatThread({
  conversationId,
  otherUserName,
  serviceName,
  iAmSeller = false,
  hasService = false,
}: Props) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [offerFormOpen, setOfferFormOpen] = useState(false);
  const [offerRefresh, setOfferRefresh] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | null>(null);

  const fetchMessages = useCallback(() => {
    fetch(`/api/conversations/${conversationId}/messages`)
      .then((r) => r.json())
      .then((d) => {
        const msgs: MessageItem[] = d.data ?? [];
        setMessages(msgs);
        setLoading(false);
        const newLastId = msgs[msgs.length - 1]?.id;
        if (newLastId && newLastId !== lastIdRef.current) {
          lastIdRef.current = newLastId;
          requestAnimationFrame(() =>
            bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          );
        }
      })
      .catch(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
    markConversationRead(conversationId);
    const interval = setInterval(fetchMessages, 4_000);
    return () => clearInterval(interval);
  }, [conversationId, fetchMessages]);

  async function handleSend(body: string) {
    setSending(true);
    const result = await sendMessage(conversationId, body);
    setSending(false);
    if (!result.error) {
      fetchMessages();
      markConversationRead(conversationId);
    }
    return result;
  }

  const grouped: { date: string; messages: MessageItem[] }[] = [];
  for (const msg of messages) {
    const date = new Date(msg.createdAt).toDateString();
    const last = grouped[grouped.length - 1];
    if (last?.date === date) {
      last.messages.push(msg);
    } else {
      grouped.push({ date, messages: [msg] });
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={otherUserName ?? "?"} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {otherUserName ?? "Conversation"}
            </p>
            {serviceName && (
              <p className="truncate text-xs text-gray-500">{serviceName}</p>
            )}
          </div>
        </div>
        {iAmSeller && hasService && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOfferFormOpen(true)}
            icon={<FileText className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">Créer une offre</span>
          </Button>
        )}
      </div>

      {/* Offers panel */}
      <OfferPanel conversationId={conversationId} refreshKey={offerRefresh} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn("flex", i % 2 ? "justify-end" : "justify-start")}>
                <Skeleton className="h-10 w-48 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.date}>
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">
                  {formatDateSep(group.messages[0].createdAt)}
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="space-y-2">
                {group.messages.map((msg) => {
                  if (msg.isSystem) {
                    return (
                      <p
                        key={msg.id}
                        className="py-1 text-center text-xs text-gray-400"
                      >
                        {msg.body ?? "Événement système"}
                      </p>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={cn("flex", msg.isMine ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5",
                          msg.isMine
                            ? "rounded-br-md bg-primary-600 text-white"
                            : "rounded-bl-md bg-gray-100 text-gray-900",
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm">
                          {msg.body}
                        </p>
                        {msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.attachments.map((att) => (
                              <a
                                key={att.id}
                                href={att.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "block truncate text-xs underline",
                                  msg.isMine ? "text-white/80" : "text-primary-600",
                                )}
                              >
                                Piece jointe ({Math.round(att.sizeBytes / 1024)} Ko)
                              </a>
                            ))}
                          </div>
                        )}
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            msg.isMine ? "text-white/60" : "text-gray-400",
                          )}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} sending={sending} />

      {/* Offer creation modal */}
      <OfferForm
        conversationId={conversationId}
        open={offerFormOpen}
        onClose={() => setOfferFormOpen(false)}
        onCreated={() => {
          setOfferRefresh((n) => n + 1);
          fetchMessages();
        }}
      />
    </div>
  );
}
