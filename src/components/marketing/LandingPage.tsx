"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
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
import {
  SmoothScroll,
  useLenis,
  useScrollShell,
  useSlowZone,
} from "@/components/marketing/SmoothScroll";
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
  ["--hero-layer-opacity" as string]: "1",
  ["--hero-content-opacity" as string]: "1",
  ["--hero-shatter-opacity" as string]: "0",
  ["--hero-shatter-blur" as string]: "0px",
  ["--hero-fragment-left-x" as string]: "0px",
  ["--hero-fragment-left-y" as string]: "0px",
  ["--hero-fragment-left-rotate" as string]: "0deg",
  ["--hero-fragment-right-x" as string]: "0px",
  ["--hero-fragment-right-y" as string]: "0px",
  ["--hero-fragment-right-rotate" as string]: "0deg",
  ["--hero-fragment-bottom-x" as string]: "0px",
  ["--hero-fragment-bottom-y" as string]: "0px",
  ["--hero-fragment-bottom-rotate" as string]: "0deg",
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

function HeroShatterOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
      style={{
        opacity: "var(--hero-shatter-opacity, 0)",
        willChange: "opacity",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0),rgba(255,255,255,0)_54%,rgba(255,255,255,0.2)_100%)]" />
      <div
        className="absolute left-[-5%] top-[-3%] h-[58%] w-[44%] border border-black/10 bg-white/12 shadow-[0_22px_50px_rgba(0,0,0,0.08)]"
        style={{
          clipPath: "polygon(0 0, 100% 0, 74% 64%, 20% 100%, 0 84%)",
          transform:
            "translate3d(var(--hero-fragment-left-x, 0px), var(--hero-fragment-left-y, 0px), 0) rotate(var(--hero-fragment-left-rotate, 0deg))",
          willChange: "transform",
        }}
      />
      <div
        className="absolute right-[-8%] top-[6%] h-[54%] w-[50%] border border-black/10 bg-white/10 shadow-[0_20px_46px_rgba(0,0,0,0.08)]"
        style={{
          clipPath: "polygon(16% 0, 100% 12%, 100% 86%, 28% 100%, 0 46%)",
          transform:
            "translate3d(var(--hero-fragment-right-x, 0px), var(--hero-fragment-right-y, 0px), 0) rotate(var(--hero-fragment-right-rotate, 0deg))",
          willChange: "transform",
        }}
      />
      <div
        className="absolute bottom-[-12%] left-[14%] h-[38%] w-[58%] border border-black/10 bg-white/8 shadow-[0_18px_40px_rgba(0,0,0,0.06)]"
        style={{
          clipPath: "polygon(10% 0, 100% 0, 84% 100%, 0 74%)",
          transform:
            "translate3d(var(--hero-fragment-bottom-x, 0px), var(--hero-fragment-bottom-y, 0px), 0) rotate(var(--hero-fragment-bottom-rotate, 0deg))",
          willChange: "transform",
        }}
      />
      <div className="absolute left-[8%] top-[48%] h-px w-[40%] rotate-[-20deg] bg-[linear-gradient(90deg,rgba(23,23,23,0),rgba(23,23,23,0.22),rgba(23,23,23,0))]" />
      <div className="absolute left-[42%] top-[16%] h-[42%] w-px rotate-[18deg] bg-[linear-gradient(180deg,rgba(23,23,23,0),rgba(23,23,23,0.18),rgba(23,23,23,0))]" />
      <div className="absolute right-[10%] top-[34%] h-px w-[34%] rotate-[26deg] bg-[linear-gradient(90deg,rgba(23,23,23,0),rgba(23,23,23,0.18),rgba(23,23,23,0))]" />
      <div className="absolute left-[26%] top-[62%] h-px w-[28%] rotate-[14deg] bg-[linear-gradient(90deg,rgba(23,23,23,0),rgba(23,23,23,0.14),rgba(23,23,23,0))]" />
    </div>
  );
}

