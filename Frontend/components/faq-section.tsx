"use client"

import React, { useState } from "react"
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react"

const FAQS = [
  {
    question: "Which social and messaging platforms does Postly support?",
    answer:
      "Postly currently supports broadcasting and scheduled publishing across Telegram (channels & supergroups via direct MTProto), LinkedIn (personal member profiles and organization Company Pages via official OAuth 2.0), and Instagram (feed media via Meta APIs).",
  },
  {
    question: "How does the LinkedIn publishing integration work?",
    answer:
      "Postly connects to LinkedIn via standard LinkedIn OAuth 2.0. Once you authorize Postly, you can compose and schedule rich text posts, articles, and media directly to your LinkedIn personal feed or authorized company pages without needing to open LinkedIn manually.",
  },
  {
    question: "Do I need to create a Telegram bot to connect Telegram?",
    answer:
      "No! Postly uses official Telegram MTProto client APIs directly. You sign in with your phone number and 2FA password, and Postly automatically discovers all broadcast channels and supergroups where you have posting permissions.",
  },
  {
    question: "What happens when I disconnect an account or request data deletion?",
    answer:
      "When you disconnect an account (like LinkedIn or Telegram) or delete your Postly account, Postly immediately and permanently deletes the stored OAuth access/refresh tokens, session strings, and platform mappings from its database.",
  },
  {
    question: "How does scheduled publishing work if my phone or computer is offline?",
    answer:
      "Once you schedule a post, the dispatch job is queued in our backend Celery + Redis worker infrastructure. Even if your device is turned off, the post will broadcast at your chosen UTC timestamp. Periodic Celery Beat workers continuously reconcile and verify scheduled tasks.",
  },
  {
    question: "Is Postly in active development?",
    answer:
      "Yes! Postly is currently in active development (v1.0 Beta). We are continuously adding multi-network features, enhanced media carousels, and advanced scheduling analytics.",
  },
]

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx)
  }

  return (
    <section id="faq" className="py-20 md:py-28 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-secondary/50 text-xs font-medium text-muted-foreground mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Everything you need to know about Postly, multi-platform integrations, LinkedIn OAuth, and Telegram broadcasting.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="flex flex-col gap-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx
            return (
              <div
                key={idx}
                className="bg-card/70 backdrop-blur-xl border border-border/80 rounded-2xl overflow-hidden transition-all duration-200 hover:border-primary/40 shadow-xs"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-heading font-semibold text-base sm:text-lg text-foreground cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <div
                    className={`w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-primary/10 text-primary border-primary/20" : "text-muted-foreground"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm sm:text-base text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
