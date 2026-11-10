"use client"

import React from "react"
import Link from "next/link"
import { Send, ArrowRight, QrCode, Sparkles } from "lucide-react"

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

export function CtaSection() {
  return (
    <section id="download" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative rounded-3xl sm:rounded-[36px] text-white overflow-hidden p-8 sm:p-12 md:p-16 border border-white/25 shadow-2xl"
          style={{
            background: "linear-gradient(180deg, #259DF8 0%, #38BDF8 38%, #60A5FA 72%, #3B82F6 100%)",
          }}
        >
          {/* Soft Radial Ambient Lighting Core (Matching Hero Section) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 25%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.12) 42%, transparent 72%)",
            }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/30 bg-white/15 backdrop-blur-md text-xs font-semibold text-white mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-Platform Social Media Scheduler</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
                Create Once. Publish Everywhere with Postly.
              </h2>

              <p className="text-white/90 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
                Connect your Telegram, LinkedIn, and Instagram accounts in minutes. Enjoy multi-channel scheduling, rich media albums, and live WYSIWYG previews.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5">
                <Link
                  href="https://github.com/mubarek-hassen-buli/Postly"
                  target="_blank"
                  className="px-6 py-3 rounded-full bg-white text-[#1C7ED6] font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-white/95 transition-all flex items-center gap-2"
                >
                  <GitHubIcon className="w-4 h-4" />
                  <span>View on GitHub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="#sandbox"
                  className="px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/35 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>Try Live Sandbox</span>
                </Link>
              </div>
            </div>

            {/* Right QR / Quick Access Card */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="bg-white/20 border border-white/35 backdrop-blur-xl rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl max-w-xs w-full">
                <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center mb-4">
                  <QrCode className="w-8 h-8" />
                </div>
                <div className="font-heading font-bold text-base text-white mb-1">
                  Cross-Platform App
                </div>
                <p className="text-xs text-white/85 mb-4">
                  Built with React Native &amp; Expo SDK 57 for iOS, Android, and Web.
                </p>
                <div className="w-full py-2 rounded-xl bg-white/15 border border-white/25 text-[11px] font-mono text-white">
                  postly://expo-dev
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
