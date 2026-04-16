"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { PageContainer } from "@/components/marketing/PageContainer";
import { AboutScrambleHeading } from "@/components/marketing/about/AboutScrambleHeading";
import { SFContactForm } from "@/components/marketing/sf/SFContactForm";
import { SFFooter } from "@/components/marketing/sf/SFFooter";
import { SOLUTIONS_PAGE_CONTENT } from "./solutionsContent";
import styles from "./SolutionsPage.module.css";

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
      win.scrollTo(0, 0);
      return;
    }
    const scrolled = Math.max(0, Math.min(outerRunway, -rect.top));
    const progress = scrolled / outerRunway;
    win.scrollTo(0, progress * internalRunwayRef.current);
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
          title="Anime.js homepage solutions"
          src="/solutions/home.html"
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
