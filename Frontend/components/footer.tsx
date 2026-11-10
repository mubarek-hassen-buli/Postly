"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"

function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}

function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
  )
}

function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden isolate pt-16 sm:pt-20 pb-0 text-white">
      {/* Same Texture Background Used in the Second Section */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <Image
          src="/images/Gemini_Generated_Image_souoy4souoy4souo.jpg"
          alt="Footer Texture Background"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Subtle depth tint so white typography stays crisp over the blue texture */}
        <div className="absolute inset-0 bg-[#1274C8]/25 dark:bg-slate-950/55" />
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Top 5-Column Link Grid (Matching Reference Layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 sm:gap-8 pb-12 sm:pb-16">
          {/* Col 1: Company */}
          <div>
            <h4 className="font-heading font-semibold text-base sm:text-lg text-white mb-5">
              Company
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm text-white/85">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/#comparison" className="hover:text-white transition-colors">
                  Why Postly
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Products */}
          <div>
            <h4 className="font-heading font-semibold text-base sm:text-lg text-white mb-5">
              Products
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm text-white/85">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Telegram Broadcasts
                </Link>
              </li>
              <li>
                <Link href="/#sandbox" className="hover:text-white transition-colors">
                  Channel Queues
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Rich Formatting
                </Link>
              </li>
              <li>
                <Link href="/#sandbox" className="hover:text-white transition-colors">
                  Analytics &amp; Reach
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div>
            <h4 className="font-heading font-semibold text-base sm:text-lg text-white mb-5">
              Resources
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm text-white/85">
              <li>
                <Link href="/#sandbox" className="hover:text-white transition-colors">
                  Live Sandbox
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-white transition-colors">
                  Architecture
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  MTProto Engine
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/mubarek-hassen-buli/Postly"
                  target="_blank"
                  className="hover:text-white transition-colors"
                >
                  GitHub Repo
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div>
            <h4 className="font-heading font-semibold text-base sm:text-lg text-white mb-5">
              Legal
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm text-white/85">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-white transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of use
                </Link>
              </li>
              <li>
                <Link href="/privacy#deletion" className="hover:text-white transition-colors">
                  Data deletion
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact */}
          <div>
            <h4 className="font-heading font-semibold text-base sm:text-lg text-white mb-5">
              Contact
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm text-white/85">
              <li>
                <a href="mailto:support@postly.app" className="hover:text-white transition-colors">
                  support@postly.app
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  @postly_support
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Support Desk
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Horizontal Divider Line */}
        <div className="border-t border-white/30" />

        {/* Middle Info & Social Row */}
        <div className="py-8 sm:py-10 flex flex-col sm:flex-row items-start sm:items-start justify-between gap-6">
          <div className="space-y-4 text-sm sm:text-base text-white/95 max-w-md leading-relaxed">
            <p>
              Postly — Unified Telegram &amp; Multi-Channel Broadcasting Platform.
            </p>
            <p className="font-medium">
              © {new Date().getFullYear()} Postly. All rights reserved.
            </p>
          </div>

          {/* Solid White Circular Social Icons */}
          <div className="flex items-center gap-3">
            <Link
              href="https://linkedin.com"
              target="_blank"
              aria-label="LinkedIn"
              className="w-9 h-9 rounded-full bg-white text-[#1C7ED6] hover:bg-white/90 hover:scale-105 transition-all flex items-center justify-center shadow-sm"
            >
              <LinkedInIcon className="w-4 h-4" />
            </Link>
            <Link
              href="https://x.com"
              target="_blank"
              aria-label="X"
              className="w-9 h-9 rounded-full bg-white text-[#1C7ED6] hover:bg-white/90 hover:scale-105 transition-all flex items-center justify-center shadow-sm"
            >
              <XIcon className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-white text-[#1C7ED6] hover:bg-white/90 hover:scale-105 transition-all flex items-center justify-center shadow-sm"
            >
              <InstagramIcon className="w-4 h-4" />
            </Link>
            <Link
              href="https://github.com/mubarek-hassen-buli/Postly"
              target="_blank"
              aria-label="GitHub"
              className="w-9 h-9 rounded-full bg-white text-[#1C7ED6] hover:bg-white/90 hover:scale-105 transition-all flex items-center justify-center shadow-sm"
            >
              <GitHubIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Giant Bottom Watermark Wordmark */}
      <div className="w-full overflow-hidden select-none pointer-events-none pt-2">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <span className="block font-heading font-extrabold text-[23vw] sm:text-[20vw] lg:text-[240px] leading-[0.76] tracking-tight bg-gradient-to-b from-white/25 via-white/15 to-white/5 bg-clip-text text-transparent translate-y-2 sm:translate-y-3">
            Postly
          </span>
        </div>
      </div>
    </footer>
  )
}
