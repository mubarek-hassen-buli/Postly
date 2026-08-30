import React from "react"
import Link from "next/link"
import { ArrowLeft, Shield, Lock, Trash2, Key, Database, RefreshCw, Send, CheckCircle2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Privacy Policy — Postly",
  description: "Learn how Postly collects, encrypts, and protects your Telegram session data and how you can manage or delete your account.",
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
              <span>Legal & Privacy Standards</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Last updated: August 31, 2026 · Effective immediately for all Postly users.
            </p>
          </div>

          {/* Policy Body */}
          <div className="space-y-12 text-sm sm:text-base leading-relaxed text-muted-foreground">
            {/* 1. Introduction */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  01
                </span>
                Introduction
              </h2>
              <p className="mb-3">
                Postly (&quot;we&quot;, &quot;our&quot;, or &quot;the Service&quot;) is committed to protecting your privacy and providing a transparent, secure environment for managing your Telegram channels and broadcast campaigns.
              </p>
              <p>
                This Privacy Policy explains what personal data we collect, why we collect it, how your Telegram and connected platform data is encrypted and used, and the explicit mechanisms available to you to disconnect, modify, or permanently delete your data at any time.
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  02
                </span>
                Information We Collect
              </h2>
              <p className="mb-4">
                We only collect data strictly necessary to facilitate authorized Telegram MTProto client operations and channel broadcasting:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60">
                  <div className="font-heading font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
                    <Key className="w-4 h-4 text-sky-500" />
                    Authentication Credentials
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your Telegram phone number, login OTP tokens, and temporary session strings needed to establish your authenticated MTProto client.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60">
                  <div className="font-heading font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-500" />
                    Channel Metadata
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Channel IDs, titles, usernames, subscriber counts, and verified administrator permissions (e.g. post messages, pin, edit).
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60">
                  <div className="font-heading font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-500" />
                    Post & Broadcast Content
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Composed text, rich formatting tags, scheduled execution times, media URLs, and dispatch delivery receipts.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60">
                  <div className="font-heading font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-amber-500" />
                    Device & Activity Diagnostics
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Anonymous crash diagnostics, request correlation IDs, and device push notification tokens for delivery receipts.
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                <strong>What we DO NOT collect:</strong> We do not read or store private personal chats, direct messages, contacts address books, or unrelated Telegram groups.
              </p>
            </section>

            {/* 3. How Connected Telegram Data Is Used & Protected */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  03
                </span>
                Data Protection & Cryptographic Security
              </h2>
              <p className="mb-4">
                We enforce military-grade zero-trust encryption protocols across all architectural layers:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-foreground font-semibold">AES-256 Fernet Encryption at Rest:</strong> All MTProto session strings are encrypted with AES-256-CBC and HMAC-SHA256 signatures prior to database storage.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-foreground font-semibold">Hardware Keystore Isolation:</strong> Auth tokens on mobile devices are stored exclusively in iOS Keychain or Android Keystore via Expo SecureStore.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-foreground font-semibold">Ephemeral In-Memory Decryption:</strong> Session credentials are only decrypted in temporary RAM buffers during active API dispatches and immediately purged.
                  </div>
                </li>
              </ul>
            </section>

            {/* 4. How Users Can Disconnect & Delete Data */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  04
                </span>
                How to Disconnect & Permanently Delete Your Data
              </h2>
              <p className="mb-4">
                You retain 100% control over your connected accounts, session tokens, and broadcasting records. You can exercise full data removal at any time:
              </p>

              <div className="space-y-4 my-6">
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                  <h3 className="font-heading font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    1. Instant Session Disconnection & Logout
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Navigate to the <strong>Settings tab</strong> in the Postly mobile app and tap <strong>&quot;Disconnect Session & Logout&quot;</strong>. This instantly deletes your Knox authentication token and revokes your Telegram MTProto session.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                  <h3 className="font-heading font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    2. Deleting Posts & History
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    You can delete any draft, scheduled post, or published dispatch entry directly from the Postly broadcast feed. Deleting a scheduled post automatically revokes the backend Celery execution worker.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-secondary/30 border border-border">
                  <h3 className="font-heading font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    3. Full Account Erasure Request
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    To request immediate total erasure of all account records, channel mapping metadata, and media history, email <a href="mailto:privacy@postly.app" className="text-primary underline">privacy@postly.app</a> or tap &quot;Delete Account&quot; in the mobile app. All database records will be purged within 24 hours.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Third Party Services */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  05
                </span>
                Third-Party Processors & Infrastructure
              </h2>
              <p className="mb-3">
                Postly relies on trusted, industry-standard infrastructure providers to deliver its services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                <li><strong>Telegram Cloud (MTProto API):</strong> For message transmission and official dialog permission verification.</li>
                <li><strong>Cloudinary:</strong> For secure media hosting and image/video optimization.</li>
                <li><strong>Neon PostgreSQL:</strong> Enterprise cloud database for encrypted operational records.</li>
                <li><strong>Expo Push Services:</strong> For optional broadcast delivery notifications.</li>
              </ul>
            </section>

            {/* 6. Contact */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  06
                </span>
                Contact Our Privacy Officer
              </h2>
              <p className="mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or how your data is handled, please contact our Data Protection team:
              </p>
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 text-sm">
                <div><strong>Email:</strong> <a href="mailto:privacy@postly.app" className="text-primary hover:underline">privacy@postly.app</a></div>
                <div className="mt-1"><strong>Support Desk:</strong> <Link href="/contact" className="text-primary hover:underline">postly.app/contact</Link></div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
