"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { CustomCursor } from "@/components/marketing/CustomCursor";
import { Header } from "@/components/marketing/Header";
import {
  HERO_BUBBLE_CENTER_Y_RATIO,
  HeroParticleBubble,
} from "@/components/marketing/HeroParticleBubble";
import { PageContainer } from "@/components/marketing/PageContainer";
import {
  MarketingPerfOverlay,
  PerfSection,
  recordPerfSample,
} from "@/components/marketing/MarketingPerfDebug";
import { ScrambleHeadlineLoop } from "@/components/marketing/ScrambleHeadlineLoop";
import {
  SmoothScroll,
  useLenis,
  useScrollShell,
  useSlowZone,
} from "@/components/marketing/SmoothScroll";
import { Shift5BlockBackground } from "@/components/marketing/Shift5BlockBackground";
import { useDevFlags } from "@/components/marketing/useDevFlags";
import { SFContactForm } from "@/components/marketing/sf/SFContactForm";
import { SFFooter } from "@/components/marketing/sf/SFFooter";
import { SFInsightsBlock } from "@/components/marketing/sf/SFInsightsBlock";
import { SFSolutionSlider } from "@/components/marketing/sf/SFSolutionSlider";

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

function normalize(value: number, min: number, max: number) {
  if (max <= min) {
    return 0;
  }

  return clamp((value - min) / (max - min), 0, 1);
}

function easeInCubic(value: number) {
  return value * value * value;
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
} as CSSProperties;

const HERO_HEADLINE_LINES = [
  ["ENGINEERING", "INTEGRATION"],
  ["INFRASTRUCTURE", "UPTIME"],
  ["ARCHITECTURE", "LIFECYCLE DELIVERY"],
  ["NATIVE AI", "SYSTEMS"],
] as const;

