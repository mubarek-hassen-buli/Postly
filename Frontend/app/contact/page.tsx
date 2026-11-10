"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Mail,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Clock,
  ExternalLink,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

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

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [category, setCategory] = useState("General Support")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 800)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-secondary/50 text-xs font-medium text-muted-foreground mb-4">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <span>Get in Touch</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Contact & Support
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
              Have questions about Telegram MTProto integration, feature requests, or technical support? Our team is here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Form */}
            <div className="lg:col-span-7 bg-card/70 backdrop-blur-xl border border-border/80 rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg">
              {submitted ? (
                <div className="py-12 text-center flex flex-col items-center justify-center animate-in fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                    Message Received!
                  </h2>
                  <p className="text-muted-foreground text-sm max-w-md mb-6 leading-relaxed">
                    Thank you, <strong className="text-foreground">{name}</strong>. Our engineering team has logged your inquiry regarding <span className="text-foreground">{category}</span> and will respond to <strong className="text-foreground">{email}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setName("")
                      setEmail("")
                      setMessage("")
                    }}
                    className="px-6 py-2.5 rounded-full border border-border bg-secondary text-xs font-semibold uppercase tracking-wider hover:bg-muted transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Inquiry Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option>General Support</option>
                      <option>Technical & MTProto Question</option>
                      <option>Bug Report</option>
                      <option>Feature Request</option>
                      <option>Security & Privacy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we assist with your Telegram broadcasting setup?..."
                      className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 rounded-full bg-foreground text-background font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right Cards: Direct Channels & SLA */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Card 1: Direct Channels */}
              <div className="bg-card/70 backdrop-blur-xl border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="font-heading font-bold text-lg text-foreground mb-5">
                  Direct Support Channels
                </h3>

                <div className="space-y-4">
                  <a
                    href="https://t.me/mubarek_h"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-secondary/40 border border-border/60 flex items-center gap-3.5 hover:bg-secondary/70 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Send className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground">Telegram Support</div>
                      <div className="text-sm font-semibold text-foreground truncate">@mubarek_h</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  </a>

                  <a
                    href="https://github.com/mubarek-hassen-buli/Postly/issues"
                    target="_blank"
                    className="p-4 rounded-2xl bg-secondary/40 border border-border/60 flex items-center gap-3.5 hover:bg-secondary/70 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0">
                      <GitHubIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground">GitHub Issues</div>
                      <div className="text-sm font-semibold text-foreground truncate">Open Bug / Feature Ticket</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  </a>
                </div>
              </div>

              {/* Card 2: SLA Card */}
              <div className="bg-card/70 backdrop-blur-xl border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-foreground">
                      Response Time Guarantee
                    </h4>
                    <p className="text-xs text-muted-foreground">Mon – Fri · 24 Hour SLA</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We aim to respond to all technical queries and bug reports within 24 hours. For critical security advisories, our security team responds within 4 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
