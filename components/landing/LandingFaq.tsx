"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDownIcon } from "lucide-react";

export function LandingFaq() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "What happens when the knowledge base does not cover a question?",
      a: "When no sufficiently relevant document passage is found, the conversation is routed to the operator inbox instead of generating an unsupported answer.",
    },
    {
      q: "Can visitors ask to speak to a person?",
      a: "Yes. Explicit requests for a human operator are marked as waiting and appear in the operator inbox.",
    },
    {
      q: "Where do visitor conversations appear?",
      a: "Conversations and their message history are available in the workspace operator inbox, where an operator can reply or close the conversation.",
    },
    {
      q: "What file formats are currently supported?",
      a: "The knowledge base accepts PDF, Markdown (.md), and plain-text (.txt) files.",
    },
    {
      q: "How do I install the chat widget?",
      a: "Open Widget settings in the dashboard, copy the generated script snippet, and add it to your website.",
    },
  ];

  return (
    <section className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 py-20 z-10">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <Badge
          variant="outline"
          className="px-3 py-1 rounded-full text-xs border-white/15 text-[#c4c2c3] bg-white/5"
        >
          Got Questions?
        </Badge>
        <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = expandedFaq === idx;
          return (
            <div
              key={idx}
              className="border border-white/10 rounded-xl bg-[#0c0c0e] overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setExpandedFaq(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
              >
                <span className="text-sm sm:text-base font-medium text-white">
                  {faq.q}
                </span>
                <ChevronDownIcon
                  className={`size-4 text-[#8e8e8e] shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
