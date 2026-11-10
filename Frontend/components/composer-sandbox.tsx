"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeftRight,
  Smartphone,
  Headphones,
  FileSpreadsheet,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react"

const FEATURES = [
  {
    icon: ArrowLeftRight,
    title: "Flexible Data Transfer",
    description:
      "Instantaneous, bi-directional synchronization between Telegram MTProto sessions and centralized scheduling queues.",
  },
  {
    icon: Smartphone,
    title: "Personalized Reports",
    description:
      "Create and customize reports tailored to your specific broadcasting needs, channel reach, and engagement metrics.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description:
      "24/7 priority developer support with real-time incident response, session troubleshooting, and migration assistance.",
  },
  {
    icon: FileSpreadsheet,
    title: "Custom Reporting Tools",
    description:
      "Export deep analytics on subscriber growth, post delivery velocity, and forwarding performance in CSV, JSON, or PDF formats.",
  },
  {
    icon: Layers,
    title: "Seamless Integration",
    description:
      "Direct MTProto socket connection without bot limitations, third-party middleware, or external rate caps.",
  },
]

export function ComposerSandbox() {
  // Default to index 1 ("Personalized Reports") to match inspiration photo exactly
  const [activeIdx, setActiveIdx] = useState(1)

  return (
    <section id="sandbox" className="py-20 md:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Row: Headline on Left, Action Pill on Right */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-foreground leading-[1.12]">
              Scale Your Broadcasts
              <br />
              <span className="text-primary">with Postly</span>
            </h2>
          </div>

          <a
            href="/api/download"
            download="Postly.apk"
            className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:opacity-95 transition-all duration-200 active:scale-95 shrink-0 self-start md:self-auto cursor-pointer"
          >
            Download the App
          </a>
        </div>

        {/* Main 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Interactive Feature Selector (5 items) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon
              const isActive = activeIdx === idx

              if (isActive) {
                // Active Expanded Card (Matching Inspiration Exact Shape)
                return (
                  <div
                    key={idx}
                    className="bg-slate-50/95 dark:bg-card/80 border border-slate-200/90 dark:border-border/70 rounded-2xl p-5 shadow-xs transition-all duration-300 animate-in fade-in"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-heading font-bold text-base text-foreground tracking-tight">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed pl-11">
                      {feature.description}
                    </p>
                  </div>
                )
              }

              // Inactive Minimal Row Item
              return (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className="w-full flex items-center gap-3.5 px-4 py-3 text-left rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                >
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <span className="text-sm font-semibold tracking-tight">
                    {feature.title}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right Column: Single Showcase Box with section-3.png */}
          <div className="lg:col-span-7">
            <div className="rounded-[32px] sm:rounded-[40px] bg-slate-50/70 dark:bg-white border border-slate-200/80 dark:border-border/60 p-4 sm:p-6 relative overflow-hidden shadow-sm flex items-center justify-center min-h-[420px] sm:min-h-[480px]">
              {/* Subtle Architectural Grid Lines */}
              <div
                className="absolute inset-0 pointer-events-none opacity-45"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #8080801a 1px, transparent 1px), linear-gradient(to bottom, #8080801a 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
              />

              {/* Showcase Image (section-3.png) directly inside the single box */}
              <div className="relative z-10 w-full max-w-[560px] transition-transform duration-500 hover:scale-[1.01]">
                <Image
                  src="/images/section-3.png"
                  alt="Postly Analytics Showcase"
                  width={1200}
                  height={800}
                  priority
                  className="w-full h-auto object-contain mix-blend-multiply"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
