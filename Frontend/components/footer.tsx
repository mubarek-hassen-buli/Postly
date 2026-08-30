"use client"

import React from "react"
import Link from "next/link"
import { Send, Heart } from "lucide-react"

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
    <footer className="border-t border-border/80 bg-background/50 backdrop-blur-md pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand */}
          <div className="flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center shadow-xs">
                <Send className="w-4 h-4 -translate-x-0.5 translate-y-0.5" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-foreground">
                Postly
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
              The direct MTProto Telegram channel management and automated broadcasting platform for community admins and creators.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="https://github.com/mubarek-hassen-buli/Postly"
                target="_blank"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="GitHub Repository"
              >
                <GitHubIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-foreground mb-4">
              Platform
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/#features" className="hover:text-foreground transition-colors">
                  Features & Capabilities
                </Link>
              </li>
              <li>
                <Link href="/#sandbox" className="hover:text-foreground transition-colors">
                  Live Telegram Sandbox
                </Link>
              </li>
              <li>
                <Link href="/#comparison" className="hover:text-foreground transition-colors">
                  MTProto vs Bots
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-foreground transition-colors">
                  Security Architecture
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-foreground transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Privacy */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-foreground mb-4">
              Legal & Support
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact & Support Desk
                </Link>
              </li>
              <li>
                <Link href="/privacy#deletion" className="hover:text-foreground transition-colors">
                  Data Erasure & Deletion
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Tech Stack */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-foreground mb-4">
              Open Architecture
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground font-mono text-xs">
              <li>React Native & Expo SDK 53</li>
              <li>Django 5.x REST Framework</li>
              <li>Telethon MTProto Client</li>
              <li>Celery & Redis Workers</li>
              <li>PostgreSQL & NeonDB</li>
              <li>AES-256 Fernet Crypto</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4">
            <span>© {new Date().getFullYear()} Postly. All rights reserved.</span>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/contact" className="hover:underline">Support</Link>
          </div>
          <div className="flex items-center gap-1">
            <span>Built with precision for Telegram Power Admins.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
