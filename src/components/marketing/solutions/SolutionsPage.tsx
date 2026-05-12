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
  "/solutions/home.html?v=softchain-progress-ui-20260512-console-silence-2" +
  (process.env.NODE_ENV === "production" ? "&env=prod" : "");

const SOLUTION_ANCHOR_IDS: Record<string, string> = {
  ai: "intuitive",
  software: "scroll",
  infrastructure: "svgUtils",
  technology: "clockwork",
};

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
    const anchorId = SOLUTION_ANCHOR_IDS[solution];
    if (!anchorId) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 60;

    const tryScrollToSection = () => {
      if (cancelled) return true;
      attempts += 1;

      const section = sectionRef.current;
      const iframe = iframeRef.current;
      if (!section || !iframe) return false;

      const win = iframe.contentWindow;
      const doc = iframe.contentDocument;
      if (!win || !doc) return false;

      const target = doc.getElementById(anchorId);
      if (!target) return false;

      measureRunway();
      const runway = internalRunwayRef.current;
      const outerRunway = section.offsetHeight - window.innerHeight;
      if (runway <= 0 || outerRunway <= 0) return false;

      const targetAbsoluteTop =
        target.getBoundingClientRect().top + (win.scrollY || 0);
      const clampedInternal = Math.max(
        FEATURE_START_SCROLL,
        Math.min(runway, targetAbsoluteTop),
      );
      const denom = Math.max(1, runway - FEATURE_START_SCROLL);
      const progress = Math.min(
        1,
        Math.max(0, (clampedInternal - FEATURE_START_SCROLL) / denom),
      );
      const sectionTop = window.pageYOffset + section.getBoundingClientRect().top;
      const outerY = sectionTop + progress * outerRunway;

      window.scrollTo({ top: outerY, behavior: "auto" });

      const url = new URL(window.location.href);
      url.searchParams.delete("solution");
      const search = url.searchParams.toString();
      window.history.replaceState(
        {},
        "",
        url.pathname + (search ? `?${search}` : "") + url.hash,
      );
      return true;
    };

    const intervalId = window.setInterval(() => {
      if (tryScrollToSection() || attempts >= maxAttempts) {
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
