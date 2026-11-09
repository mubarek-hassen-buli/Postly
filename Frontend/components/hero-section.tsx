"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Sun, Moon, Menu, X } from "lucide-react"

export function HeroSection() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative w-[95%] max-w-[1720px] mx-auto pt-3 sm:pt-4 pb-10 sm:pb-14">
      {/* Outer Framed Hero Card - Fits cleanly within the first viewport */}
      <div
        className="relative w-full h-[calc(100svh-28px)] sm:h-[calc(100svh-36px)] min-h-[560px] max-h-[880px] rounded-[28px] sm:rounded-[40px] overflow-hidden border border-white/20 shadow-2xl flex flex-col items-center justify-between transition-all"
        style={{
          background: "linear-gradient(180deg, #259DF8 0%, #38BDF8 38%, #60A5FA 72%, #3B82F6 100%)",
        }}
      >
        {/* Soft Radial Ambient Lighting Core */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 25%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.12) 42%, transparent 72%)",
          }}
        />

        {/* Top Header Row Inside Hero Card */}
        <div className="relative z-30 w-full shrink-0 px-5 sm:px-10 pt-4 sm:pt-6">
          <div className="flex items-center justify-between w-full">
            {/* Logo Mark + Brand */}
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
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {mounted ? (
                  theme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )
                ) : (
                  <span className="w-4 h-4 block" />
                )}
              </button>

              <Link
                href="#sandbox"
                className="hidden lg:inline-flex px-5 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-sm active:scale-95"
              >
                Launch App
              </Link>

              {/* Mobile Hamburger Menu Button */}
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="lg:hidden w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Hamburger Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute left-5 right-5 sm:left-10 sm:right-10 top-full mt-3 bg-slate-900/90 dark:bg-zinc-950/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl flex flex-col gap-2.5 z-50 animate-in fade-in slide-in-from-top-2">
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold py-2 px-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              >
                Features
              </Link>
              <Link
                href="#sandbox"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold py-2 px-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              >
                Live Sandbox
              </Link>
              <Link
                href="#comparison"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold py-2 px-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              >
                Why Postly
              </Link>
              <Link
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold py-2 px-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              >
                Security
              </Link>
              <Link
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold py-2 px-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="#sandbox"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 mt-1 rounded-full bg-white text-sky-600 font-bold text-center text-xs uppercase tracking-wider shadow-md hover:bg-white/95 transition-colors"
              >
                Launch App
              </Link>
            </div>
          )}
        </div>

        {/* Hero Content Stack - Flexibly sized to fit viewport without overflowing */}
        <div className="relative z-20 px-4 flex-1 min-h-0 w-full max-w-4xl mx-auto flex flex-col items-center pt-2 sm:pt-4 pb-2 sm:pb-3 text-center">
          {/* Main Hero Headline */}
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.03] mb-2 sm:mb-3 text-center shrink-0">
            Broadcast
            <br />
            without limits
          </h1>

          {/* Subtitle */}
          <p className="text-white/90 text-xs sm:text-sm md:text-base font-normal max-w-md mx-auto text-center leading-relaxed mb-2 sm:mb-3 shrink-0">
            Schedule, broadcast, and scale your Telegram channels with automated queues and zero bot limits.
          </p>

          {/* Centerpiece Phone Mockup Image - Scales cleanly within remaining vertical space */}
          <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
            <Image
              src="/images/posttly-mockup-removebg-preview.png"
              alt="Postly Telegram Broadcasting App Mockup"
              fill
              priority
              sizes="(max-width: 768px) 280px, 420px"
              className="object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.4)] transition-transform duration-500 hover:scale-[1.01]"
            />
          </div>
        </div>

        {/* Bottom Frosted Glass 4-Column Bar - Always visible inside the Hero Card */}
        <div className="relative z-30 shrink-0 w-[92%] max-w-[560px] sm:max-w-[640px] px-2 sm:px-4 pb-4 sm:pb-6">
          <div className="bg-white/25 border border-white/35 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-2xl">
            <div className="grid grid-cols-4 divide-x divide-white/20 text-center">
              {/* Col 1 */}
              <div className="px-1 sm:px-2">
                <div className="text-base sm:text-xl md:text-2xl font-heading font-bold text-white tracking-tight">
                  100%
                </div>
                <div className="text-[8px] sm:text-[10px] font-semibold text-white/85 uppercase tracking-wider sm:tracking-widest mt-0.5">
                  Deliverability
                </div>
              </div>

              {/* Col 2 */}
              <div className="px-1 sm:px-2">
                <div className="text-base sm:text-xl md:text-2xl font-heading font-bold text-white tracking-tight">
                  &lt;50ms
                </div>
                <div className="text-[8px] sm:text-[10px] font-semibold text-white/85 uppercase tracking-wider sm:tracking-widest mt-0.5">
                  Dispatch
                </div>
              </div>

              {/* Col 3 */}
              <div className="px-1 sm:px-2">
                <div className="text-base sm:text-xl md:text-2xl font-heading font-bold text-white tracking-tight">
                  50+
                </div>
                <div className="text-[8px] sm:text-[10px] font-semibold text-white/85 uppercase tracking-wider sm:tracking-widest mt-0.5">
                  Channels
                </div>
              </div>

              {/* Col 4 */}
              <div className="px-1 sm:px-2">
                <div className="text-base sm:text-xl md:text-2xl font-heading font-bold text-white tracking-tight">
                  0
                </div>
                <div className="text-[8px] sm:text-[10px] font-semibold text-white/85 uppercase tracking-wider sm:tracking-widest mt-0.5">
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
