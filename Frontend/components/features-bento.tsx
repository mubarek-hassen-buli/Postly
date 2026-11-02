"use client"

import React from "react"
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  Radio,
  Check,
} from "lucide-react"

export function FeaturesBento() {
  return (
    <section id="features" className="py-20 md:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header Matching Inspiration Exactly */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3 text-center">
            Features designed
            <br className="hidden sm:inline" /> for your success.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base font-normal max-w-lg mx-auto text-center leading-relaxed">
            Explore the modern toolset designed to keep your audience engaged and your broadcasts on schedule.
          </p>
        </div>

        {/* 2x2 Feature Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* CARD 1: Task / Channel Management (Top-Left) */}
          <div className="group relative bg-[#F8FAFC] dark:bg-card/70 border border-[#E2E8F0] dark:border-border/60 rounded-[32px] sm:rounded-[36px] p-6 sm:p-10 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-xl transition-all duration-300 min-h-[460px] sm:min-h-[500px]">
            {/* Top Preview Graphic */}
            <div className="w-full flex-1 flex items-center justify-center py-6 sm:py-8 relative">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-[0_12px_32px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-zinc-800 max-w-sm w-full text-left space-y-3 transition-transform duration-300 group-hover:scale-[1.02]">
                {/* Status Row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Channel</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[11px] font-mono text-muted-foreground">
                    14:00 UTC
                  </span>
                </div>

                {/* Main Task Item */}
                <div className="flex items-start gap-3 pt-1">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-sm text-foreground">
                      Weekly Market Insights & VIP Signals
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Telegram Broadcast · 14,250 subscribers
                    </p>
                  </div>
                </div>

                {/* Priority & Tags */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    • High Priority
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    Multi-Channel
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Text Stack */}
            <div className="mt-4">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-2">
                Channel Management
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                Stay on top of everything, from multi-group broadcasts to targeted VIP channel announcements.
              </p>
            </div>
          </div>

          {/* CARD 2: Precision Queue Scheduling (Top-Right) */}
          <div className="group relative bg-[#F8FAFC] dark:bg-card/70 border border-[#E2E8F0] dark:border-border/60 rounded-[32px] sm:rounded-[36px] p-6 sm:p-10 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-xl transition-all duration-300 min-h-[460px] sm:min-h-[500px]">
            {/* Top Preview Graphic: Mini Phone with Overlapping Timer Pill */}
            <div className="w-full flex-1 flex items-center justify-center py-6 sm:py-8 relative">
              <div className="relative">
                {/* Mini Smartphone Frame */}
                <div className="w-52 sm:w-56 h-60 sm:h-64 bg-white dark:bg-zinc-900 rounded-[28px] border-4 border-slate-200 dark:border-zinc-800 p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.06)] relative overflow-hidden flex flex-col justify-between transition-transform duration-300 group-hover:scale-[1.02]">
                  {/* Dynamic Island */}
                  <div className="w-14 h-3 bg-black rounded-full mx-auto mb-2 shrink-0" />

                  {/* Screen Content */}
                  <div className="space-y-3">
                    <div className="text-left">
                      <div className="text-[10px] text-muted-foreground">Good morning,</div>
                      <div className="text-xs font-bold text-foreground">Alex Turner 👋</div>
                    </div>

                    {/* Stats Mini Grid */}
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-50 dark:bg-zinc-800/60 p-2 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <div className="text-center">
                        <div className="text-[11px] font-bold text-foreground">10</div>
                        <div className="text-[8px] text-muted-foreground uppercase">Active</div>
                      </div>
                      <div className="text-center border-x border-slate-200 dark:border-zinc-700">
                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">148</div>
                        <div className="text-[8px] text-muted-foreground uppercase">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[11px] font-bold text-sky-600 dark:text-sky-400">4</div>
                        <div className="text-[8px] text-muted-foreground uppercase">Queued</div>
                      </div>
                    </div>

                    {/* Mini Task Item in Phone */}
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/40 text-left border border-slate-100 dark:border-zinc-800/80">
                      <div className="text-[10px] font-semibold text-foreground truncate">
                        Crypto Alpha Daily Summary
                      </div>
                      <div className="text-[9px] text-muted-foreground">
                        Dispatches in 04m 12s
                      </div>
                    </div>
                  </div>

                  <div className="w-16 h-1 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto shrink-0 mt-2" />
                </div>

                {/* Overlapping Floating Time Badge (Matching Inspiration Photo Exactly) */}
                <div className="absolute top-4 -right-3 sm:-right-5 bg-white dark:bg-zinc-800 rounded-xl px-3 py-2 shadow-2xl border border-slate-100 dark:border-zinc-700 flex items-center gap-2.5 z-10 transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[9px] text-muted-foreground uppercase font-semibold">
                      Active Queue
                    </div>
                    <div className="text-xs font-mono font-bold text-foreground">
                      12:09:07
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Text Stack */}
            <div className="mt-4">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-2">
                Precision Queue Scheduling
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                Understand where your time goes and maximize reach with Celery and Redis automated background workers.
              </p>
            </div>
          </div>

          {/* CARD 3: Zero-Bot MTProto Architecture (Bottom-Left) */}
          <div className="group relative bg-[#F8FAFC] dark:bg-card/70 border border-[#E2E8F0] dark:border-border/60 rounded-[32px] sm:rounded-[36px] p-6 sm:p-10 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-xl transition-all duration-300 min-h-[460px] sm:min-h-[500px]">
            {/* Top Preview Graphic: Mini Phone with Overlapping Security Badge */}
            <div className="w-full flex-1 flex items-center justify-center py-6 sm:py-8 relative">
              <div className="relative">
                {/* Mini Smartphone Frame */}
                <div className="w-52 sm:w-56 h-60 sm:h-64 bg-white dark:bg-zinc-900 rounded-[28px] border-4 border-slate-200 dark:border-zinc-800 p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.06)] relative overflow-hidden flex flex-col justify-between transition-transform duration-300 group-hover:scale-[1.02]">
                  {/* Dynamic Island */}
                  <div className="w-14 h-3 bg-black rounded-full mx-auto mb-2 shrink-0" />

                  {/* Screen Content */}
                  <div className="space-y-3">
                    <div className="text-left">
                      <div className="text-[10px] text-muted-foreground">Session Protocol</div>
                      <div className="text-xs font-bold text-foreground flex items-center gap-1">
                        <Send className="w-3 h-3 text-sky-500" />
                        Telegram MTProto
                      </div>
                    </div>

                    {/* Direct Client Box */}
                    <div className="bg-sky-500/10 border border-sky-500/20 p-2.5 rounded-xl text-left space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                        <Radio className="w-3 h-3 animate-pulse" />
                        Client Session Connected
                      </div>
                      <div className="text-[9px] text-muted-foreground">
                        Native TCP · 2FA Authorized
                      </div>
                    </div>

                    {/* Security Badge */}
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/40 text-left border border-slate-100 dark:border-zinc-800/80">
                      <div className="text-[10px] font-semibold text-foreground">
                        AES-256 Fernet Storage
                      </div>
                      <div className="text-[9px] text-muted-foreground">
                        Zero Bot Rate Limiting
                      </div>
                    </div>
                  </div>

                  <div className="w-16 h-1 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto shrink-0 mt-2" />
                </div>

                {/* Overlapping Floating Shield Badge */}
                <div className="absolute top-4 -right-3 sm:-right-5 bg-white dark:bg-zinc-800 rounded-xl px-3 py-2 shadow-2xl border border-slate-100 dark:border-zinc-700 flex items-center gap-2.5 z-10 transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[9px] text-muted-foreground uppercase font-semibold">
                      Security
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      Zero Bot Limits
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Text Stack */}
            <div className="mt-4">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-2">
                Zero-Bot MTProto Engine
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                Connect directly to Telegram via native user sessions, bypassing third-party bot rate limits and forwarding restrictions.
              </p>
            </div>
          </div>

          {/* CARD 4: Live Broadcast Analytics (Bottom-Right) */}
          <div className="group relative bg-[#F8FAFC] dark:bg-card/70 border border-[#E2E8F0] dark:border-border/60 rounded-[32px] sm:rounded-[36px] p-6 sm:p-10 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-xl transition-all duration-300 min-h-[460px] sm:min-h-[500px]">
            {/* Top Preview Graphic: Analytics Card with Progress */}
            <div className="w-full flex-1 flex items-center justify-center py-6 sm:py-8 relative">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-[0_12px_32px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-zinc-800 max-w-sm w-full text-left space-y-3.5 transition-transform duration-300 group-hover:scale-[1.02]">
                {/* Metric Header */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Broadcast Reach</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                    <TrendingUp className="w-3 h-3" />
                    +18.4%
                  </span>
                </div>

                {/* Big Number */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-heading font-bold text-foreground tracking-tight">
                    248.5K
                  </span>
                  <span className="text-xs text-muted-foreground">subscribers reached</span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                    <span>100% Deliverability Rate</span>
                    <span className="text-foreground font-semibold">148/148</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full w-full" />
                  </div>
                </div>

                {/* Channel Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-muted-foreground">
                    VIP: 14.2k
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-muted-foreground">
                    Alpha: 8.9k
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-muted-foreground">
                    News: 22.1k
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Text Stack */}
            <div className="mt-4">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-2">
                Live Broadcast Analytics
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                Monitor subscriber reach, view velocity, and delivery confirmation across all your connected channels in real time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
