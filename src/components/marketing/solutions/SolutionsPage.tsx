"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { PageContainer } from "@/components/marketing/PageContainer";
import { AboutScrambleHeading } from "@/components/marketing/about/AboutScrambleHeading";
import { SFContactForm } from "@/components/marketing/sf/SFContactForm";
import { SFFooter } from "@/components/marketing/sf/SFFooter";
import { SOLUTIONS_PAGE_CONTENT } from "./solutionsContent";
import styles from "./SolutionsPage.module.css";

const FEATURE_START_SCROLL = 1;
const SOLUTIONS_ENGINE_SRC =
  "/solutions/home.html?v=softchain-progress-ui-20260512-title-bottom-1" +
  (process.env.NODE_ENV === "production" ? "&env=prod" : "");

// The iframe has 8 chapters (2 per solution) inside #features-gallery, and
// the anime.js engine maps each chapter to ~1/8 of the gallery's scroll range
// — NOT to that chapter section's layout offsetTop. The vendor stylesheet
// that gives each chapter its own height (100lvh) doesn't ship locally, so
// all 8 chapter sections collapse to nearly the same offsetTop. Using
// section.offsetTop landed every "Explore" click at chapter 0. Instead, key
// each solution by the first chapter index of its pair (0,2,4,6 of 8) and
// derive the internal scroll target from the features-gallery range.
const SOLUTION_CHAPTER_INDEX: Record<string, number> = {
  ai: 0, // intuitive
  software: 2, // scroll
  infrastructure: 4, // svgUtils
  technology: 6, // clockwork
};
const TOTAL_CHAPTERS = 8;