function HeroAndSections() {
  const heroRevealRef = useRef<HTMLDivElement>(null);
  const heroLayerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const { scrollWrapperRef } = useScrollShell();
  const [slowZoneEnd, setSlowZoneEnd] = useState(0);

  useSlowZone(slowZoneEnd);

  useEffect(() => {
    const scrollRoot = scrollWrapperRef.current;

    if (!scrollRoot) {
      return;
    }

    const updateSlowZone = () => {
      setSlowZoneEnd(scrollRoot.clientHeight * 0.6);
    };

    updateSlowZone();
    window.addEventListener("resize", updateSlowZone);

    return () => window.removeEventListener("resize", updateSlowZone);
  }, [scrollWrapperRef]);

  useEffect(() => {
    const heroReveal = heroRevealRef.current;
    const heroLayer = heroLayerRef.current;
    const scrollRoot = scrollWrapperRef.current;

    if (!heroReveal || !heroLayer || !scrollRoot) {
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;

      const rect = heroReveal.getBoundingClientRect();
      const viewportHeight = scrollRoot.clientHeight || window.innerHeight;
      const scrollRange = Math.max(heroReveal.offsetHeight - viewportHeight, 1);
      const scrollOffset = clamp(-rect.top, 0, scrollRange);
      const scrollProgress = scrollOffset / scrollRange;
      const splitProgress = interpolate(scrollProgress, [0.28, 1], [0, 1]);
      const heroLayerOpacity = interpolate(scrollProgress, [0.14, 0.32], [1, 0]);
      const shatterProgress = clamp((scrollProgress - 0.06) / 0.22, 0, 1);
      const shatterStrength = interpolate(scrollProgress, [0.06, 0.16, 0.24, 0.32], [0, 0.35, 1, 0.22]);
      const shatterOpacity = interpolate(scrollProgress, [0.08, 0.18, 0.3], [0, 1, 0.18]);
      const shatterBlur = interpolate(scrollProgress, [0.1, 0.2, 0.32], [0, 0.35, 1]);

      heroReveal.style.setProperty("--hero-layer-opacity", heroLayerOpacity.toString());
      heroReveal.style.setProperty(
        "--hero-content-opacity",
        interpolate(scrollProgress, [0.02, 0.1], [1, 0]).toString(),
      );
      heroReveal.style.setProperty("--hero-shatter-opacity", shatterOpacity.toString());
      heroReveal.style.setProperty("--hero-shatter-blur", `${shatterBlur}px`);
      heroReveal.style.setProperty(
        "--hero-fragment-left-x",
        `${-56 * shatterProgress}px`,
      );
      heroReveal.style.setProperty(
        "--hero-fragment-left-y",
        `${-20 * shatterProgress - 10 * shatterStrength}px`,
      );
      heroReveal.style.setProperty(
        "--hero-fragment-left-rotate",
        `${-4 * shatterProgress}deg`,
      );
      heroReveal.style.setProperty(
        "--hero-fragment-right-x",
        `${62 * shatterProgress}px`,
      );
      heroReveal.style.setProperty(
        "--hero-fragment-right-y",
        `${-18 * shatterProgress - 8 * shatterStrength}px`,
      );
      heroReveal.style.setProperty(
        "--hero-fragment-right-rotate",
        `${4.5 * shatterProgress}deg`,
      );
      heroReveal.style.setProperty(
        "--hero-fragment-bottom-x",
        `${10 * shatterProgress}px`,
      );
      heroReveal.style.setProperty(
        "--hero-fragment-bottom-y",
        `${42 * shatterProgress + 10 * shatterStrength}px`,
      );
      heroReveal.style.setProperty(
        "--hero-fragment-bottom-rotate",
        `${3.2 * shatterProgress}deg`,
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

    scrollRoot.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      scrollRoot.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [scrollWrapperRef]);

  return (
    <>
      <main className="marketing-v2" data-header-theme="dark">
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
              className="absolute inset-0 z-20 bg-white"
              style={{
                opacity: "var(--hero-layer-opacity, 1)",
                transform: "translate3d(0, 0, 0)",
                transformOrigin: "center center",
                filter: "blur(var(--hero-shatter-blur, 0px))",
                willChange: "transform, opacity, filter",
              }}
            >
              <GridBackground />
              <HeroShatterOverlay />

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
                    <BeamButton
                      theme="light"
                      className="min-h-[48px] px-6"
                      onClick={() => lenis?.scrollTo("#closing-cta", { duration: 1.3 })}
                    >
                      Start a Project
                    </BeamButton>
                    <BeamButton
                      className="min-h-[48px] px-6"
                      onClick={() => lenis?.scrollTo("#capabilities", { duration: 1.3 })}
                    >
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
      </main>
      <Footer />
    </>
  );
}

export function LandingPage() {
  return (
    <SmoothScroll overlay={<Header />}>
      <HeroAndSections />
    </SmoothScroll>
  );
}
