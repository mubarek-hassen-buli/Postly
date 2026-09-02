"use client"

import React, { useState } from "react"
import {
  Bold,
  Italic,
  Code,
  Strikethrough,
  EyeOff,
  Pin,
  Send,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Radio,
  Share2,
  Heart,
  MessageCircle,
  Repeat,
  ThumbsUp,
} from "lucide-react"

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

const PRESETS = [
  {
    title: "🚀 Cross-Platform Launch",
    content: "<b>Postly is live!</b> 🎉\n\nCreate once, schedule, and publish seamlessly across <i>Telegram, LinkedIn, and Instagram</i>.\n\n<code>#developer #productivity #opensource</code>",
    pin: true,
  },
  {
    title: "📊 Weekly Update & Digest",
    content: "<b>Weekly Product Insights</b> 📈\n\n- Multi-platform OAuth 2.0 integrations active\n- Background Celery task queue optimization\n- Privacy-first hardware keystore token isolation\n\nRead the full update on our developer portal!",
    pin: false,
  },
  {
    title: "⚡ Quick Announcement",
    content: "<b>Maintenance Notice</b> ✅\n\nAll publishing dispatch workers are operational. Multi-channel queue latency is running smoothly.\n\nThank you for your support!",
    pin: true,
  },
]

export function ComposerSandbox() {
  const [content, setContent] = useState(PRESETS[0].content)
  const [pinMessage, setPinMessage] = useState(PRESETS[0].pin)
  const [activePlatform, setActivePlatform] = useState<"telegram" | "linkedin" | "instagram">("telegram")
  const [selectedTargets, setSelectedTargets] = useState(["Telegram: Sherlock", "LinkedIn: Company Page"])
  const [copied, setCopied] = useState(false)

  const handleInsertTag = (openTag: string, closeTag: string) => {
    setContent((prev) => `${prev} ${openTag}highlighted text${closeTag}`)
  }

  const toggleTarget = (name: string) => {
    if (selectedTargets.includes(name)) {
      if (selectedTargets.length > 1) {
        setSelectedTargets(selectedTargets.filter((c) => c !== name))
      }
    } else {
      setSelectedTargets([...selectedTargets, name])
    }
  }

  const renderCleanHtml = (raw: string) => {
    let formatted = raw
      .replace(/\n/g, "<br/>")
      .replace(/<tg-spoiler>(.*?)<\/tg-spoiler>/g, '<span class="bg-slate-700/80 px-1 py-0.5 rounded blur-xs hover:blur-none transition-all cursor-pointer text-slate-300">$1</span>')
      .replace(/<b>(.*?)<\/b>/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/<i>(.*?)<\/i>/g, '<em class="italic text-slate-200">$1</em>')
      .replace(/<code>(.*?)<\/code>/g, '<code class="font-mono bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded text-xs">$1</code>')
      .replace(/<s>(.*?)<\/s>/g, '<s class="line-through text-slate-400">$1</s>')
    return { __html: formatted }
  }

  const renderPlainText = (raw: string) => {
    return raw.replace(/<[^>]+>/g, "")
  }

  return (
    <section id="sandbox" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-secondary/50 text-xs font-medium text-muted-foreground mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Interactive Multi-Platform Sandbox</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Live Cross-Platform Preview Simulator
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Test how your content formats and renders across Telegram channels, LinkedIn posts, and Instagram feeds before sending.
          </p>
        </div>

        {/* Sandbox Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-card/60 backdrop-blur-xl border border-border/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg">
          {/* Left Column: Editor Controls */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Preset Selector */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Quick Template Presets
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setContent(preset.content)
                      setPinMessage(preset.pin)
                    }}
                    className="px-3 py-1.5 rounded-xl border border-border bg-secondary/40 text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-secondary/40 border border-border rounded-2xl">
              <button
                onClick={() => handleInsertTag("<b>", "</b>")}
                className="px-3 py-1.5 rounded-lg border border-border/60 bg-card text-xs font-bold hover:bg-accent transition-colors flex items-center gap-1 cursor-pointer"
                title="Bold (<b>)"
              >
                <Bold className="w-3.5 h-3.5" /> Bold
              </button>
              <button
                onClick={() => handleInsertTag("<i>", "</i>")}
                className="px-3 py-1.5 rounded-lg border border-border/60 bg-card text-xs italic hover:bg-accent transition-colors flex items-center gap-1 cursor-pointer"
                title="Italic (<i>)"
              >
                <Italic className="w-3.5 h-3.5" /> Italic
              </button>
              <button
                onClick={() => handleInsertTag("<code>", "</code>")}
                className="px-3 py-1.5 rounded-lg border border-border/60 bg-card text-xs font-mono hover:bg-accent transition-colors flex items-center gap-1 cursor-pointer"
                title="Code (<code>)"
              >
                <Code className="w-3.5 h-3.5" /> Code
              </button>
              <button
                onClick={() => handleInsertTag("<s>", "</s>")}
                className="px-3 py-1.5 rounded-lg border border-border/60 bg-card text-xs hover:bg-accent transition-colors flex items-center gap-1 cursor-pointer"
                title="Strikethrough (<s>)"
              >
                <Strikethrough className="w-3.5 h-3.5" /> Strike
              </button>
              <button
                onClick={() => handleInsertTag("<tg-spoiler>", "</tg-spoiler>")}
                className="px-3 py-1.5 rounded-lg border border-border/60 bg-card text-xs hover:bg-accent transition-colors flex items-center gap-1 text-primary cursor-pointer"
                title="Spoiler (<tg-spoiler>)"
              >
                <EyeOff className="w-3.5 h-3.5" /> Spoiler
              </button>

              <div className="h-4 w-px bg-border mx-1" />

              <button
                onClick={() => setPinMessage(!pinMessage)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  pinMessage
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/60 bg-card hover:bg-accent"
                }`}
              >
                <Pin className="w-3.5 h-3.5" /> {pinMessage ? "Pinned" : "Pin"}
              </button>
            </div>

            {/* Raw Text Editor */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={7}
                className="w-full bg-background border border-border rounded-2xl p-4 font-mono text-sm leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none shadow-inner"
                placeholder="Compose your broadcast in HTML or Markdown..."
              />
              <div className="absolute bottom-3 right-4 text-[11px] font-mono text-muted-foreground">
                {content.length} characters
              </div>
            </div>

            {/* Target Channel Destination Chips */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Active Destinations ({selectedTargets.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Telegram: Sherlock",
                  "Telegram: The Foundry",
                  "LinkedIn: Personal Profile",
                  "LinkedIn: Company Page",
                  "Instagram: Main Feed",
                ].map((target) => {
                  const isSelected = selectedTargets.includes(target)
                  return (
                    <button
                      key={target}
                      onClick={() => toggleTarget(target)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary/15 border-primary/40 text-primary shadow-2xs"
                          : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      {target}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Platform Live Preview */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-slate-100 flex flex-col justify-between shadow-xl min-h-[460px]">
            <div>
              {/* Platform Switcher Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-5">
                <button
                  onClick={() => setActivePlatform("telegram")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activePlatform === "telegram"
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" /> Telegram
                </button>
                <button
                  onClick={() => setActivePlatform("linkedin")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activePlatform === "linkedin"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" /> LinkedIn
                </button>
                <button
                  onClick={() => setActivePlatform("instagram")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activePlatform === "instagram"
                      ? "bg-pink-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <InstagramIcon className="w-3.5 h-3.5" /> Instagram
                </button>
              </div>

              {/* Telegram Preview */}
              {activePlatform === "telegram" && (
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
                        TG
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Sherlock Channel</div>
                        <div className="text-[10px] text-slate-400">Telegram MTProto</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Channel Bubble
                    </span>
                  </div>

                  {pinMessage && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/90 border-l-2 border-sky-400 mb-3 text-xs text-slate-300">
                      <Pin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="font-semibold text-sky-400">Pinned:</span>
                      <span className="truncate text-slate-300">
                        {renderPlainText(content).slice(0, 30)}...
                      </span>
                    </div>
                  )}

                  <div className="bg-slate-800/95 border border-slate-700/80 rounded-2xl p-4 shadow-sm">
                    <div
                      className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words"
                      dangerouslySetInnerHTML={renderCleanHtml(content)}
                    />
                    <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-700/50 text-[10px] text-slate-400">
                      <span>Broadcast Preview</span>
                      <span>12:45 PM</span>
                    </div>
                  </div>
                </div>
              )}

              {/* LinkedIn Preview */}
              {activePlatform === "linkedin" && (
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      PO
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1">
                        Postly Creator <span className="text-[10px] text-slate-400 font-normal">· 1st</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Published via Postly OAuth 2.0</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-200 leading-relaxed break-words whitespace-pre-line mb-3">
                    {renderPlainText(content)}
                  </div>

                  <div className="flex items-center gap-4 pt-2.5 border-t border-slate-700/60 text-xs text-slate-400">
                    <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                      <ThumbsUp className="w-3.5 h-3.5" /> Like
                    </span>
                    <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                      <MessageCircle className="w-3.5 h-3.5" /> Comment
                    </span>
                    <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                      <Repeat className="w-3.5 h-3.5" /> Repost
                    </span>
                  </div>
                </div>
              )}

              {/* Instagram Preview */}
              {activePlatform === "instagram" && (
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 text-white flex items-center justify-center font-bold text-[10px]">
                      IG
                    </div>
                    <div className="text-xs font-semibold text-white">postly_app</div>
                  </div>

                  <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500 text-xs mb-3">
                    Attached Media / Carousel Preview
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed break-words whitespace-pre-line">
                    <strong className="text-white">postly_app </strong>
                    {renderPlainText(content)}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Unified Dispatch Payload</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(content)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy Text"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