function SolutionsHero() {
  return (
    <section
      id="hero-reveal"
      data-header-palette="light"
      className={`${styles.heroSection} marketing-anchor`}
    >
      <PageContainer className={styles.heroContainer}>
        <div className={styles.heroInner}>
          <aside className={styles.heroCard}>
            <div className={styles.heroCardGlyph} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <h2 className={styles.heroCardTitle}>
              {SOLUTIONS_PAGE_CONTENT.hero.cardTitle}
            </h2>
            <p className={styles.heroCardBody}>
              {SOLUTIONS_PAGE_CONTENT.hero.cardBody}
            </p>
          </aside>

          <div className={styles.heroWordWrap}>
            <div className={styles.heroLineMask}>
              <AboutScrambleHeading
                as="h1"
                lines={[SOLUTIONS_PAGE_CONTENT.hero.word]}
                className={styles.scrambleHeading}
                lineClassName={styles.heroWord}
                resolvedColor="#202020"
                scrambleColors={["#202020", "#ff5841"]}
                fitToContainer
                fitMode="width"
                minFontSizePx={52}
                maxFontSizePx={360}
              />
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

function SolutionsEngine() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const internalRunwayRef = useRef(0);
  const [sectionHeight, setSectionHeight] = useState("100svh");

  const measureRunway = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return 0;
    const doc = iframe.contentDocument;
    if (!doc) return 0;
    const scrollEl = doc.scrollingElement ?? doc.documentElement;
    const runway = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
    internalRunwayRef.current = runway;
    setSectionHeight(runway > 0 ? `calc(100svh + ${runway}px)` : "100svh");
    return runway;
  }, []);

  const syncScroll = useCallback(() => {
    const section = sectionRef.current;
    const iframe = iframeRef.current;
    if (!section || !iframe) return;
    const win = iframe.contentWindow;
    if (!win) return;
    const rect = section.getBoundingClientRect();
    const outerRunway = section.offsetHeight - window.innerHeight;
    if (outerRunway <= 0 || internalRunwayRef.current <= 0) {
      win.scrollTo(0, FEATURE_START_SCROLL);
      return;
    }
    const scrolled = Math.max(0, Math.min(outerRunway, -rect.top));
    const progress = scrolled / outerRunway;
    const targetScroll =
      FEATURE_START_SCROLL +
      progress * Math.max(0, internalRunwayRef.current - FEATURE_START_SCROLL);
    win.scrollTo(0, targetScroll);
  }, []);

  const handleLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (doc) {
      const style = doc.createElement("style");
      style.textContent = [
        "html { scrollbar-width: none; -ms-overflow-style: none; }",
        "html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }",
      ].join("\n");
      doc.head.appendChild(style);

      // iOS Safari: pinch-zoom inside this sticky iframe corrupts the proxied
      // scroll math (scrollHeight/clientHeight shift after zoom and the outer
      // syncScroll amplifies the drift), so block scaling on iOS only.
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
      const isIOS =
        /iP(ad|hone|od)/.test(ua) ||
        (typeof navigator !== "undefined" &&
          navigator.platform === "MacIntel" &&
          navigator.maxTouchPoints > 1);
      const flag = "__softchainIOSZoomBlocked";
      const docAny = doc as unknown as Record<string, boolean>;
      if (isIOS && !docAny[flag]) {
        docAny[flag] = true;
        const existing = doc.querySelector('meta[name="viewport"]');
        const meta = existing ?? doc.createElement("meta");
        meta.setAttribute("name", "viewport");
        meta.setAttribute(
          "content",
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
        );
        if (!existing) doc.head.appendChild(meta);

        const blockGesture = (event: Event) => event.preventDefault();
        doc.addEventListener("gesturestart", blockGesture, { passive: false });
        doc.addEventListener("gesturechange", blockGesture, { passive: false });
        doc.addEventListener("gestureend", blockGesture, { passive: false });
        const blockMultiTouch = (event: TouchEvent) => {
          if (event.touches.length > 1) event.preventDefault();
        };
        doc.addEventListener("touchmove", blockMultiTouch, { passive: false });
        if (doc.documentElement) {
          doc.documentElement.style.touchAction = "pan-y";
        }
      }
    }
    measureRunway();
    syncScroll();
    requestAnimationFrame(() => {
      measureRunway();
      syncScroll();
    });
  }, [measureRunway, syncScroll]);

  useEffect(() => {
    const onScroll = () => syncScroll();
    const onResize = () => {
      measureRunway();
      syncScroll();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const settleTimeouts = [350, 1100, 2200].map((delay) =>
      window.setTimeout(() => {
        measureRunway();
        syncScroll();
      }, delay),
    );

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      settleTimeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [measureRunway, syncScroll]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const solution = params.get("solution");
    if (!solution) return;
    const chapterIndex = SOLUTION_CHAPTER_INDEX[solution];
    if (chapterIndex === undefined) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 120;
    let lastRunway = -1;
    let stableTicks = 0;

    const performScroll = () => {
      const section = sectionRef.current;
      const iframe = iframeRef.current;
      if (!section || !iframe) return false;

      const win = iframe.contentWindow;
      const doc = iframe.contentDocument;
      if (!win || !doc) return false;

      const gallery = doc.getElementById("features-gallery");
      if (!gallery) return false;

      measureRunway();
      const runway = internalRunwayRef.current;
      const outerRunway = section.offsetHeight - window.innerHeight;
      if (runway <= 0 || outerRunway <= 0) return false;

      const galleryTop = gallery.getBoundingClientRect().top + (win.scrollY || 0);
      const galleryHeight = gallery.offsetHeight;
      // Land 1px past the chapter boundary so the anime.js scroll trigger
      // commits the "is-in-view" / active-heading toggle for chapter K rather
      // than for the previous chapter sitting exactly on the boundary.
      const targetInternal =
        galleryTop + (chapterIndex / TOTAL_CHAPTERS) * galleryHeight + 1;
      const clampedInternal = Math.max(
        FEATURE_START_SCROLL,
        Math.min(runway, targetInternal),
      );
      const denom = Math.max(1, runway - FEATURE_START_SCROLL);
      const progress = Math.min(
        1,
        Math.max(0, (clampedInternal - FEATURE_START_SCROLL) / denom),
      );
      const sectionTop = window.pageYOffset + section.getBoundingClientRect().top;
      const outerY = sectionTop + progress * outerRunway;

      window.scrollTo({ top: outerY, behavior: "auto" });
      return true;
    };

    const tick = () => {
      if (cancelled) return true;
      attempts += 1;

      const section = sectionRef.current;
      const iframe = iframeRef.current;
      if (!section || !iframe?.contentDocument?.getElementById("features-gallery")) {
        return false;
      }

      measureRunway();
      const runway = internalRunwayRef.current;
      const outerRunway = section.offsetHeight - window.innerHeight;
      if (runway <= 0 || outerRunway <= 0) return false;

      // Wait until the iframe's scrollHeight has stopped growing before
      // computing the target — early reads land mid-chapter because lazy
      // demos / fonts / anime.js layout inflate the runway after first paint.
      if (Math.abs(runway - lastRunway) < 1) {
        stableTicks += 1;
      } else {
        stableTicks = 0;
      }
      lastRunway = runway;
      if (stableTicks < 3) return false;

      if (!performScroll()) return false;

      const url = new URL(window.location.href);
      url.searchParams.delete("solution");
      const search = url.searchParams.toString();
      window.history.replaceState(
        {},
        "",
        url.pathname + (search ? `?${search}` : "") + url.hash,
      );

      // One re-correction after late layout (e.g. demo canvases) settles.
      window.setTimeout(() => {
        if (!cancelled) performScroll();
      }, 500);
      return true;
    };

    const intervalId = window.setInterval(() => {
      if (tick() || attempts >= maxAttempts) {
        window.clearInterval(intervalId);
      }
    }, 100);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [measureRunway]);

  return (
    <section
      id="solutions-engine"
      ref={sectionRef}
      className={`${styles.engineSection} marketing-anchor`}
      style={{ height: sectionHeight }}
    >
      <div className={styles.engineSticky}>
        <iframe
          ref={iframeRef}
          title="Softchain solutions scene"
          src={SOLUTIONS_ENGINE_SRC}
          className={styles.engineFrame}
          onLoad={handleLoad}
        />
      </div>
    </section>
  );
}

export function SolutionsPage() {
  return (
    <MarketingPageShell currentPage="solutions">
      <main className="marketing-v2" data-header-theme="dark">
        <SolutionsHero />
        <SolutionsEngine />
        <SFContactForm />
        <SFFooter currentPage="solutions" />
      </main>
    </MarketingPageShell>
  );
}
