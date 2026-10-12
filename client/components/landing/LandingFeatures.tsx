"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheckIcon,
  UsersIcon,
  FileTextIcon,
  SparklesIcon,
} from "lucide-react";

export function LandingFeatures() {
  return (
    <>
      {/* SECTION 2: ARCHITECTURE & VALUE PROPOSITION */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-20 z-10">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <Badge
            variant="outline"
            className="px-3 py-1 rounded-full text-xs border-white/15 text-[#c4c2c3] bg-white/5"
          >
            Built for Support Teams
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
            Engineered for Grounded Accuracy
          </h2>
          <p className="max-w-2xl text-muted-foreground text-sm sm:text-base leading-relaxed">
            Keep visitor questions, workspace documents, and operator replies in one support workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheckIcon,
              title: "Knowledge-grounded replies",
              description:
                "Retrieve relevant passages from workspace documents and include source names with supported answers.",
            },
            {
              icon: UsersIcon,
              title: "Human handoff",
              description:
                "Route explicit requests for a person and low-relevance questions to the operator inbox with conversation context.",
            },
            {
              icon: FileTextIcon,
              title: "PDF, Markdown, and text",
              description:
                "Upload supported documents to build a workspace knowledge base used by the assistant.",
            },
            {
              icon: SparklesIcon,
              title: "Embeddable chat widget",
              description:
                "Customize the assistant and install the widget on your site using the generated script snippet.",
            },
          ].map((feature, i) => (
            <Card
              key={i}
              className="bg-[#0e0e11] border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 rounded-2xl p-6"
            >
              <CardContent className="p-0 space-y-3">
                <div className="size-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-white">
                  <feature.icon className="size-5 text-white/90" />
                </div>
                <h3 className="text-base font-semibold text-white font-display">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS (3-STEP ONBOARDING) */}
      <section
        id="workflow-section"
        className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-20 z-10"
      >
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <Badge
            variant="outline"
            className="px-3 py-1 rounded-full text-xs border-white/15 text-[#c4c2c3] bg-white/5"
          >
            Simple 3-Step Setup
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-white">
            From documents to live support
          </h2>
          <p className="max-w-xl text-muted-foreground text-sm sm:text-base">
            No machine learning experience or complex vector DB setup required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {[
            {
              step: "01",
              title: "Upload Knowledge Base",
              desc: "Upload a PDF, Markdown, or plain-text support document to the workspace knowledge base.",
            },
            {
              step: "02",
              title: "Configure Agent Guardrails",
              desc: "Set the assistant name, greeting, accent color, widget position, and allowed domains.",
            },
            {
              step: "03",
              title: "Drop Script & Go Live",
              desc: "Copy the workspace script snippet and add it to your site to receive visitor conversations.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-[#0c0c0e] border border-white/10 flex flex-col justify-between space-y-4 overflow-hidden"
            >
              <div className="text-3xl font-bold font-display text-white/20">
                {item.step}
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
