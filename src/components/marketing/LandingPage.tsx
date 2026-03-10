"use client";

import { CSSProperties, useEffect, useRef } from "react";
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function interpolate(value: number, input: number[], output: number[]) {
  if (input.length !== output.length) {
    throw new Error("Input and output ranges must have the same length.");
  }

  if (value <= input[0]) {
    return output[0];
  }

  if (value >= input[input.length - 1]) {
    return output[output.length - 1];
  }

  let index = 0;

  while (index < input.length - 1 && value > input[index + 1]) {
    index += 1;
  }

  const start = input[index];
  const end = input[index + 1];
  const progress = (value - start) / (end - start);

  return output[index] + (output[index + 1] - output[index]) * progress;
}

const HERO_DEFAULTS = {
  ["--hero-scale" as string]: "1",
  ["--hero-layer-opacity" as string]: "1",
  ["--hero-content-opacity" as string]: "1",
  ["--grid-opacity" as string]: "0.55",
  ["--grid-scale" as string]: "1",
  ["--problem-y-top" as string]: "0px",
  ["--problem-y-bottom" as string]: "0px",
  ["--fix-text-top" as string]: "50%",
  ["--fix-text-offset-y" as string]: "80px",
  ["--fix-text-opacity" as string]: "0",
  ["--fix-text-scale" as string]: "1.05",
  ["--fix-burst-scale" as string]: "0.4",
  ["--fix-burst-opacity" as string]: "0",
  ["--fix-panel-opacity" as string]: "0",
  ["--fix-panel-y" as string]: "90px",
  ["--fix-panel-scale" as string]: "0.92",
} as CSSProperties;

function HeroAndSections() {
  const heroRevealRef = useRef<HTMLDivElement>(null);
  const heroLayerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useSlowZone(typeof window !== "undefined" ? window.innerHeight * 0.6 : 0);

  useEffect(() => {
    const heroReveal = heroRevealRef.current;
    const heroLayer = heroLayerRef.current;

    if (!heroReveal || !heroLayer) {
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;

      const rect = heroReveal.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollRange = Math.max(heroReveal.offsetHeight - viewportHeight, 1);
      const scrollOffset = clamp(-rect.top, 0, scrollRange);
      const scrollProgress = scrollOffset / scrollRange;
      const splitProgress = interpolate(scrollProgress, [0.28, 1], [0, 1]);
      const heroLayerOpacity = interpolate(scrollProgress, [0.18, 0.32], [1, 0]);

      heroReveal.style.setProperty(
        "--hero-scale",
        interpolate(scrollProgress, [0, 0.15, 0.28, 0.38], [1, 0.4, 0.1, 0.01]).toString(),
      );
      heroReveal.style.setProperty("--hero-layer-opacity", heroLayerOpacity.toString());
      heroReveal.style.setProperty(
        "--hero-content-opacity",
        interpolate(scrollProgress, [0.02, 0.1], [1, 0]).toString(),
      );
      heroReveal.style.setProperty(
        "--grid-opacity",
        interpolate(scrollProgress, [0, 0.18, 0.32], [0.55, 0.32, 0]).toString(),
      );
      heroReveal.style.setProperty(
        "--grid-scale",
        interpolate(scrollProgress, [0, 0.3], [1, 1.08]).toString(),
      );
      heroReveal.style.setProperty(
        "--problem-y-top",
        `${interpolate(splitProgress, [0, 0.8], [0, -viewportHeight])}px`,
      );
      heroReveal.style.setProperty(
        "--problem-y-bottom",
        `${interpolate(splitProgress, [0, 0.8], [0, viewportHeight])}px`,
      );
      heroReveal.style.setProperty(
        "--fix-text-top",
        `${interpolate(splitProgress, [0.2, 0.5], [50, 10])}%`,
      );
      heroReveal.style.setProperty(
        "--fix-text-offset-y",
        `${interpolate(splitProgress, [0.2, 0.5], [80, 0])}px`,
      );
      heroReveal.style.setProperty(
        "--fix-text-opacity",
        interpolate(splitProgress, [0.2, 0.35], [0, 1]).toString(),
      );
      heroReveal.style.setProperty(
        "--fix-text-scale",
        interpolate(splitProgress, [0.2, 0.5], [1.05, 1]).toString(),
      );
      heroReveal.style.setProperty(
        "--fix-burst-scale",
        interpolate(splitProgress, [0.2, 0.45], [0.4, 1.8]).toString(),
      );
      heroReveal.style.setProperty(
        "--fix-burst-opacity",
        interpolate(splitProgress, [0.2, 0.25, 0.45], [0, 0.42, 0]).toString(),
      );
      heroReveal.style.setProperty(
        "--fix-panel-opacity",
        interpolate(splitProgress, [0.3, 0.4, 0.65], [0, 1, 1]).toString(),
      );
      heroReveal.style.setProperty(
        "--fix-panel-y",
        `${interpolate(splitProgress, [0.28, 0.5], [90, 0])}px`,
      );
      heroReveal.style.setProperty(
        "--fix-panel-scale",
        interpolate(splitProgress, [0.28, 0.5], [0.92, 1]).toString(),
      );
      heroLayer.style.pointerEvents = heroLayerOpacity < 0.1 ? "none" : "auto";
    };

    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div className="marketing-v2" data-header-theme="dark">
      <Header />

      <div
        ref={heroRevealRef}
        className="relative z-30 h-[160vh] bg-[var(--mf-bg-base)] md:h-[180vh]"
        style={HERO_DEFAULTS}
      >
        <div className="sticky top-0 h-dvh w-full overflow-hidden bg-[var(--mf-bg-base)]">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <TheProblem />
          </div>

          <div className="absolute inset-0 z-10 pointer-events-none">
            <FixItReveal />
          </div>

          <div
            ref={heroLayerRef}
            className="absolute inset-0 z-20"
            style={{
              opacity: "var(--hero-layer-opacity, 1)",
              transform: "translate3d(0, 0, 0) scale(var(--hero-scale, 1))",
              transformOrigin: "center center",
              willChange: "transform, opacity",
            }}
          >
            <GridBackground />

            <PageContainer className="relative flex h-full flex-col items-center justify-center">
              <div
                style={{
                  opacity: "var(--hero-content-opacity, 1)",
                  willChange: "opacity",
                }}
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
                  <BeamButton theme="light" className="min-h-[48px] px-6" onClick={() => lenis?.scrollTo("#closing-cta", { duration: 1.3 })}>
                    Start a Project
                  </BeamButton>
                  <BeamButton className="min-h-[48px] px-6" onClick={() => lenis?.scrollTo("#capabilities", { duration: 1.3 })}>
                    Review Capabilities
                  </BeamButton>
                </div>
              </div>
            </PageContainer>
          </div>
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
