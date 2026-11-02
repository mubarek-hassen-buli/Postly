"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Sparkles, Sun, Moon } from "lucide-react"

export function HeroSection() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative w-[95%] max-w-[1720px] mx-auto pt-3 sm:pt-5 pb-16">
      {/* Outer Framed Hero Card - 95% Width & Taller Height */}
      <div
        className="relative w-full min-h-[880px] sm:min-h-[960px] md:min-h-[1020px] rounded-[32px] sm:rounded-[44px] overflow-hidden border border-white/20 shadow-2xl flex flex-col justify-between transition-all"
        style={{
          background: "linear-gradient(180deg, #259DF8 0%, #38BDF8 38%, #60A5FA 72%, #3B82F6 100%)",
        }}
      >
        {/* Soft Radial Ambient Lighting Core */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.12) 42%, transparent 72%)",
          }}
        />

        {/* Top Header Row Inside Hero Card */}
        <div className="relative z-20 flex items-center justify-between px-6 sm:px-12 pt-7 sm:pt-9 w-full">
          {/* Logo Mark + Brand (Using Official App Icon) */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-sm transition-transform group-hover:scale-105 shrink-0 bg-white/10 backdrop-blur-md border border-white/20 p-0.5">
              <Image
                src="/images/postly.png"
                alt="Postly Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain rounded-lg"
                priority
              />
            </div>
            <span className="font-heading font-bold text-lg sm:text-xl text-white tracking-tight">
              Postly
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-white/90">
            <Link href="#features" className="hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#sandbox" className="hover:text-white transition-colors">
              Live Sandbox
            </Link>
            <Link href="#comparison" className="hover:text-white transition-colors">
              Why Postly
            </Link>
            <Link href="#security" className="hover:text-white transition-colors">
              Security
            </Link>
            <Link href="#faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Right Action Capsule */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )
              ) : (
                <span className="w-3.5 h-3.5 block" />
              )}
            </button>
            <Link
              href="#sandbox"
              className="px-5 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-sm active:scale-95"
            >
              Launch App
            </Link>
          </div>
        </div>

        {/* Hero Content Stack with Generous Vertical Space */}
        <div className="relative z-10 px-4 pt-12 sm:pt-18 md:pt-20 text-center max-w-4xl mx-auto flex flex-col items-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-semibold tracking-widest uppercase mb-6 shadow-xs">
            <Sparkles className="w-3 h-3 text-white/90" />
            <span>Next-Gen Telegram Engine</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.05] mb-6 text-center">
            Broadcast
            <br />
            without limits
          </h1>

          {/* Subtitle */}
          <p className="text-white/90 text-xs sm:text-sm md:text-base font-normal max-w-md mx-auto text-center leading-relaxed mb-12 sm:mb-16">
            Schedule, broadcast, and scale your Telegram channels with automated queues and zero bot limits.
          </p>

          {/* Centerpiece Phone Mockup Image (Transparent Background Version) */}
          <div className="relative w-full max-w-[340px] sm:max-w-[380px] md:max-w-[430px] mx-auto flex flex-col items-center">
            <div className="relative z-10 transition-transform duration-500 hover:scale-[1.01]">
              <Image
                src="/images/posttly-mockup-removebg-preview.png"
                alt="Postly Telegram Broadcasting App Mockup"
                width={852}
                height={1846}
                priority
                className="w-full h-auto object-top drop-shadow-[0_25px_40px_rgba(0,0,0,0.38)]"
              />
            </div>
          </div>
        </div>

        {/* Floating Frosted Glass 4-Column Bar Overlapping Bottom of Phone */}
        <div className="relative z-20 -mt-20 sm:-mt-28 md:-mt-36 max-w-[560px] sm:max-w-[640px] w-full mx-auto px-4 mb-10 sm:mb-14">
          <div className="bg-white/20 border border-white/35 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl">
            <div className="grid grid-cols-4 divide-x divide-white/20 text-center">
              {/* Col 1 */}
              <div className="px-1.5 sm:px-2">
                <div className="text-lg sm:text-2xl md:text-3xl font-heading font-bold text-white tracking-tight">
                  100%
                </div>
                <div className="text-[8px] sm:text-[10px] md:text-[11px] font-semibold text-white/80 uppercase tracking-wider sm:tracking-widest mt-0.5">
                  Deliverability
                </div>
              </div>

              {/* Col 2 */}
              <div className="px-1.5 sm:px-2">
                <div className="text-lg sm:text-2xl md:text-3xl font-heading font-bold text-white tracking-tight">
                  &lt;50ms
                </div>
                <div className="text-[8px] sm:text-[10px] md:text-[11px] font-semibold text-white/80 uppercase tracking-wider sm:tracking-widest mt-0.5">
                  Dispatch
                </div>
              </div>

              {/* Col 3 */}
              <div className="px-1.5 sm:px-2">
                <div className="text-lg sm:text-2xl md:text-3xl font-heading font-bold text-white tracking-tight">
                  50+
                </div>
                <div className="text-[8px] sm:text-[10px] md:text-[11px] font-semibold text-white/80 uppercase tracking-wider sm:tracking-widest mt-0.5">
                  Channels
                </div>
              </div>

              {/* Col 4 */}
              <div className="px-1.5 sm:px-2">
                <div className="text-lg sm:text-2xl md:text-3xl font-heading font-bold text-white tracking-tight">
                  0
                </div>
                <div className="text-[8px] sm:text-[10px] md:text-[11px] font-semibold text-white/80 uppercase tracking-wider sm:tracking-widest mt-0.5">
                  Bot Limits
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
