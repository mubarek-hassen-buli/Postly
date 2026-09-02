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
  Share2,
  Layers,
  Sparkles,
} from "lucide-react"

const FEATURES = [
  {
    icon: Radio,
    title: "Telegram MTProto Broadcasting",
    description:
      "Direct Telegram client connection with 2FA support. Auto-detects admin rights across broadcast channels and supergroups without bot intermediaries.",
    badge: "Telegram MTProto",
  },
  {
    icon: Share2,
    title: "LinkedIn Profiles & Company Pages",
    description:
      "Official LinkedIn OAuth 2.0 authorization. Schedule rich articles, updates, and media directly to personal profiles and organization company pages.",
    badge: "LinkedIn OAuth 2.0",
  },
  {
    icon: Images,
    title: "Instagram Media Scheduling",
    description:
      "Publish high-quality visual content, single images, video updates, and carousels directly to your connected Instagram creator and business accounts.",
    badge: "Instagram Graph API",
  },
  {
    icon: CalendarClock,
    title: "Celery + Redis Task Scheduler",
    description:
      "Background worker queues ensure scheduled posts broadcast at the exact target UTC timestamp with built-in periodic drift reconciliation.",
    badge: "Automated Queue",
  },
  {
    icon: FileCode2,
    title: "WYSIWYG Multi-Platform Preview",
    description:
      "Live preview simulator renders the exact visual appearance of Telegram chat bubbles, LinkedIn post cards, and Instagram captions before dispatch.",
    badge: "Live Simulator",
  },
  {
    icon: Layers,
    title: "Unified Media & Cloud Storage",
    description:
      "Attach photos, graphics, and video media to your posts with automated Cloudinary cloud storage optimization and cross-platform formatting.",
    badge: "Media Pipeline",
  },
]

export function FeaturesBento() {
  return (
    <section id="features" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-secondary/50 text-xs font-medium text-muted-foreground mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Multi-Channel Architecture</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Built for Modern Multi-Platform Publishing
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Everything you need to orchestrate high-impact announcements, manage cross-network destinations, and automate scheduled broadcasting.
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

                {/* Bottom status bar */}
                <div className="mt-8 pt-4 border-t border-border/60 flex items-center text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                  <span>Integrated API Workflow</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
