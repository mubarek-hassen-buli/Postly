"use client"

import React from "react"
import { ShieldCheck, Lock, Smartphone, UserCheck, CheckCircle2, Sparkles } from "lucide-react"

const SECURITY_PILLARS = [
  {
    icon: Lock,
    title: "Encrypted Account Connections",
    description:
      "Your connected Telegram and social accounts are locked with strong encryption, so your private login details always stay completely hidden and protected.",
    badge: "Private & Encrypted",
  },
  {
    icon: Smartphone,
    title: "Protected on Your Phone",
    description:
      "Your login stays safely stored inside your phone's built-in security vault on iPhone and Android—protected by your device passcode, Face ID, or fingerprint.",
    badge: "Device Security",
  },
  {
    icon: UserCheck,
    title: "You Stay in Full Control",
    description:
      "Connect your accounts safely through official sign-in flows. You can view your connected channels or disconnect your account with a single tap at any time.",
    badge: "100% In Control",
  },
  {
    icon: Sparkles,
    title: "Safe & Reliable Publishing",
    description:
      "Every scheduled post is automatically checked before it goes out, making sure your messages are never sent twice or posted to the wrong channel.",
    badge: "No Duplicate Posts",
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
            <span>Your Privacy Comes First</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Your Accounts Are Safe With Us
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            We protect your connected accounts, private channels, and scheduled posts at every step—so you can broadcast with complete peace of mind.
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
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-secondary text-primary border border-border">
                      {pillar.badge}
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
                  <span>Always Active &amp; Protected</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
