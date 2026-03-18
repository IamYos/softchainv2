"use client";

import { BeamButton } from "@/components/marketing/BeamButton";
import { FadeIn } from "@/components/marketing/FadeIn";
import { PageContainer } from "@/components/marketing/PageContainer";

export function DotGridCTA() {
  return (
    <section id="closing-cta" className="relative border-t border-white/8 py-24">
      <PageContainer>
        <FadeIn
          className="softchain-dots relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,17,17,0.92),rgba(10,10,10,0.98))] px-6 py-14 md:px-14"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_80%_60%,rgba(220,38,38,0.12),transparent_28%)]" />
          <div className="relative z-10 max-w-[900px]">
            <p className="text-sm uppercase text-[var(--mf-text-muted)]">
              Final CTA
            </p>
            <h2
              className="mt-4 text-balance text-4xl font-medium text-white md:text-6xl"
              style={{ letterSpacing: "var(--mf-tracking-section-heading)" }}
            >
              Choose engineering that ships cleanly, scales correctly, and stays operable.
            </h2>
            <p className="mt-6 max-w-[60ch] text-base leading-8 text-[var(--mf-text-body)] md:text-lg">
              Software design and engineering, AI systems, IT infrastructure, and technology management under one execution model.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <BeamButton theme="light" className="min-h-[48px] px-6">Book a Strategy Call</BeamButton>
              <BeamButton className="min-h-[48px] px-6">Review Solutions</BeamButton>
            </div>
          </div>
        </FadeIn>
      </PageContainer>
    </section>
  );
}
