import React from "react"
import Link from "next/link"
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Scale, ShieldAlert, Zap } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Terms of Service — Postly",
  description: "Terms and conditions for using Postly Telegram Channel Management & Broadcasting Platform.",
}

export default function TermsOfServicePage() {
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
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>User Agreement</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Last updated: August 31, 2026 · Effective for all users of Postly.
            </p>
          </div>

          {/* Terms Body */}
          <div className="space-y-12 text-sm sm:text-base leading-relaxed text-muted-foreground">
            {/* 1. Agreement to Terms */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  01
                </span>
                Agreement to Terms
              </h2>
              <p className="mb-3">
                By downloading, accessing, or using Postly (including our mobile applications, backend services, and web portals), you agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
              <p>
                If you do not agree to these terms, do not access or use the application.
              </p>
            </section>

            {/* 2. Permitted Use & Telegram Compliance */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  02
                </span>
                Acceptable Use & Telegram Policy Compliance
              </h2>
              <p className="mb-4">
                Postly is built for community leaders, channel owners, and content publishers. You agree that you will strictly NOT use Postly for:
              </p>
              <ul className="space-y-2.5 mb-6">
                <li className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                  <span>Transmitting unsolicited spam, bulk cold-messaging, or deceptive marketing campaigns.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                  <span>Distributing malicious software, trojans, phishing lures, or copyright-infringing media.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                  <span>Attempting to bypass Telegram rate limits (FloodWait) or violate Telegram&apos;s Terms of Service.</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Violation of these acceptable use terms will result in immediate termination of service access and permanent revocation of authenticated sessions.
              </p>
            </section>

            {/* 3. Account Responsibility */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  03
                </span>
                Account Security & Credentials
              </h2>
              <p className="mb-3">
                You are responsible for maintaining the confidentiality of your Telegram account login codes and Two-Step Verification passwords. Postly will never ask for your password via email or customer support tickets.
              </p>
              <p>
                You retain full ownership of all text, media, videos, and graphics published through your connected channels. Postly claims no intellectual property rights over your broadcasted content.
              </p>
            </section>

            {/* 4. Scheduling & Service Availability */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  04
                </span>
                Scheduled Broadcasting & Service Availability
              </h2>
              <p className="mb-3">
                While Postly employs distributed Celery task queues and automated beat reconciliation to ensure broadcast delivery, you acknowledge that delivery times may be affected by Telegram cloud API downtime, network latency, or channel permission revocations beyond our control.
              </p>
              <p>
                Postly is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied.
              </p>
            </section>

            {/* 5. Limitation of Liability */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  05
                </span>
                Limitation of Liability
              </h2>
              <p className="mb-3">
                To the maximum extent permitted by applicable law, in no event shall Postly, its developers, or contributors be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use or inability to use the platform.
              </p>
            </section>

            {/* 6. Governing Law & Contact */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  06
                </span>
                Questions & Legal Inquiries
              </h2>
              <p className="mb-4">
                If you have questions regarding these Terms of Service, please reach out to our legal and support team:
              </p>
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 text-sm">
                <div><strong>Email:</strong> <a href="mailto:legal@postly.app" className="text-primary hover:underline">legal@postly.app</a></div>
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
