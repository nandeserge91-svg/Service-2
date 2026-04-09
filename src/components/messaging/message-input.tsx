"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onSend: (body: string) => Promise<{ error?: string }>;
  sending: boolean;
}

export function MessageInput({ onSend, sending }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || sending) return;

    const body = value;
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const result = await onSend(body);
    if (result.error) setValue(body);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-gray-200 bg-white px-4 py-3"
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          autoResize();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Écrivez votre message…"
        rows={1}
        className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm transition-colors placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
      />
      <button
        type="submit"
        disabled={!value.trim() || sending}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
          value.trim() && !sending
            ? "bg-primary-600 text-white hover:bg-primary-700"
            : "bg-gray-100 text-gray-400",
        )}
        aria-label="Envoyer"
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  );
}
