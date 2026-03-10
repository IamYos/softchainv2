"use client";

import { BeamButton } from "@/components/marketing/BeamButton";
import { FadeIn } from "@/components/marketing/FadeIn";
import { PageContainer } from "@/components/marketing/PageContainer";

const MARQUEE_ITEMS = [
  "Architecture",
  "Delivery",
  "Infrastructure",
  "Automation",
  "Security",
  "AI Workflows",
  "Operations",
  "Support",
];

export function HireTalentSection() {
  return (
    <section id="delivery" className="relative overflow-hidden border-t border-white/8 py-24">
      <div className="pointer-events-none absolute left-[-10%] top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.22),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-10%] top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.16),transparent_70%)] blur-3xl" />

      <PageContainer>
        <FadeIn>
          <p className="text-sm uppercase text-[var(--mf-text-muted)]">
            Delivery model
          </p>
          <h2
            className="mt-3 text-balance text-4xl font-medium text-white md:text-6xl"
            style={{ letterSpacing: "var(--mf-tracking-section-heading)" }}
          >
            Built for startups that need a CTO-level partner and businesses that need execution without drift.
          </h2>
        </FadeIn>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <FadeIn
            className="rounded-[28px] border border-white/8 bg-white/[0.03] p-7"
          >
            <p className="text-sm uppercase text-[var(--mf-text-muted)]">
              For startups
            </p>
            <h3 className="mt-3 text-2xl font-medium text-white md:text-3xl">
              Scope, architecture, build, and delivery in one line.
            </h3>
            <p className="mt-4 text-base leading-8 text-[var(--mf-text-body)]">
              We work as the technical lead when there is no internal CTO, turning product goals into a real system design and carrying the build through production.
            </p>
            <div className="mt-8">
              <BeamButton theme="light">Start a Project</BeamButton>
            </div>
          </FadeIn>

          <FadeIn
            delayMs={80}
            className="rounded-[28px] border border-white/8 bg-white/[0.03] p-7"
          >
            <p className="text-sm uppercase text-[var(--mf-text-muted)]">
              For businesses
            </p>
            <h3 className="mt-3 text-2xl font-medium text-white md:text-3xl">
              Senior execution for software, infrastructure, and ongoing support.
            </h3>
            <p className="mt-4 text-base leading-8 text-[var(--mf-text-body)]">
              We take ownership of delivery, integration, cloud and on-premise systems, security posture, and operational support without building an oversized internal team.
            </p>
            <div className="mt-8">
              <BeamButton theme="light">Discuss Delivery</BeamButton>
            </div>
          </FadeIn>
        </div>

        <FadeIn className="mt-14 overflow-hidden border-y border-white/8 py-5">
          <div className="flex w-max animate-[marquee-infinite_28s_linear_infinite] gap-8">
            {Array.from({ length: 2 }).flatMap((_, block) =>
              MARQUEE_ITEMS.map((item) => (
                <span
                  key={`${block}-${item}`}
                  className="text-sm uppercase text-[var(--mf-text-muted)] md:text-base"
                  style={{ letterSpacing: "0.18em" }}
                >
                  {item}
                </span>
              )),
            )}
          </div>
        </FadeIn>
      </PageContainer>
    </section>
  );
}
