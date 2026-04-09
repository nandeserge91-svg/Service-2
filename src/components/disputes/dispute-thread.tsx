"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addDisputeMessage } from "@/lib/dispute-actions";

interface Message {
  id: string;
  body: string;
  isSystem: boolean;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorImage?: string | null;
  isStaff: boolean;
}

interface Props {
  disputeId: string;
  messages: Message[];
  canReply: boolean;
  currentUserId: string;
}

export function DisputeThread({ disputeId, messages, canReply, currentUserId }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    if (!body.trim()) return;
    setSending(true);
    setError("");
    const result = await addDisputeMessage(disputeId, body);
    setSending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setBody("");
      router.refresh();
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-4">
      {messages.map((m) => {
        if (m.isSystem) {
          return (
            <div key={m.id} className="flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="h-3.5 w-3.5 text-primary-400" />
              <span>{m.body}</span>
              <span className="ml-auto">{formatTime(m.createdAt)}</span>
            </div>
          );
        }

        const isMe = m.authorId === currentUserId;

        return (
          <div key={m.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
            <Avatar name={m.authorName} src={m.authorImage} size="sm" />
            <div className={`max-w-[75%] ${isMe ? "text-right" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">
                  {m.authorName}
                </span>
                {m.isStaff && (
                  <span className="rounded bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700">
                    SUPPORT
                  </span>
                )}
                <span className="text-[10px] text-gray-400">{formatTime(m.createdAt)}</span>
              </div>
              <div
                className={`mt-1 inline-block rounded-xl px-4 py-2 text-sm ${
                  m.isStaff
                    ? "bg-primary-50 text-primary-800"
                    : isMe
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {m.body}
              </div>
            </div>
          </div>
        );
      })}

      {canReply && (
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          {error && <p className="text-xs text-danger-600">{error}</p>}
          <div className="flex gap-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Votre message…"
              rows={2}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              loading={sending}
              disabled={!body.trim()}
              icon={<Send className="h-4 w-4" />}
              className="self-end"
            >
              Envoyer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
