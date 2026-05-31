"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  q: string;
  a: React.ReactNode;
}

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div 
            key={i} 
            className={cn(
              "fuser-card overflow-hidden transition-all duration-300",
              isOpen ? "bg-surface-elevated/40 border-accent/20" : "bg-canvas/30 hover:bg-canvas/50"
            )}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full px-6 py-5 flex items-center justify-between text-left group"
            >
              <h3 className="text-lg md:text-xl font-display font-semibold text-primary flex items-center gap-4">
                <span className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all border",
                  isOpen 
                    ? "bg-accent text-canvas border-accent" 
                    : "bg-accent/5 text-accent border-accent/20 group-hover:bg-accent/10 group-hover:border-accent/40"
                )}>
                  {i + 1}
                </span>
                {item.q}
              </h3>
              <ChevronDown className={cn(
                "w-5 h-5 text-muted transition-transform duration-300",
                isOpen && "rotate-180 text-accent"
              )} />
            </button>
            
            <div className={cn(
              "grid transition-all duration-300 ease-in-out",
              isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}>
              <div className="overflow-hidden">
                <div className="px-6 pb-6 pl-[3.5rem] text-secondary text-base md:text-lg leading-relaxed">
                  {item.a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
