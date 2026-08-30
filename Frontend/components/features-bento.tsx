"use client"

import React from "react"
import {
  KeyRound,
  Radio,
  FileCode2,
  CalendarClock,
  Images,
  Activity,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react"

const FEATURES = [
  {
    icon: KeyRound,
    title: "Direct MTProto Client Sign-In",
    description:
      "Authenticate directly using your Telegram phone number with 2FA Cloud password support. No bot creation, token management, or third-party intermediaries required.",
    badge: "Native Protocol",
    gradient: "from-blue-500/10 to-indigo-500/10",
  },
  {
    icon: Radio,
    title: "Instant Multi-Channel Discovery",
    description:
      "Postly introspects your Telegram dialogs to automatically discover and verify administrative and posting rights across broadcast channels and supergroups.",
    badge: "Auto-Sync",
    gradient: "from-sky-500/10 to-cyan-500/10",
  },
  {
    icon: FileCode2,
    title: "Rich Formatting & Live Preview",
    description:
      "Compose rich announcements with HTML and Markdown modes. Apply spoilers, code blocks, bold, italics, hyperlinks, and pinned headers with real-time Telegram preview.",
    badge: "WYSIWYG Mockup",
    gradient: "from-purple-500/10 to-pink-500/10",
  },
  {
    icon: CalendarClock,
    title: "Resilient Celery + Redis Scheduling",
    description:
      "Schedule campaigns with atomic optimistic concurrency control. Built-in periodic beat reconciliation recovers any overdue posts if servers restart.",
    badge: "Zero-Drift",
    gradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    icon: Images,
    title: "Multi-Media Photo & Video Albums",
    description:
      "Attach up to 10 photos and videos with automatic album grouping, Cloudinary cloud storage optimization, and customized caption formatting.",
    badge: "10x Media Uploads",
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    icon: Activity,
    title: "Per-Channel Activity & Delivery Logs",
    description:
      "Isolated channel dispatch ensures a single failed channel never blocks the rest. Track Telegram message IDs, timestamp receipts, and live status updates.",
    badge: "Fault-Tolerant",
    gradient: "from-rose-500/10 to-red-500/10",
  },
]

export function FeaturesBento() {
  return (
    <section id="features" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-secondary/50 text-xs font-medium text-muted-foreground mb-4">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span>Built for Power Admins & Communities</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Engineered for Flawless Telegram Broadcasting
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Everything you need to orchestrate high-impact Telegram announcements, manage unlimited channels, and automate your workflow.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="group relative bg-card/70 backdrop-blur-md border border-border/80 rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/40 flex flex-col justify-between"
              >
                <div>
                  {/* Top Icon & Badge Row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-heading text-xl font-bold text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom subtle bar indicator */}
                <div className="mt-8 pt-4 border-t border-border/60 flex items-center text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                  <span>Production Ready</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
