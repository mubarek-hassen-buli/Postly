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
  Calendar,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Copy,
  Check,
} from "lucide-react"

const PRESETS = [
  {
    title: "🚀 Product Launch",
    content: "<b>Postly 1.0 is officially live!</b> 🎉\n\nExperience <i>direct MTProto</i> Telegram channel broadcasting with <code>atomic scheduling</code> and multi-media albums.\n\n<tg-spoiler>🎁 Claim early-bird access this week!</tg-spoiler>",
    pin: true,
  },
  {
    title: "📊 Daily Community Digest",
    content: "<b>Daily Tech News & Market Pulse</b> 📈\n\n- Bitcoin breaks new quarterly high\n- AI agent frameworks adopt strict type safety\n- New open-source models released\n\nStay tuned for the <i>evening recap</i> at 6:00 PM UTC!",
    pin: false,
  },
  {
    title: "⚡ Flash Announcement",
    content: "<b>Maintenance Window Complete</b> ✅\n\nAll servers are operational. Broadcast delivery latency is running at <code>~120ms</code>.\n\nThank you for your patience!",
    pin: true,
  },
]

export function ComposerSandbox() {
  const [content, setContent] = useState(PRESETS[0].content)
  const [pinMessage, setPinMessage] = useState(PRESETS[0].pin)
  const [selectedFormat, setSelectedFormat] = useState<"HTML" | "MARKDOWN">("HTML")
  const [selectedChannels, setSelectedChannels] = useState(["Sherlock", "The Foundry"])
  const [copied, setCopied] = useState(false)

  const handleInsertTag = (openTag: string, closeTag: string) => {
    setContent((prev) => `${prev} ${openTag}highlighted text${closeTag}`)
  }

  const toggleChannel = (name: string) => {
    if (selectedChannels.includes(name)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== name))
      }
    } else {
      setSelectedChannels([...selectedChannels, name])
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

  return (
    <section id="sandbox" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-secondary/50 text-xs font-medium text-muted-foreground mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Interactive Composer Playground</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Experience the Live Telegram Preview
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Test how Postly renders tags, spoilers, pinned banners, and multi-channel destinations in real time before sending to production channels.
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
                {content.length} / 4096 chars
              </div>
            </div>

            {/* Target Channel Destination Chips */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Target Channels ({selectedChannels.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {["Sherlock", "The Foundry", "DDU ICT Club", "Crypto Daily", "Tech Horizon"].map((ch) => {
                  const isSelected = selectedChannels.includes(ch)
                  return (
                    <button
                      key={ch}
                      onClick={() => toggleChannel(ch)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary/15 border-primary/40 text-primary shadow-2xs"
                          : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      {ch}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Telegram Message Preview */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-slate-100 flex flex-col justify-between shadow-xl">
            <div>
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
                    TG
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      {selectedChannels[0] || "Telegram Broadcast"}
                    </div>
                    <div className="text-[10px] text-slate-400">14.2K subscribers</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Live Preview
                </span>
              </div>

              {/* Pinned Message Bar */}
              {pinMessage && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/90 border-l-2 border-sky-400 mb-3 text-xs text-slate-300 animate-in fade-in">
                  <Pin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="font-semibold text-sky-400">Pinned:</span>
                  <span className="truncate text-slate-300">
                    {content.replace(/<[^>]+>/g, "").slice(0, 35)}...
                  </span>
                </div>
              )}

              {/* Message Bubble */}
              <div className="bg-slate-800/95 border border-slate-700/80 rounded-2xl p-4 shadow-sm relative">
                {/* Channel Name tag in bubble */}
                <div className="text-[11px] font-bold text-sky-400 mb-1.5">
                  {selectedChannels[0] || "Postly Channel"}
                </div>

                {/* Rendered HTML */}
                <div
                  className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words"
                  dangerouslySetInnerHTML={renderCleanHtml(content)}
                />

                {/* Meta details footer */}
                <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-700/50 text-[10px] text-slate-400">
                  <span>Targeting {selectedChannels.length} channel(s)</span>
                  <span className="flex items-center gap-1">
                    <span>12:45 PM</span>
                    <CheckCircle2 className="w-3 h-3 text-sky-400" />
                  </span>
                </div>
              </div>
            </div>

            {/* Broadcast Simulated Trigger */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">MTProto Direct Dispatch</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(content)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy Payload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
