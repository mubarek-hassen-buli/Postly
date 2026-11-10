"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Sun, Moon, Menu, X } from "lucide-react"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      // Show floating navbar only when user has scrolled past top
      setScrolled(window.scrollY > 80)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] sm:w-[90%] max-w-5xl transition-all duration-300 ease-out ${
        scrolled
          ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
          : "opacity-0 -translate-y-6 pointer-events-none scale-95"
      }`}
    >
      {/* Floating Pill Container */}
      <div className="bg-background/85 dark:bg-card/90 backdrop-blur-xl border border-border/80 shadow-2xl rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Brand Logo with App Icon */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl overflow-hidden p-0.5 bg-muted/60 border border-border/60 shrink-0 transition-transform group-hover:scale-105">
            <Image
              src="/images/postly.png"
              alt="Postly Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <span className="font-heading font-bold text-base sm:text-lg text-foreground tracking-tight">
            Postly
          </span>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Link
            href="/#features"
            className="hover:text-foreground transition-colors duration-150"
          >
            Features
          </Link>
          <Link
            href="/#sandbox"
            className="hover:text-foreground transition-colors duration-150"
          >
            How It Works
          </Link>
          <Link
            href="/#comparison"
            className="hover:text-foreground transition-colors duration-150"
          >
            Why Postly
          </Link>
          <Link
            href="/#security"
            className="hover:text-foreground transition-colors duration-150"
          >
            Security
          </Link>
          <Link
            href="/#faq"
            className="hover:text-foreground transition-colors duration-150"
          >
            FAQ
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Dark / Light Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
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

          {/* Launch App Capsule Button (Desktop) */}
          <a
            href="/api/download"
            download="Postly.apk"
            className="hidden lg:inline-flex px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-95 transition-all duration-200 active:scale-95"
          >
            Launch App
          </a>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground cursor-pointer"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Mobile Dropdown Card */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-background/95 dark:bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-2xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium py-1.5 text-foreground hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#sandbox"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium py-1.5 text-foreground hover:text-primary transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/#comparison"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium py-1.5 text-foreground hover:text-primary transition-colors"
          >
            Why Postly
          </Link>
          <Link
            href="/#security"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium py-1.5 text-foreground hover:text-primary transition-colors"
          >
            Security
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium py-1.5 text-foreground hover:text-primary transition-colors"
          >
            FAQ
          </Link>
          <a
            href="/api/download"
            download="Postly.apk"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-center text-xs uppercase tracking-wider mt-1"
          >
            Launch App
          </a>
        </div>
      )}
    </header>
  )
}
