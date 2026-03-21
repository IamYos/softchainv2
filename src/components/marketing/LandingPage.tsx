"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import {
  HERO_BUBBLE_CENTER_Y_RATIO,
  HeroParticleBubble,
} from "@/components/marketing/HeroParticleBubble";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { PageContainer } from "@/components/marketing/PageContainer";
import {
  PerfSection,
} from "@/components/marketing/MarketingPerfDebug";
import { ScrambleHeadlineLoop } from "@/components/marketing/ScrambleHeadlineLoop";
import {
  useLenis,
} from "@/components/marketing/SmoothScroll";
import { SFBlockBackground } from "@/components/marketing/SFBlockBackground";
import { useDevFlags } from "@/components/marketing/useDevFlags";
import { SFContactForm } from "@/components/marketing/sf/SFContactForm";
import { SFFooter } from "@/components/marketing/sf/SFFooter";
import { SFInsightsBlock } from "@/components/marketing/sf/SFInsightsBlock";
import { SFSolutionSlider } from "@/components/marketing/sf/SFSolutionSlider";

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
const HERO_ACTIVE_THRESHOLD = 0.15;

function HeroAndSections() {
  const lenis = useLenis();
  const { noCanvas } = useDevFlags();
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const [isHeroActive, setIsHeroActive] = useState(true);

  useEffect(() => {
    const heroSection = heroSectionRef.current;
    if (!heroSection || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }

        setIsHeroActive(
          entry.isIntersecting && entry.intersectionRatio >= HERO_ACTIVE_THRESHOLD,
        );
      },
      {
        threshold: [0, HERO_ACTIVE_THRESHOLD],
      },
    );

    observer.observe(heroSection);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <main className="marketing-v2" data-header-theme="dark">
        <section
          id="hero-reveal"
          ref={heroSectionRef}
          className="marketing-anchor relative min-h-[100svh] bg-[#202020]"
          style={{ ["--hero-layer-opacity" as string]: "1" } as CSSProperties}
        >
          <div className="relative min-h-[100svh] w-full overflow-hidden bg-[#202020]">
            <div className="absolute inset-0 z-20" style={{ backgroundColor: "#202020" }}>
              <SFBlockBackground reveal variant="techSignal" />
              {!noCanvas ? (
                <PerfSection id="HeroParticleBubble">
                  <HeroParticleBubble active={isHeroActive} />
                </PerfSection>
              ) : null}

              <PageContainer className="relative min-h-[100svh]">
                <div className="relative z-10 min-h-[100svh] w-full px-4 text-center">
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
                        Software design and engineering, AI systems, IT
                        infrastructure, technology management, scoping,
                        architecture, delivery, and long term support.
                      </span>
                      <ScrambleHeadlineLoop
                        active={isHeroActive}
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
                      <span>Connect</span>
                    </button>
                  </div>
                </div>
              </PageContainer>
            </div>
          </div>
        </section>

        <PerfSection id="SFSolutionSlider">
          <SFSolutionSlider />
        </PerfSection>

        <PerfSection id="SFInsightsBlock">
          <SFInsightsBlock />
        </PerfSection>

        <PerfSection id="SFContactForm">
          <SFContactForm />
        </PerfSection>

        <PerfSection id="SFFooter">
          <SFFooter currentPage="home" />
        </PerfSection>
      </main>
    </>
  );
}

export function LandingPage() {
  return (
    <MarketingPageShell currentPage="home">
      <PerfSection id="HeroAndSections">
        <HeroAndSections />
      </PerfSection>
    </MarketingPageShell>
  );
}
