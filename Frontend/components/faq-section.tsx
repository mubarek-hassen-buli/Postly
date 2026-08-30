"use client"

import React, { useState } from "react"
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react"

const FAQS = [
  {
    question: "Do I need to create a Telegram bot to use Postly?",
    answer:
      "No! Postly uses official Telegram MTProto client APIs (via Telethon) directly. You simply log in with your Telegram phone number, verify the login code, and Postly automatically discovers all the broadcast channels and supergroups where you have posting permissions.",
  },
  {
    question: "Is my Telegram session and account credentials secure?",
    answer:
      "Absolutely. Your MTProto session string is encrypted at rest using AES-256 Fernet encryption before being stored in the database. Decryption only occurs ephemerally during active broadcast dispatches. On the mobile device, auth tokens are isolated inside hardware-backed iOS Keychain and Android Keystore.",
  },
  {
    question: "Can I broadcast to multiple channels and supergroups simultaneously?",
    answer:
      "Yes! You can select any number of your managed channels with a single tap. Postly dispatches to all target channels concurrently with per-channel error isolation, meaning an issue in one channel will never block delivery to the others.",
  },
  {
    question: "How does scheduled broadcasting work if my phone is offline?",
    answer:
      "Once you schedule a post, the broadcast job is securely managed by our backend Celery + Redis worker queue. Even if your phone is turned off, the post will broadcast at the exact scheduled UTC timestamp. Our periodic Celery Beat scheduler continuously reconciles overdue tasks to prevent missed posts.",
  },
  {
    question: "What rich formatting options are supported?",
    answer:
      "Postly supports full HTML formatting (<b>bold</b>, <i>italic</i>, <code>code</code>, <s>strike</s>, <tg-spoiler>spoiler</tg-spoiler>, <a href='...'>links</a>) as well as Markdown mode. You can preview the exact rendered Telegram message bubble in real time before sending.",
  },
  {
    question: "Can I upload media albums, photos, and videos?",
    answer:
      "Yes! You can attach up to 10 photos or videos per post. Postly handles direct uploads to Cloudinary and dispatches them as native grouped Telegram media albums with custom captions.",
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
            Everything you need to know about Postly, Telegram MTProto client permissions, and scheduling.
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
