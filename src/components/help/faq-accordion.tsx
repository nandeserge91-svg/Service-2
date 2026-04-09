"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  question: string;
  answer: string;
}

export function FaqAccordion({ question, answer }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-gray-900"
      >
        {question}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-gray-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <p className="px-4 pb-4 text-sm leading-relaxed text-gray-600">{answer}</p>
      </div>
    </div>
  );
}
