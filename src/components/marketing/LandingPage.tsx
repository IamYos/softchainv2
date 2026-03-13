"use client";

import { CSSProperties, ReactNode, useEffect, useRef } from "react";
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
} from "@/components/marketing/MarketingPerfDebug";
import { ScrambleHeadlineLoop } from "@/components/marketing/ScrambleHeadlineLoop";
import {
  SmoothScroll,
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

/**
 * A snap section that traps scroll events to allow internal content
 * to scroll before releasing to the outer snap container.
 * On desktop, intercepts wheel events and redirects them to the
 * inner scrollable element. On mobile, relies on native touch
 * scroll chaining (inner scrollable handles touch, then chains
 * to parent snap container when at boundary).
 */
function ScrollTrappedSection({ children, id }: { children: ReactNode; id?: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cachedScrollableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // "scrolling" — inner content scrolls, wheel events are trapped
    // "locked"   — hit boundary, swallowing the rest of this gesture
    // "released" — gesture ended after lock, next events pass to snap scroller
    let phase: "scrolling" | "locked" | "released" = "scrolling";
    let lockedDirection: 1 | -1 = 1;
    let gestureEndTimer: ReturnType<typeof setTimeout> | null = null;

    const getScrollable = (): HTMLElement | null => {
      const cached = cachedScrollableRef.current;
      if (
        cached &&
        section.contains(cached) &&
        cached.offsetParent !== null &&
        cached.scrollHeight > cached.clientHeight
      ) {
        return cached;
      }

      const elements = section.querySelectorAll<HTMLElement>("*");
      for (const el of elements) {
        if (el.offsetParent === null) continue;
        const style = getComputedStyle(el);
        if (
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight
        ) {
          cachedScrollableRef.current = el;
          return el;
        }
      }

      cachedScrollableRef.current = null;
      return null;
    };

    const handleWheel = (e: WheelEvent) => {
      const scrollable = getScrollable();
      // No inner scrollable — let event pass to snap scroller
      if (!scrollable) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollable;
      const atTop = scrollTop <= 1;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
      const direction: 1 | -1 = e.deltaY > 0 ? 1 : -1;

      // Released: let events pass through to the native snap scroller
      if (phase === "released") {
        const hasRoom = (direction === 1 && !atBottom) || (direction === -1 && !atTop);
        if (hasRoom || direction !== lockedDirection) {
          // Inner scroll has room again or direction reversed — back to scrolling
          phase = "scrolling";
        } else {
          // Don't preventDefault — snap scroller picks it up
          return;
        }
      }

      // Locked: swallow events until the gesture ends
      if (phase === "locked") {
        e.preventDefault();
        e.stopPropagation();

        if (gestureEndTimer) clearTimeout(gestureEndTimer);
        gestureEndTimer = setTimeout(() => {
          phase = "released";
          gestureEndTimer = null;
        }, 150);

        if (direction !== lockedDirection) {
          // Direction reversed while locked — go back to scrolling
          phase = "scrolling";
        } else {
          return;
        }
      }

      // Scrolling: trap events and redirect to inner scrollable
      e.preventDefault();
      e.stopPropagation();

      if (e.deltaY > 0 && !atBottom) {
        scrollable.scrollTop = Math.min(
          scrollTop + e.deltaY,
          scrollHeight - clientHeight,
        );
        return;
      }

      if (e.deltaY < 0 && !atTop) {
        scrollable.scrollTop = Math.max(scrollTop + e.deltaY, 0);
        return;
      }

      // Hit boundary — lock and wait for gesture to end
      phase = "locked";
      lockedDirection = direction;

      if (gestureEndTimer) clearTimeout(gestureEndTimer);
      gestureEndTimer = setTimeout(() => {
        phase = "released";
        gestureEndTimer = null;
      }, 150);
    };

    section.addEventListener("wheel", handleWheel, { passive: false });

    const handleResize = () => {
      cachedScrollableRef.current = null;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      section.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
      if (gestureEndTimer) clearTimeout(gestureEndTimer);
    };
  }, []);

  return (
    <section ref={sectionRef} id={id} className="snap-section">
      {children}
    </section>
  );
}

function HeroAndSections() {
  const lenis = useLenis();
  const { noCanvas } = useDevFlags();

  return (
    <>
      <main className="marketing-v2" data-header-theme="dark">
        <section
          id="hero-reveal"
          className="snap-section bg-[#202020]"
          style={{ ["--hero-layer-opacity" as string]: "1" } as CSSProperties}
        >
          <div className="relative h-full w-full overflow-hidden bg-[#202020]">
            <div className="absolute inset-0 z-20" style={{ backgroundColor: "#202020" }}>
              <SFBlockBackground reveal />
              {!noCanvas ? (
                <PerfSection id="HeroParticleBubble">
                  <HeroParticleBubble active />
                </PerfSection>
              ) : null}

              <PageContainer className="relative h-full">
                <div className="relative z-10 h-full w-full px-4 text-center">
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
        </section>

        <section className="snap-section">
          <PerfSection id="SFSolutionSlider">
            <SFSolutionSlider />
          </PerfSection>
        </section>

        <ScrollTrappedSection>
          <PerfSection id="SFInsightsBlock">
            <SFInsightsBlock />
          </PerfSection>
        </ScrollTrappedSection>

        <section className="snap-section">
          <PerfSection id="SFContactForm">
            <SFContactForm />
          </PerfSection>
        </section>
      </main>
      <section className="snap-section">
        <PerfSection id="SFFooter">
          <SFFooter />
        </PerfSection>
      </section>
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
