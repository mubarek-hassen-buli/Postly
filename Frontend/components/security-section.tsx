"use client"

import React from "react"
import { ShieldCheck, Lock, Key, Server, Database, CheckCircle2 } from "lucide-react"

const SECURITY_PILLARS = [
  {
    icon: Lock,
    title: "AES-256 Fernet Session Encryption",
    description:
      "Telegram MTProto session strings and stored platform credentials are encrypted at rest using AES-256 in CBC mode with HMAC-SHA256 signatures before database persistence.",
    tech: "Fernet Crypto Engine",
  },
  {
    icon: Key,
    title: "Hardware-Backed Device Keystores",
    description:
      "Authentication tokens on iOS and Android devices are stored exclusively in hardware-isolated iOS Keychain and Android Keystore via Expo SecureStore.",
    tech: "iOS Keychain / Keystore",
  },
  {
    icon: Server,
    title: "OAuth 2.0 & Knox Token Authentication",
    description:
      "Official OAuth 2.0 flows for LinkedIn and Instagram with cryptographically signed Knox session tokens ensuring all API routes require strict authentication.",
    tech: "OAuth 2.0 & DRF Knox",
  },
  {
    icon: Database,
    title: "Optimistic Concurrency & Safe Workers",
    description:
      "Atomic database row locking and Celery worker synchronization prevent race conditions, duplicate dispatches, or stale post updates.",
    tech: "PostgreSQL Concurrency",
  },
]

export function SecuritySection() {
  return (
    <section id="security" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-secondary/50 text-xs font-medium text-muted-foreground mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Privacy-First Architecture</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Built with Strict Security Standards
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Your connected social credentials, OAuth tokens, and publishing queues are protected with end-to-end encryption standards.
          </p>
        </div>

        {/* Security Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SECURITY_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <div
                key={idx}
                className="bg-card/70 backdrop-blur-xl border border-border/80 rounded-3xl p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-secondary text-primary border border-border">
                      {pillar.tech}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-bold text-foreground mb-3 tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-border/60 flex items-center text-xs font-medium text-emerald-500">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  <span>Enforced Across All Services</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
