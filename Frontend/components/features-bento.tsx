"use client"

import React from "react"
import Image from "next/image"
import {
  Sparkles,
  Send,
  BarChart3,
  Search,
  Check,
  MousePointer2,
} from "lucide-react"

export function FeaturesBento() {
  return (
    <section id="features" className="py-24 md:py-32 relative overflow-hidden isolate">
      {/* Bento Grid Section Texture Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <Image
          src="/images/Gemini_Generated_Image_souoy4souoy4souo.jpg"
          alt="Bento Grid Texture Background"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Soft Ambient Blend Overlay */}
        <div className="absolute inset-0 bg-white/45 dark:bg-black/65 backdrop-blur-[0.5px]" />
        {/* Top & Bottom Seamless Transition Gradients */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-background to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3 text-center">
            Features designed
            <br className="hidden sm:inline" /> for your success.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base font-normal max-w-lg mx-auto text-center leading-relaxed">
            Explore the modern toolset designed to keep your audience engaged and your broadcasts on schedule.
          </p>
        </div>

        {/* 5-Card Bento Grid: 3 on Top Row, 2 on Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {/* ============================================================ */}
          {/* CARD 1: Rich Text Editor / Message Formatting (Top-Left)    */}
          {/* ============================================================ */}
          <div className="md:col-span-2 group relative rounded-[28px] sm:rounded-[32px] overflow-hidden p-6 sm:p-7 flex flex-col justify-between border border-white/70 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 min-h-[380px] sm:min-h-[420px] isolate">
            {/* Top Visual: Interactive Text Editor Mockup */}
            <div className="w-full flex-1 flex items-center justify-center py-4 relative z-10">
              <div className="w-full max-w-[270px] bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-[0_10px_28px_rgba(0,0,0,0.08)] border border-slate-200/80 dark:border-zinc-800 space-y-2.5 relative transition-transform duration-300 group-hover:scale-[1.02]">
                {/* Editor Header Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md text-[10px]">
                    <Sparkles className="w-3 h-3" />
                    Generate
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="font-bold">B</span>
                    <span className="italic">I</span>
                    <span className="underline">U</span>
                    <span className="line-through">S</span>
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="text-[11px] space-y-1.5 text-foreground/90 font-sans leading-relaxed">
                  <div className="font-semibold text-foreground">Dear subscribers,</div>
                  <div className="text-[10px] text-muted-foreground">
                    We are pleased to broadcast the weekly release:{" "}
                    <span className="bg-sky-500/25 text-sky-800 dark:text-sky-200 font-semibold px-1 py-0.5 rounded">
                      +25% increase in reach
                    </span>{" "}
                    and zero delivery latency.
                  </div>
                </div>

                {/* Floating Formatting Pill Tooltip */}
                <div className="absolute -bottom-2.5 left-4 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg px-2.5 py-1 text-[10px] font-mono shadow-xl flex items-center gap-2 border border-zinc-700 dark:border-zinc-300 z-20">
                  <span className="font-bold">B</span>
                  <span className="italic">I</span>
                  <span className="underline">U</span>
                  <span className="text-[9px] uppercase font-bold text-sky-400">Link</span>
                  <MousePointer2 className="w-3 h-3 fill-sky-400 text-sky-400 -translate-y-0.5" />
                </div>
              </div>
            </div>

            {/* Bottom Text Stack */}
            <div className="mt-4 text-left relative z-10">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground mb-1">
                Rich Message Formatting
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Compose bold announcements with markdown, spoilers, inline links, and native formatting in an instant.
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CARD 2: Centralized Channel Hub (Top-Center)                 */}
          {/* ============================================================ */}
          <div className="md:col-span-2 group relative rounded-[28px] sm:rounded-[32px] overflow-hidden p-6 sm:p-7 flex flex-col justify-between border border-white/70 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 min-h-[380px] sm:min-h-[420px] isolate">
            {/* Top Visual: Cloud Hub with 3 Destination Badges */}
            <div className="w-full flex-1 flex items-center justify-center py-4 relative z-10">
              <div className="relative transition-transform duration-300 group-hover:scale-105">
                {/* Cloud Silhouette Card */}
                <div className="bg-white/95 dark:bg-zinc-900/95 rounded-[36px] px-6 py-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-200/80 dark:border-zinc-800 flex items-center gap-3.5 relative">
                  {/* Icon 1: Analytics / Chart */}
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                    <BarChart3 className="w-5 h-5" />
                  </div>

                  {/* Icon 2: Center Postly Sparkle */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 ring-4 ring-sky-500/10">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>

                  {/* Icon 3: Telegram Plane */}
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                    <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
                  </div>
                </div>

                {/* Subtle Floating Ambient Dot */}
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-sky-500 animate-ping opacity-75" />
              </div>
            </div>

            {/* Bottom Text Stack */}
            <div className="mt-4 text-left relative z-10">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground mb-1">
                Centralized Channel Hub
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                A single command center that unifies your entire network of Telegram channels, public groups, and VIP bases.
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CARD 3: Direct MTProto Protocol / Puzzle (Top-Right)         */}
          {/* ============================================================ */}
          <div className="md:col-span-2 group relative rounded-[28px] sm:rounded-[32px] overflow-hidden p-6 sm:p-7 flex flex-col justify-between border border-white/70 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 min-h-[380px] sm:min-h-[420px] isolate">
            {/* Top Visual: Puzzle Grid with Floating Blue Puzzle Piece */}
            <div className="w-full flex-1 flex items-center justify-center py-4 relative z-10">
              <div className="relative w-44 h-32 flex items-center justify-center">
                {/* Background Puzzle Grid Lines */}
                <svg
                  className="w-full h-full text-slate-300 dark:text-zinc-700 opacity-60"
                  viewBox="0 0 160 120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                >
                  <path d="M 10 10 H 150 V 110 H 10 Z" />
                  <path d="M 60 10 V 110" />
                  <path d="M 110 10 V 110" />
                  <path d="M 10 60 H 150" />
                </svg>

                {/* Floating 3D Blue Puzzle Piece Snapping In */}
                <div className="absolute transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-tr from-sky-600 via-sky-500 to-blue-500 rounded-2xl shadow-xl shadow-sky-500/35 border-2 border-white/40 flex items-center justify-center text-white relative">
                    <div className="absolute -top-2 w-4 h-4 bg-sky-500 rounded-full border border-white/30" />
                    <div className="absolute -right-2 w-4 h-4 bg-sky-500 rounded-full border border-white/30" />
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Text Stack */}
            <div className="mt-4 text-left relative z-10">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground mb-1">
                Zero-Bot MTProto Protocol
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Connect directly with native user sessions, seamlessly fitting into Telegram with zero bot restrictions.
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CARD 4: Automated Queue Diagnostics (Bottom-Left, Wide)     */}
          {/* ============================================================ */}
          <div className="md:col-span-3 group relative rounded-[28px] sm:rounded-[32px] overflow-hidden p-6 sm:p-8 flex flex-col justify-between border border-white/70 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 min-h-[380px] sm:min-h-[420px] isolate">
            {/* Top Visual: Document with Concentric Radar Waves & Magnifier */}
            <div className="w-full flex-1 flex items-center justify-center py-4 relative z-10">
              <div className="relative flex items-center justify-center">
                {/* Concentric Radar Circles */}
                <div className="absolute w-52 h-52 rounded-full border border-sky-400/20 animate-pulse pointer-events-none" />
                <div className="absolute w-40 h-40 rounded-full border border-sky-400/30 pointer-events-none" />
                <div className="absolute w-28 h-28 rounded-full border border-sky-400/40 pointer-events-none" />

                {/* White Inspected Document Card */}
                <div className="relative w-44 bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800">
                    <span className="w-8 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="space-y-1.5 pt-0.5">
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full" />
                    <div className="w-4/5 h-1.5 bg-sky-500/80 rounded-full" />
                    <div className="w-3/4 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full" />
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                    <span>14:00 UTC</span>
                    <span className="text-emerald-600 font-semibold">Verified</span>
                  </div>
                </div>

                {/* Floating Magnifying Glass */}
                <div className="absolute -bottom-2 -left-2 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border-2 border-slate-300 dark:border-zinc-600 shadow-xl flex items-center justify-center text-sky-600 dark:text-sky-400 relative">
                    <Search className="w-6 h-6" />
                    <div className="absolute inset-1 rounded-full bg-sky-500/10 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Text Stack */}
            <div className="mt-4 text-left relative z-10">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground mb-1">
                Automated Queue Diagnostics
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed max-w-md">
                Celery Beat workers monitor your queue down to the millisecond, automatically highlighting anomalies and ensuring verified delivery.
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CARD 5: Instant Message Dispatch Envelope (Bottom-Right, Wide) */}
          {/* ============================================================ */}
          <div className="md:col-span-3 group relative rounded-[28px] sm:rounded-[32px] overflow-hidden p-6 sm:p-8 flex flex-col justify-between border border-white/70 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 min-h-[380px] sm:min-h-[420px] isolate">
            {/* Top Visual: Modern Envelope with Letter & Red Wax Seal */}
            <div className="w-full flex-1 flex items-center justify-center py-4 relative z-10">
              <div className="relative w-56 h-36 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]">
                {/* Emerging Letter Card */}
                <div className="absolute -top-3 w-40 bg-white dark:bg-zinc-800 rounded-xl p-3 shadow-lg border border-slate-200/90 dark:border-zinc-700 space-y-1.5 transition-transform duration-300 group-hover:-translate-y-2">
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-600 rounded-full" />
                  <div className="w-5/6 h-1.5 bg-slate-200 dark:bg-zinc-600 rounded-full" />
                  <div className="flex gap-1 pt-1">
                    <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400">
                      VIP: 14.2k
                    </span>
                    <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      Sent
                    </span>
                  </div>
                </div>

                {/* Envelope Body */}
                <div className="w-52 h-28 bg-gradient-to-b from-slate-100 to-white dark:from-zinc-800 dark:to-zinc-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-zinc-700 relative overflow-hidden flex items-center justify-center">
                  <svg
                    className="absolute inset-0 w-full h-full text-slate-300 dark:text-zinc-700"
                    viewBox="0 0 208 112"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M 0 0 L 104 60 L 208 0" />
                  </svg>

                  {/* Embossed Red Wax Seal */}
                  <div className="relative z-10 w-9 h-9 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 shadow-lg shadow-rose-900/40 border border-rose-300/40 flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110">
                    <Send className="w-4 h-4 -translate-x-0.5 translate-y-0.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Text Stack */}
            <div className="mt-4 text-left relative z-10">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground mb-1">
                Instant Multi-Channel Dispatch
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed max-w-md">
                Broadcast tailored messages simultaneously across dozens of channels with zero latency, verified delivery, and guaranteed receipt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
