"use client"

import React from "react"
import Link from "next/link"
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Code2,
  Clock,
  Radio,
  Share2,
  Zap,
  CheckCircle2,
  Pin,
  Send,
  Bell,
  Layers,
  Sparkle,
} from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Architectural Grid Lines & Markers */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex justify-center">
        <div className="w-full max-w-7xl h-full border-x border-border/40 relative">
          {/* Corner Markers */}
          <div className="absolute top-12 left-4 text-muted-foreground/30 font-mono text-xs">+</div>
          <div className="absolute top-12 right-4 text-muted-foreground/30 font-mono text-xs">+</div>
          <div className="absolute bottom-12 left-4 text-muted-foreground/30 font-mono text-xs">+</div>
          <div className="absolute bottom-12 right-4 text-muted-foreground/30 font-mono text-xs">+</div>

          {/* Subtle horizontal guideline */}
          <div className="absolute top-1/3 left-0 right-0 border-b border-border/20" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Centered Header Content */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-secondary/50 backdrop-blur-sm text-xs font-medium text-muted-foreground mb-6 shadow-2xs transition-all hover:border-primary/40">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>Multi-Platform Publishing · Currently in Active Development</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.15] mb-6">
            Create Once. Publish Everywhere.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl font-normal leading-relaxed mb-8">
            Postly helps you create, schedule, and publish content across Telegram, LinkedIn, and Instagram from one unified dashboard.
          </p>

          {/* Prominent CTA Pill Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="#sandbox"
              className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-foreground text-background font-semibold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-300 active:scale-95 ring-8 ring-foreground/5 cursor-pointer"
            >
              <span>Try Live Sandbox</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-secondary/60 border border-border text-foreground font-semibold text-sm uppercase tracking-wider hover:bg-secondary transition-all"
            >
              <span>Explore Features</span>
            </Link>
          </div>
        </div>

        {/* Hero Interactive Device Mockup & Connected Floating Badges */}
        <div className="relative mt-16 md:mt-24 max-w-5xl mx-auto">
          {/* Subtle Center Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Left Floating Badges with Connectors (Desktop) */}
          <div className="hidden lg:flex flex-col gap-12 absolute left-0 top-12 z-20 w-64">
            {/* Badge 1: Security & Protocol */}
            <div className="relative group">
              <div className="bg-card/90 backdrop-blur-md border border-border/80 shadow-md rounded-2xl p-3.5 flex items-center gap-3 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                    &quot;Direct MTProto & OAuth&quot;
                  </div>
                  <div className="text-[11px] text-muted-foreground">Encrypted Token Storage</div>
                </div>
              </div>
              {/* Connector Dotted Line */}
              <div className="absolute right-0 top-1/2 w-16 translate-x-full border-b border-dashed border-muted-foreground/40 pointer-events-none" />
            </div>

            {/* Badge 2: Development Status */}
            <div className="relative ml-8 group">
              <div className="bg-card/90 backdrop-blur-md border border-border/80 shadow-md rounded-2xl p-3.5 flex items-center gap-3 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">v1.0 Beta</div>
                  <div className="text-[11px] text-muted-foreground">In Active Development</div>
                </div>
              </div>
              {/* Connector Dotted Line */}
              <div className="absolute right-0 top-1/2 w-12 translate-x-full border-b border-dashed border-muted-foreground/40 pointer-events-none" />
            </div>

            {/* Badge 3: Celery Queue */}
            <div className="relative group">
              <div className="bg-card/90 backdrop-blur-md border border-border/80 shadow-md rounded-2xl p-3.5 flex items-center gap-3 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Celery + Redis</div>
                  <div className="text-[11px] text-muted-foreground">Automated Task Scheduler</div>
                </div>
              </div>
              {/* Connector Dotted Line */}
              <div className="absolute right-0 top-1/2 w-20 translate-x-full border-b border-dashed border-muted-foreground/40 pointer-events-none" />
            </div>
          </div>

          {/* Right Floating Badges with Connectors (Desktop) */}
          <div className="hidden lg:flex flex-col gap-12 absolute right-0 top-12 z-20 w-64 items-end">
            {/* Badge 4: Multi-Platform Sync */}
            <div className="relative group w-full">
              <div className="bg-card/90 backdrop-blur-md border border-border/80 shadow-md rounded-2xl p-3.5 flex items-center gap-3 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                    &quot;Multi-Network&quot;
                  </div>
                  <div className="text-[11px] text-muted-foreground">Telegram, LinkedIn, IG</div>
                </div>
              </div>
              {/* Connector Dotted Line */}
              <div className="absolute left-0 top-1/2 w-16 -translate-x-full border-b border-dashed border-muted-foreground/40 pointer-events-none" />
            </div>

            {/* Badge 5: Profiles & Pages */}
            <div className="relative mr-8 group w-[calc(100%-2rem)]">
              <div className="bg-card/90 backdrop-blur-md border border-border/80 shadow-md rounded-2xl p-3.5 flex items-center gap-3 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Profiles & Pages</div>
                  <div className="text-[11px] text-muted-foreground">Channels, Groups & Orgs</div>
                </div>
              </div>
              {/* Connector Dotted Line */}
              <div className="absolute left-0 top-1/2 w-12 -translate-x-full border-b border-dashed border-muted-foreground/40 pointer-events-none" />
            </div>

            {/* Badge 6: Live Preview */}
            <div className="relative group w-full">
              <div className="bg-card/90 backdrop-blur-md border border-border/80 shadow-md rounded-2xl p-3.5 flex items-center gap-3 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">WYSIWYG Preview</div>
                  <div className="text-[11px] text-muted-foreground">Live Cross-Network Mockup</div>
                </div>
              </div>
              {/* Connector Dotted Line */}
              <div className="absolute left-0 top-1/2 w-20 -translate-x-full border-b border-dashed border-muted-foreground/40 pointer-events-none" />
            </div>
          </div>

          {/* Central Photorealistic Smartphone Device Frame */}
          <div className="mx-auto w-[310px] sm:w-[340px] md:w-[360px] bg-slate-950 p-3 rounded-[48px] shadow-2xl ring-1 ring-white/10 relative">
            {/* Outer Bezel */}
            <div className="bg-[#0F172A] rounded-[40px] overflow-hidden border border-slate-800 text-slate-100 flex flex-col relative aspect-[9/18.5]">
              {/* Screen Top Status Bar & Dynamic Island */}
              <div className="pt-3 px-6 flex items-center justify-between z-30">
                <span className="text-[11px] font-semibold text-slate-300">9:41</span>
                {/* Dynamic Island */}
                <div className="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-inner">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-2 border border-slate-400 rounded-xs relative">
                    <div className="w-2 h-1 bg-slate-300 absolute top-0.5 left-0.5" />
                  </div>
                </div>
              </div>

              {/* Inside App Content */}
              <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
                {/* App Header */}
                <div>
                  <div className="flex items-center justify-between mt-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        PO
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Hi, Creator 👋</div>
                        <div className="text-[10px] text-slate-400">Unified Publishing Hub</div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 relative">
                      <Bell className="w-4 h-4" />
                      <div className="w-2 h-2 rounded-full bg-sky-400 absolute top-1.5 right-1.5" />
                    </div>
                  </div>

                  {/* Broadcast Overview Card */}
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 mb-3 shadow-xs">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1">
                      Connected Channels & Pages
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="text-lg font-bold text-white tracking-tight">3 Platforms</div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ● Synced
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-700/60 text-center">
                      <div>
                        <div className="text-[9px] text-slate-400">Telegram</div>
                        <div className="text-[11px] font-bold text-sky-400">Channels</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400">LinkedIn</div>
                        <div className="text-[11px] font-bold text-blue-400">Profiles</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400">Instagram</div>
                        <div className="text-[11px] font-bold text-pink-400">Feeds</div>
                      </div>
                    </div>
                  </div>

                  {/* Channel Destination Selector Pills */}
                  <div className="mb-2.5">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Selected Targets
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/20 border border-sky-500/30 text-[10px] font-medium text-sky-300">
                        <CheckCircle2 className="w-2.5 h-2.5 text-sky-400" /> Telegram
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-[10px] font-medium text-blue-300">
                        <CheckCircle2 className="w-2.5 h-2.5 text-blue-400" /> LinkedIn
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-pink-500/20 border border-pink-500/30 text-[10px] font-medium text-pink-300">
                        <CheckCircle2 className="w-2.5 h-2.5 text-pink-400" /> Instagram
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Message Bubble */}
                <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 rounded-2xl p-3 shadow-md">
                  {/* Pinned Bar */}
                  <div className="flex items-center gap-1.5 text-[10px] text-sky-400 font-semibold mb-1.5 pb-1 border-b border-slate-700/60">
                    <Pin className="w-3 h-3" />
                    <span>Cross-Platform Announcement</span>
                  </div>

                  {/* Message Body */}
                  <div className="text-xs text-slate-200 leading-relaxed font-sans">
                    <span className="font-bold text-white">🚀 Create once, publish everywhere!</span>
                    <p className="mt-0.5 text-[11px] text-slate-300">
                      Unified scheduling across Telegram, LinkedIn, and Instagram.
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 text-[9px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Ready to Dispatch
                    </span>
                    <span>12:45 PM UTC</span>
                  </div>
                </div>

                {/* Bottom Action Button in App */}
                <div className="mt-2.5">
                  <div className="w-full py-2 rounded-xl bg-foreground text-background font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md">
                    <Send className="w-3.5 h-3.5" /> Publish to All Targets
                  </div>
                </div>
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="pb-2 flex justify-center">
                <div className="w-28 h-1 bg-slate-600 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
