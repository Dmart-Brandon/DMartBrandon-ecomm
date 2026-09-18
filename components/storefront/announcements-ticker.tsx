'use client';

import { Megaphone } from 'lucide-react';

export function AnnouncementsTicker({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;

  const repeated = [...messages, ...messages];

  return (
    <div className="w-full overflow-hidden border-b border-[#f0e6bc]/80 bg-[#fff8e1] lg:border-border/60 lg:bg-primary/5">
      <div className="relative flex h-7 items-center lg:h-8">
        <div className="absolute left-0 top-0 bottom-0 z-10 w-6 bg-gradient-to-r from-[#fff8e1] to-transparent lg:w-8 lg:from-background" />
        <div className="absolute right-0 top-0 bottom-0 z-10 w-6 bg-gradient-to-l from-[#fff8e1] to-transparent lg:w-8 lg:from-background" />
        <div className="flex animate-marquee whitespace-nowrap">
          {repeated.map((msg, i) => (
            <span
              key={i}
              className="mx-6 inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground/85 lg:mx-8 lg:text-xs lg:font-medium"
            >
              <Megaphone className="h-3 w-3 shrink-0 text-[#318616] lg:text-primary" />
              {msg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
