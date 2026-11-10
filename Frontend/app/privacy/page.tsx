import React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Shield,
  Lock,
  Trash2,
  Key,
  Database,
  RefreshCw,
  Send,
  CheckCircle2,
  Share2,
  Radio,
  Camera,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.44a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
    </svg>
  )
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

export const metadata = {
  title: "Privacy Policy — Postly",
  description:
    "Learn how Postly collects, uses, encrypts, and protects your Telegram, LinkedIn, and Instagram data and how you can disconnect or permanently delete your data.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs & Header */}
          <div className="mb-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-secondary/50 text-xs font-medium text-muted-foreground mb-4">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>Multi-Platform Privacy & Data Governance</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Last updated: September 2, 2026 · Effective for all users of the Postly application and services.
            </p>
          </div>

          {/* Policy Body */}
          <div className="space-y-12 text-sm sm:text-base leading-relaxed text-muted-foreground">
            {/* 1. Introduction & Scope */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  01
                </span>
                Introduction & Overview
              </h2>
              <p className="mb-3">
                Postly (&quot;we&quot;, &quot;our&quot;, or &quot;the Service&quot;) is a multi-platform content creation, scheduling, and publishing application designed to help creators, community leaders, and marketing teams compose, schedule, and publish content across supported third-party platforms including <strong>Telegram</strong>, <strong>LinkedIn</strong>, and <strong>Instagram</strong>.
              </p>
              <p className="mb-3">
                We believe in complete privacy transparency and data minimization. This Privacy Policy explains what data we collect, how platform integrations (including LinkedIn OAuth, Telegram MTProto, and Instagram Graph APIs) function, how your credentials and content are secured, and how you can modify, disconnect, or permanently delete your data at any time.
              </p>
              <p className="text-xs text-muted-foreground">
                Before connecting any third-party platform (such as LinkedIn or Telegram), you will be informed of the specific permissions requested and how that data is used to provide the publishing functionality.
              </p>
            </section>

            {/* 2. Information We Collect by Platform */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  02
                </span>
                Information We Collect & Why
              </h2>
              <p className="mb-4">
                We collect only the information strictly required to authenticate your accounts, verify your publishing permissions, and dispatch your scheduled content:
              </p>

              {/* LinkedIn Section */}
              <div className="p-5 rounded-2xl bg-secondary/40 border border-border/60 mb-4">
                <div className="font-heading font-semibold text-foreground text-base mb-2 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-500" />
                  LinkedIn Integration Data (LinkedIn OAuth 2.0)
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  When you connect your LinkedIn account to Postly via official LinkedIn OAuth 2.0 authorization, Postly may receive and store:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground mb-3">
                  <li><strong>LinkedIn Member Identifier (URN / Member ID):</strong> Used to uniquely identify your connected profile.</li>
                  <li><strong>Basic Profile Information:</strong> Name, profile vanity URL, or avatar needed to identify and display the active connected account in the Postly user interface.</li>
                  <li><strong>OAuth Access & Refresh Tokens:</strong> Cryptographic tokens provided by LinkedIn allowing Postly to interact with the LinkedIn API on your behalf.</li>
                  <li><strong>Post & Broadcast Content:</strong> Post text, commentary, links, and media attachments that you compose and schedule for publication.</li>
                  <li><strong>Organization & Page Information:</strong> Organization names and identifiers if you authorize Postly to manage and publish content to LinkedIn Company Pages on your behalf.</li>
                </ul>
                <p className="text-xs font-medium text-foreground bg-secondary/80 p-3 rounded-xl border border-border/60">
                  <strong>Why we use LinkedIn data:</strong> Postly uses authorized LinkedIn access solely to create, schedule, and publish posts and updates on behalf of the user or their authorized organization. Postly never sells, rents, or shares LinkedIn data, nor does it use LinkedIn data for advertising, profiling, or unrelated third-party services.
                </p>
              </div>

              {/* Telegram Section */}
              <div className="p-5 rounded-2xl bg-secondary/40 border border-border/60 mb-4">
                <div className="font-heading font-semibold text-foreground text-base mb-2 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-sky-500" />
                  Telegram Integration Data (MTProto Client)
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  When you connect Telegram to Postly:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
                  <li><strong>Telegram Phone Number & Verification Codes:</strong> Used strictly during the initial sign-in handshake to generate your authenticated MTProto session string.</li>
                  <li><strong>Channel & Supergroup Metadata:</strong> Channel IDs, titles, usernames, and verified administrator rights to confirm posting and pinning permissions.</li>
                  <li><strong>Broadcast Text & Media:</strong> Formatted messages (HTML/Markdown) and media attachments scheduled for broadcast.</li>
                </ul>
              </div>

              {/* Instagram & Other Platforms */}
              <div className="p-5 rounded-2xl bg-secondary/40 border border-border/60 mb-4">
                <div className="font-heading font-semibold text-foreground text-base mb-2 flex items-center gap-2">
                  <InstagramIcon className="w-4 h-4 text-pink-500" />
                  Instagram & Meta Platform Data
                </div>
                <p className="text-xs text-muted-foreground">
                  When you connect Instagram accounts, Postly receives account identifiers, OAuth tokens, and media URLs strictly to schedule and publish authorized photo, video, and carousel posts to your connected accounts.
                </p>
              </div>

              {/* What we never collect */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground mt-4">
                <strong className="text-foreground">What we NEVER collect:</strong> We do not read, monitor, or store private direct messages (DMs), personal chat logs, contacts/address books, or unrelated private communications across any connected platform.
              </div>
            </section>

            {/* 3. Data Protection & Cryptographic Security */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  03
                </span>
                Data Protection & Encryption Standards
              </h2>
              <p className="mb-4">
                We implement robust security controls to protect your connected account credentials and content:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-foreground font-semibold">AES-256 Fernet Encryption at Rest:</strong> Sensitive Telegram MTProto session strings and stored platform credentials are encrypted using AES-256 (CBC mode with HMAC-SHA256 authentication) before database persistence.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-foreground font-semibold">Hardware Keystore Isolation:</strong> Mobile authentication tokens are stored exclusively in hardware-backed storage (iOS Keychain and Android Keystore via Expo SecureStore).
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-foreground font-semibold">Ephemeral In-Memory Handling:</strong> Decryption and token usage occur in memory only during active dispatch operations and are immediately released.
                  </div>
                </li>
              </ul>
            </section>

            {/* 4. Deletion of Data, Disconnection & OAuth Revocation */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  04
                </span>
                Data Deletion, Disconnection & Token Revocation
              </h2>
              <p className="mb-4">
                You retain complete control over your data, connected platforms, and publishing history. In accordance with LinkedIn API terms, Telegram policies, and global privacy laws:
              </p>

              <div className="space-y-4 my-6">
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                  <h3 className="font-heading font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    1. Disconnecting Connected Accounts (LinkedIn, Telegram, Instagram)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    You can disconnect any individual social account (such as LinkedIn or Telegram) at any time directly in the Postly settings. When you disconnect an account, Postly deletes the stored OAuth access tokens, refresh tokens, and channel/profile mappings associated with that account.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                  <h3 className="font-heading font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    2. Deleting Posts & Scheduled Content
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    You can delete any draft, scheduled post, or published history entry directly from the application. Deleting a scheduled broadcast automatically revokes the backend Celery dispatch worker and purges the message payload.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                  <h3 className="font-heading font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    3. Account Closure & Complete Data Erasure
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Upon account deletion or a valid deletion request, Postly will delete all associated user data, connected platform information, member identifiers, and OAuth tokens stored by Postly, subject only to applicable legal retention requirements. To request full erasure, use the in-app &quot;Delete Account&quot; option or message us on Telegram at <a href="https://t.me/mubarek_h" target="_blank" rel="noopener noreferrer" className="text-primary underline">@mubarek_h</a>.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Third-Party Platforms & Service Providers */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  05
                </span>
                Third-Party Platforms & Infrastructure Processors
              </h2>
              <p className="mb-3">
                To deliver cross-platform publishing, Postly interacts with official platform APIs and reputable infrastructure providers:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                <li><strong>LinkedIn (LinkedIn Corporation / Microsoft):</strong> For authenticating LinkedIn profiles and publishing updates via official LinkedIn APIs.</li>
                <li><strong>Telegram Cloud (MTProto API):</strong> For verifying channel administration rights and broadcasting announcements.</li>
                <li><strong>Instagram / Meta Platforms:</strong> For scheduling and publishing media via official Meta Graph APIs.</li>
                <li><strong>Cloudinary:</strong> For secure image and video hosting and asset transformation.</li>
                <li><strong>Neon PostgreSQL:</strong> Managed cloud database for encrypted operational records.</li>
                <li><strong>Expo & React Native:</strong> Mobile framework and optional push delivery notifications.</li>
              </ul>
            </section>

            {/* 6. Contact & Data Protection Officer */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  06
                </span>
                Contact Information
              </h2>
              <p className="mb-4">
                If you have questions, privacy inquiries, or wish to exercise your data deletion rights, please contact our team:
              </p>
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 text-sm">
                <div><strong>Telegram:</strong> <a href="https://t.me/mubarek_h" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@mubarek_h</a></div>
                <div className="mt-1"><strong>Support Desk:</strong> <Link href="/contact" className="text-primary hover:underline">Contact &amp; Support</Link></div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
