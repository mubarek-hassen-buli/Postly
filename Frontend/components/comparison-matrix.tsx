"use client"

import React from "react"
import { Check, X, Sparkles } from "lucide-react"

const COMPARISON_ROWS = [
  {
    capability: "Multi-Platform Publishing",
    postly: "Publish to Telegram, LinkedIn & Instagram simultaneously",
    traditional: "Switching between 3+ separate apps and copy-pasting manually",
  },
  {
    capability: "Background Scheduling & Queues",
    postly: "Automated Celery + Redis background workers with drift recovery",
    traditional: "Manual phone reminders or unreliable local push triggers",
  },
  {
    capability: "Live WYSIWYG Mockup Previews",
    postly: "Interactive previews for Telegram bubbles, LinkedIn & Instagram",
    traditional: "Blind publishing with unpredictable layout & tag glitches",
  },
  {
    capability: "Telegram MTProto Integration",
    postly: "Direct client connection with native 2FA and admin permission sync",
    traditional: "Manual BotFather setup with strict 50 MB Bot API limits",
  },
  {
    capability: "LinkedIn OAuth 2.0 Integration",
    postly: "Official personal profile & organization company page publishing",
    traditional: "Manual web logins or fragile browser automations",
  },
  {
    capability: "Credential & Token Security",
    postly: "AES-256 Fernet encryption at rest & mobile Hardware Keystores",
    traditional: "Unencrypted plaintext API tokens stored in config files",
  },
]

export function ComparisonMatrix() {
  return (
    <section id="comparison" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-secondary/50 text-xs font-medium text-muted-foreground mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Workflow Comparison</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Why Use Postly for Multi-Channel Publishing
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Eliminate repetitive copy-pasting and token headaches. Manage your Telegram channels, LinkedIn pages, and Instagram feeds from one place.
          </p>
        </div>

        {/* Comparison Table Card */}
        <div className="bg-card/70 backdrop-blur-xl border border-border/80 rounded-3xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-secondary/30">
                  <th className="py-5 px-6 font-heading font-semibold text-sm text-foreground">
                    Capability
                  </th>
                  <th className="py-5 px-6 font-heading font-bold text-sm text-primary bg-primary/5 w-1/3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                      Postly Unified Platform
                    </div>
                  </th>
                  <th className="py-5 px-6 font-heading font-semibold text-sm text-muted-foreground w-1/3">
                    Manual Fragmented Publishing
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-4.5 px-6 font-medium text-foreground">
                      {row.capability}
                    </td>
                    <td className="py-4.5 px-6 bg-primary/5 font-medium text-foreground">
                      <div className="flex items-center gap-2 text-foreground">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{row.postly}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </div>
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
