"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Sun, Moon, Send, ArrowUpRight, Menu, X, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/60 py-3 shadow-xs"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6">
            <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-lg tracking-tight flex items-center gap-1.5 text-foreground">
              Postly
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                v1.0
              </span>
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link
            href="/#features"
            className="hover:text-foreground transition-colors duration-200"
          >
            Features
          </Link>
          <Link
            href="/#sandbox"
            className="hover:text-foreground transition-colors duration-200"
          >
            Live Sandbox
          </Link>
          <Link
            href="/#comparison"
            className="hover:text-foreground transition-colors duration-200"
          >
            Why Postly
          </Link>
          <Link
            href="/#security"
            className="hover:text-foreground transition-colors duration-200"
          >
            Security
          </Link>
          <Link
            href="/#faq"
            className="hover:text-foreground transition-colors duration-200"
          >
            FAQ
          </Link>
          <Link
            href="/contact"
            className="hover:text-foreground transition-colors duration-200"
          >
            Contact
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Dark / Light Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Get The App Pill Button */}
          <Link
            href="/#download"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full bg-foreground text-background shadow-sm hover:opacity-90 transition-all duration-200 active:scale-95 ring-4 ring-foreground/5"
          >
            Get The App
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-6 py-5 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium py-1 text-foreground"
          >
            Features
          </Link>
          <Link
            href="/#sandbox"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium py-1 text-foreground"
          >
            Live Sandbox
          </Link>
          <Link
            href="/#comparison"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium py-1 text-foreground"
          >
            Why Postly
          </Link>
          <Link
            href="/#security"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium py-1 text-foreground"
          >
            Security
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium py-1 text-foreground"
          >
            FAQ
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium py-1 text-foreground"
          >
            Contact Support
          </Link>
          <Link
            href="/#download"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full py-3 rounded-full bg-foreground text-background font-semibold text-center text-xs uppercase tracking-wider mt-2"
          >
            Get The App
          </Link>
        </div>
      )}
    </header>
  )
}