const HERO_SCRAMBLE_COLORS = [
  "#ff5841",
  "#50C878",
] as const;
const HERO_RESOLVED_COLOR = "#b9b9b9";
const HERO_CANVAS_FADE_THRESHOLD = 0.1;

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
  const { noCanvas, noHeroBlur } = useDevFlags();
  const [heroCanvasActive, setHeroCanvasActive] = useState(true);
  const heroCanvasActiveRef = useRef(true);
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
      const startedAt = performance.now();
      frame = 0;

      const rect = heroReveal.getBoundingClientRect();
      const viewportHeight = scrollRoot.clientHeight || window.innerHeight;
      const scrollRange = Math.max(heroReveal.offsetHeight - viewportHeight, 1);
      const scrollOffset = clamp(-rect.top, 0, scrollRange);
      const scrollProgress = scrollOffset / scrollRange;
      const heroFadeProgress = easeInCubic(normalize(scrollProgress, 0.14, 0.32));
      const heroLayerOpacity = 1 - heroFadeProgress;
      const nextHeroCanvasActive = heroLayerOpacity > HERO_CANVAS_FADE_THRESHOLD;
      const contentFadeProgress = easeInCubic(normalize(scrollProgress, 0.02, 0.1));
      const shatterTimeline = easeInCubic(normalize(scrollProgress, 0.06, 0.32));
      const shatterProgress = interpolate(shatterTimeline, [0, 1], [0, 1]);
      const shatterStrength = interpolate(shatterTimeline, [0, 0.45, 0.75, 1], [0, 0.35, 1, 0.22]);
      const shatterOpacity = interpolate(shatterTimeline, [0.2, 0.55, 0.9], [0, 1, 0.18]);
      const shatterBlur = interpolate(shatterTimeline, [0.3, 0.65, 1], [0, 0.35, 1]);

      if (nextHeroCanvasActive !== heroCanvasActiveRef.current) {
        heroCanvasActiveRef.current = nextHeroCanvasActive;
        setHeroCanvasActive(nextHeroCanvasActive);
      }

      heroReveal.style.setProperty("--hero-layer-opacity", heroLayerOpacity.toString());
      heroReveal.style.setProperty(
        "--hero-content-opacity",
        (1 - contentFadeProgress).toString(),
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
      heroLayer.style.pointerEvents = heroLayerOpacity < 0.1 ? "none" : "auto";
      recordPerfSample("hero-scroll-update", performance.now() - startedAt);
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
          id="hero-reveal"
          ref={heroRevealRef}
          className="relative z-30 h-[160vh] bg-[#202020] md:h-[180vh]"
          style={HERO_DEFAULTS}
        >
          <div className="sticky top-0 h-dvh w-full overflow-hidden bg-[#202020]">
            <div
              ref={heroLayerRef}
              className="absolute inset-0 z-20"
              style={{
                backgroundColor: "#202020",
                opacity: "var(--hero-layer-opacity, 1)",
                transform: "translate3d(0, 0, 0)",
                transformOrigin: "center center",
                filter: noHeroBlur ? "none" : "blur(var(--hero-shatter-blur, 0px))",
                willChange: "transform, opacity, filter",
              }}
            >
              <Shift5BlockBackground reveal />
              <HeroShatterOverlay />
              {!noCanvas ? (
                <PerfSection id="HeroParticleBubble">
                  <HeroParticleBubble active={heroCanvasActive} />
                </PerfSection>
              ) : null}

              <PageContainer className="relative h-full">
                <div
                  style={{
                    opacity: "var(--hero-content-opacity, 1)",
                    willChange: "opacity",
                  }}
                  className="relative z-10 h-full w-full px-4 text-center"
                >
                  <div
                    className="absolute inset-x-0 flex justify-center"
                    style={{
                      top: `${HERO_BUBBLE_CENTER_Y_RATIO * 100}%`,
                      transform: "translateY(-50%)",
                    }}
                  >
                    <h1
                      className="frame1-scramble-copy pointer-events-auto w-full leading-[0.9] tracking-[-0.07em]"
                      style={{ fontSize: "clamp(24px, 8vw, 112px)" }}
                    >
                      <span className="sr-only">
                        Software engineering, IT systems, infrastructure,
                        operational support, scoping, architecture, delivery,
                        and long term support.
                      </span>
                      <ScrambleHeadlineLoop
                        lineSets={HERO_HEADLINE_LINES}
                        scrambleColors={HERO_SCRAMBLE_COLORS}
                        resolvedColor={HERO_RESOLVED_COLOR}
                        className="flex w-full max-w-full flex-col items-center justify-center gap-4"
                        lineClassName="flex max-w-full flex-wrap items-center justify-center leading-[0.9]"
                      />
                    </h1>
                  </div>
                  <div
                    className="pointer-events-auto absolute inset-x-0 flex justify-center"
                    style={{
                      bottom: "max(env(safe-area-inset-bottom), clamp(2.75rem, 8vh, 5rem))",
                    }}
                  >
                    <button
                      type="button"
                      className="frame1-cm-btn"
                      onClick={() => lenis?.scrollTo("#closing-cta", { duration: 1.3 })}
                    >
                      <span>Try an assessment</span>
                    </button>
                  </div>
                </div>
              </PageContainer>
            </div>
          </div>
        </div>

        <PerfSection id="SFSolutionSlider">
          <SFSolutionSlider />
        </PerfSection>
        <PerfSection id="SFInsightsBlock">
          <SFInsightsBlock />
        </PerfSection>
        <PerfSection id="SFContactForm">
          <SFContactForm />
        </PerfSection>
      </main>
      <PerfSection id="SFFooter">
        <SFFooter />
      </PerfSection>
    </>
  );
}

export function LandingPage() {
  const { noCursor } = useDevFlags();

  return (
    <SmoothScroll
      overlay={
        <>
          <PerfSection id="Header">
            <Header />
          </PerfSection>
          {!noCursor ? (
            <PerfSection id="CustomCursor">
              <CustomCursor rgb="255, 88, 65" />
            </PerfSection>
          ) : null}
          <MarketingPerfOverlay />
        </>
      }
    >
      <PerfSection id="HeroAndSections">
        <HeroAndSections />
      </PerfSection>
    </SmoothScroll>
  );
}
