import React from "react"
import Link from "next/link"
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Scale, ShieldAlert, Zap, Share2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Terms of Service — Postly",
  description:
    "Terms and conditions for using Postly Social Media & Messaging Publishing Platform (Telegram, LinkedIn, Instagram).",
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
              <span>User Agreement & Platform Terms</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Last updated: September 2, 2026 · Effective for all users of Postly.
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
                Agreement to Terms & Platform Scope
              </h2>
              <p className="mb-3">
                Postly is a social media and messaging publishing and scheduling platform that enables users to create, schedule, and broadcast content across multiple third-party platforms including <strong>Telegram</strong>, <strong>LinkedIn</strong>, and <strong>Instagram</strong> from a single interface.
              </p>
              <p className="mb-3">
                By downloading, accessing, or using Postly (including mobile applications, web interfaces, and backend dispatch services), you agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
              <p>
                If you do not agree to these terms, do not access or use the application.
              </p>
            </section>

            {/* 2. Third-Party Platforms & API Compliance */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  02
                </span>
                Third-Party Platforms & API Terms Compliance
              </h2>
              <p className="mb-4">
                Postly operates by connecting to third-party social networks and messaging systems via official APIs, OAuth authorization, and protocol client sessions. When using Postly, you acknowledge and agree that:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <div>
                    <strong className="text-foreground font-semibold">Compliance with Third-Party Rules:</strong> You are solely responsible for ensuring your published content complies with the terms of service, developer agreements, and community policies of each connected platform, including:
                    <ul className="list-disc pl-5 mt-1.5 space-y-1 text-xs text-muted-foreground">
                      <li><strong>LinkedIn:</strong> LinkedIn User Agreement, Professional Community Policies, and LinkedIn API Terms of Use.</li>
                      <li><strong>Telegram:</strong> Telegram Terms of Service and acceptable broadcast guidelines.</li>
                      <li><strong>Instagram / Meta:</strong> Meta Platform Terms and Instagram Community Guidelines.</li>
                    </ul>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <div>
                    <strong className="text-foreground font-semibold">Dependency on Third-Party APIs:</strong> Postly relies on the availability, uptime, rate limits, and permission scopes provided by each third-party network. Postly is not liable for publishing delays or failures caused by third-party API changes, network outages, or account restrictions imposed directly by those platforms.
                  </div>
                </li>
              </ul>
            </section>

            {/* 3. Acceptable Use Policy */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  03
                </span>
                Acceptable Use & Anti-Spam Guidelines
              </h2>
              <p className="mb-4">
                You agree not to misuse Postly or use the platform to conduct harmful, abusive, or unlawful activities. Strictly prohibited actions include:
              </p>
              <ul className="space-y-2.5 mb-6">
                <li className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                  <span>Transmitting bulk unsolicited messages, spam, or deceptive marketing campaigns across any connected network.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                  <span>Publishing malware, phishing links, illegal material, or intellectual property infringing content.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                  <span>Attempting to circumvent third-party rate limits (such as LinkedIn API quotas or Telegram FloodWait) through abusive automation.</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Violating these acceptable use rules may result in immediate suspension of your Postly account and revocation of API tokens.
              </p>
            </section>

            {/* 4. Content Ownership & Credentials */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  04
                </span>
                Content Ownership & Security of Credentials
              </h2>
              <p className="mb-3">
                <strong>Your Content:</strong> You retain 100% intellectual property ownership over all text, articles, images, videos, and graphics published through Postly. Postly claims no rights or ownership over your content.
              </p>
              <p>
                <strong>Credential Security:</strong> You are responsible for safeguarding your login credentials, OAuth tokens, and 2FA passwords. Postly will never request your passwords via unsolicited communications.
              </p>
            </section>

            {/* 5. Scheduling, Service Availability & Disclaimers */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  05
                </span>
                Scheduling, Reliability & Disclaimers
              </h2>
              <p className="mb-3">
                Postly utilizes distributed background task workers (Celery + Redis) to automate scheduled posts. While we strive for timely execution, network conditions, token expirations, or third-party platform rate limits may occasionally affect delivery times.
              </p>
              <p>
                Postly is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied.
              </p>
            </section>

            {/* 6. Contact & Legal Inquiries */}
            <section className="bg-card/60 backdrop-blur-md border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                  06
                </span>
                Questions & Legal Inquiries
              </h2>
              <p className="mb-4">
                For questions regarding these Terms of Service, please contact:
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
