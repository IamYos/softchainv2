"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BeamButton } from "@/components/marketing/BeamButton";
import { Capabilities } from "@/components/marketing/Capabilities";
import { DotGridCTA } from "@/components/marketing/DotGridCTA";
import { FadeIn } from "@/components/marketing/FadeIn";
import { FixItReveal } from "@/components/marketing/FixItReveal";
import { Footer } from "@/components/marketing/Footer";
import { GridBackground } from "@/components/marketing/GridBackground";
import { Header } from "@/components/marketing/Header";
import { HireTalentSection } from "@/components/marketing/HireTalentSection";
import { PageContainer } from "@/components/marketing/PageContainer";
import { SmoothScroll, useLenis, useSlowZone } from "@/components/marketing/SmoothScroll";
import { SwipeTextCycle } from "@/components/marketing/SwipeTextCycle";
import { TheProblem } from "@/components/marketing/TheProblem";

function HeroAndSections() {
  const heroRevealRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useSlowZone(typeof window !== "undefined" ? window.innerHeight * 0.6 : 0);

  const { scrollYProgress } = useScroll({
    target: heroRevealRef,
    offset: ["start start", "end end"],
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.15, 0.28, 0.38], [1, 0.4, 0.1, 0.01]);
  const heroLayerOpacity = useTransform(scrollYProgress, [0.18, 0.32], [1, 0]);
  const heroContentOpacity = useTransform(scrollYProgress, [0.02, 0.1], [1, 0]);
  const splitProgress = useTransform(scrollYProgress, [0.28, 1], [0, 1]);
  const heroPointerEvents = useTransform(heroLayerOpacity, (value) =>
    value < 0.1 ? "none" : "auto",
  );

  return (
    <div className="marketing-v2 overflow-x-clip">
      <Header />

      <div ref={heroRevealRef} className="relative z-30 h-[160vh] bg-[var(--mf-bg-base)] md:h-[180vh]">
        <div className="sticky top-0 h-dvh w-full overflow-hidden bg-[var(--mf-bg-base)]">
          <div
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <TheProblem splitProgress={splitProgress} />
          </div>

          <div
            className="absolute inset-0 z-10 pointer-events-none"
          >
            <FixItReveal splitProgress={splitProgress} />
          </div>

          <motion.div
            className="absolute inset-0 z-20"
            style={{
              scale: heroScale,
              opacity: heroLayerOpacity,
              pointerEvents: heroPointerEvents,
            }}
          >
            <GridBackground scrollProgress={scrollYProgress} />

            <PageContainer className="relative flex h-full flex-col items-center justify-center">
              <motion.div
                style={{ opacity: heroContentOpacity }}
                className="relative z-10 flex w-full max-w-[940px] flex-col items-center text-center"
              >
                <p
                  className="mb-5 text-sm uppercase text-[var(--mf-text-muted)]"
                  style={{ letterSpacing: "0.18em" }}
                >
                  Software Engineering And Infrastructure
                </p>
                <h1
                  className="text-balance text-[var(--mf-text-page-heading)] font-medium text-white"
                  style={{ letterSpacing: "var(--mf-tracking-hero)" }}
                >
                  Senior technical execution for software, AI, and operational systems.
                </h1>
                <p className="mt-6 max-w-[58ch] text-balance text-base leading-8 text-[var(--mf-text-body)] md:text-lg">
                  Softchain scopes, builds, deploys, and supports the systems companies actually run on.
                </p>

                <div className="mt-10">
                  <SwipeTextCycle />
                </div>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <BeamButton theme="light" onClick={() => lenis?.scrollTo("#closing-cta", { duration: 1.3 })}>
                    Start a Project
                  </BeamButton>
                  <BeamButton onClick={() => lenis?.scrollTo("#capabilities", { duration: 1.3 })}>
                    Review Capabilities
                  </BeamButton>
                </div>
              </motion.div>
            </PageContainer>
          </motion.div>
        </div>
      </div>

      <section className="relative z-30 border-t border-white/8 py-24">
        <PageContainer>
          <FadeIn className="mx-auto max-w-[900px] text-center">
            <p className="text-base leading-8 text-[var(--mf-text-body)] md:text-lg">
              We do not sell products. We take ownership of technical scope, architecture, implementation, integration, deployment, and long-term support.
            </p>
          </FadeIn>
        </PageContainer>
      </section>

      <Capabilities />
      <HireTalentSection />
      <DotGridCTA />
      <Footer />
    </div>
  );
}

export function LandingPage() {
  return (
    <SmoothScroll>
      <HeroAndSections />
    </SmoothScroll>
  );
}
