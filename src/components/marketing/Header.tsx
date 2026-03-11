"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { PageContainer } from "@/components/marketing/PageContainer";
import { useLenis, useScrollShell } from "@/components/marketing/SmoothScroll";
import { HeaderDesktopActions } from "@/components/marketing/header/HeaderDesktopActions";
import { HeaderDesktopNav } from "@/components/marketing/header/HeaderDesktopNav";
import { HeaderLogoButton } from "@/components/marketing/header/HeaderLogoButton";
import { HeaderMobileMenu } from "@/components/marketing/header/HeaderMobileMenu";
import { HeaderMobileMenuButton } from "@/components/marketing/header/HeaderMobileMenuButton";
import { type HeaderNavItem } from "@/components/marketing/header/navigation";

const FRAME_ONE_FADE_THRESHOLD = 0.1;

const LIGHT_FRAME_HEADER_PALETTE = {
  ["--header-text" as string]: "#202020",
  ["--header-logo-filter" as string]: "none",
  ["--header-secondary-border" as string]: "rgba(32, 32, 32, 0.28)",
  ["--header-secondary-bg" as string]: "rgba(255, 255, 255, 0)",
  ["--header-secondary-overlay" as string]: "rgba(0, 0, 0, 0.05)",
  ["--header-secondary-active-bg" as string]: "#202020",
  ["--header-secondary-active-text" as string]: "#ffffff",
  ["--header-secondary-active-border" as string]: "rgba(255, 255, 255, 0.3)",
  ["--header-primary-bg" as string]: "#202020",
  ["--header-primary-text" as string]: "#ffffff",
  ["--header-primary-border" as string]: "rgba(32, 32, 32, 0.28)",
  ["--header-primary-overlay" as string]: "rgba(255, 255, 255, 0.08)",
  ["--header-primary-active-bg" as string]: "#ffffff",
  ["--header-primary-active-text" as string]: "#202020",
  ["--header-primary-active-border" as string]: "rgba(32, 32, 32, 0.28)",
  ["--header-cta-contact-bg" as string]: "#b9b9b9",
  ["--header-cta-contact-border" as string]: "rgba(32, 32, 32, 0.28)",
  ["--header-cta-contact-text" as string]: "#202020",
  ["--header-cta-contact-hover-bg" as string]: "#202020",
  ["--header-cta-contact-hover-border" as string]: "#b9b9b9",
  ["--header-cta-contact-hover-text" as string]: "#b9b9b9",
  ["--header-cta-contact-focus" as string]: "#202020",
  ["--header-cta-book-bg" as string]: "#202020",
  ["--header-cta-book-border" as string]: "rgba(32, 32, 32, 0.28)",
  ["--header-cta-book-text" as string]: "#b9b9b9",
  ["--header-cta-book-hover-bg" as string]: "#b9b9b9",
  ["--header-cta-book-hover-border" as string]: "rgba(32, 32, 32, 0.28)",
  ["--header-cta-book-hover-text" as string]: "#202020",
  ["--header-cta-book-focus" as string]: "#202020",
} satisfies Record<string, string>;

const DARK_FRAME_HEADER_PALETTE = {
  ["--header-text" as string]: "#ffffff",
  ["--header-logo-filter" as string]: "brightness(0) invert(1)",
  ["--header-secondary-border" as string]: "rgba(255, 255, 255, 0.28)",
  ["--header-secondary-bg" as string]: "rgba(0, 0, 0, 0)",
  ["--header-secondary-overlay" as string]: "rgba(255, 255, 255, 0.06)",
  ["--header-secondary-active-bg" as string]: "#ffffff",
  ["--header-secondary-active-text" as string]: "#202020",
  ["--header-secondary-active-border" as string]: "rgba(0, 0, 0, 0.28)",
  ["--header-primary-bg" as string]: "#ffffff",
  ["--header-primary-text" as string]: "#202020",
  ["--header-primary-border" as string]: "rgba(255, 255, 255, 0.28)",
  ["--header-primary-overlay" as string]: "rgba(0, 0, 0, 0.05)",
  ["--header-primary-active-bg" as string]: "#202020",
  ["--header-primary-active-text" as string]: "#ffffff",
  ["--header-primary-active-border" as string]: "rgba(255, 255, 255, 0.28)",
  ["--header-cta-contact-bg" as string]: "#b9b9b9",
  ["--header-cta-contact-border" as string]: "rgba(32, 32, 32, 0.28)",
  ["--header-cta-contact-text" as string]: "#202020",
  ["--header-cta-contact-hover-bg" as string]: "#202020",
  ["--header-cta-contact-hover-border" as string]: "#b9b9b9",
  ["--header-cta-contact-hover-text" as string]: "#b9b9b9",
  ["--header-cta-contact-focus" as string]: "#202020",
  ["--header-cta-book-bg" as string]: "#b9b9b9",
  ["--header-cta-book-border" as string]: "rgba(185, 185, 185, 0.38)",
  ["--header-cta-book-text" as string]: "#202020",
  ["--header-cta-book-hover-bg" as string]: "#202020",
  ["--header-cta-book-hover-border" as string]: "#b9b9b9",
  ["--header-cta-book-hover-text" as string]: "#b9b9b9",
  ["--header-cta-book-focus" as string]: "#b9b9b9",
} satisfies Record<string, string>;

function applyHeaderPalette(
  header: HTMLElement,
  palette: Record<string, string>,
) {
  Object.entries(palette).forEach(([name, value]) => {
    header.style.setProperty(name, value);
  });
}

function getHeaderBackdropOpacity(scrollTop: number, viewportHeight: number) {
  const heroScrollRange = viewportHeight * 1.2;

  if (scrollTop >= heroScrollRange) {
    return 1;
  }

  const fadeStart = viewportHeight * 0.08;
  const fadeEnd = viewportHeight * 0.3;

  if (scrollTop <= fadeStart) {
    return 0;
  }

  if (scrollTop >= fadeEnd) {
    return 1;
  }

  return (scrollTop - fadeStart) / (fadeEnd - fadeStart);
}

export function Header() {
  const lenis = useLenis();
  const { scrollWrapperRef } = useScrollShell();
  const headerRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const isFrameOnePaletteRef = useRef(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenuOnDesktop = () => {
      if (window.innerWidth >= 1100) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", closeMenuOnDesktop);

    return () => window.removeEventListener("resize", closeMenuOnDesktop);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      lenis?.stop();
    } else {
      lenis?.start();
    }

    return () => {
      lenis?.start();
    };
  }, [lenis, mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const header = headerRef.current;
    const backdrop = backdropRef.current;
    const scrollRoot = scrollWrapperRef.current;

    if (!header || !backdrop || !scrollRoot) {
      return;
    }

    let frame = 0;
    let heroReveal: HTMLElement | null = null;

    const update = () => {
      frame = 0;
      backdrop.style.opacity = `${getHeaderBackdropOpacity(
        scrollRoot.scrollTop,
        scrollRoot.clientHeight || window.innerHeight,
      )}`;

      if (!heroReveal) {
        heroReveal = document.getElementById("hero-reveal");
      }

      if (!heroReveal) {
        return;
      }

      const heroLayerOpacity = Number.parseFloat(
        getComputedStyle(heroReveal).getPropertyValue("--hero-layer-opacity"),
      );
      const showFrameOnePalette =
        !Number.isNaN(heroLayerOpacity) && heroLayerOpacity > FRAME_ONE_FADE_THRESHOLD;

      if (showFrameOnePalette === isFrameOnePaletteRef.current) {
        return;
      }

      isFrameOnePaletteRef.current = showFrameOnePalette;
      applyHeaderPalette(
        header,
        showFrameOnePalette ? LIGHT_FRAME_HEADER_PALETTE : DARK_FRAME_HEADER_PALETTE,
      );
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

  const scrollToTop = () => {
    setMobileMenuOpen(false);
    lenis?.start();
    lenis?.scrollTo(0, { duration: 1, force: true });
  };

  const scrollToTarget = (target: string) => {
    const element = document.getElementById(target);

    setMobileMenuOpen(false);

    if (!element) {
      return;
    }

    lenis?.start();
    lenis?.scrollTo(element, { duration: 1.2, force: true });
  };

  const handleNavItemClick = (item: HeaderNavItem) => {
    scrollToTarget(item.target);
  };

  return (
    <>
      <header
        ref={headerRef}
        className="absolute left-0 right-0 top-0 z-[var(--mf-z-header)] w-full"
        data-contrast="light"
        style={LIGHT_FRAME_HEADER_PALETTE as CSSProperties}
      >
        <div
          ref={backdropRef}
          className="absolute inset-0 h-24 pointer-events-none"
          style={{
            backgroundColor: "rgba(10, 10, 10, 1)",
            opacity: 0,
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, transparent 100%)",
            willChange: "opacity",
          }}
        />

        <PageContainer className="relative z-10 mt-2 grid h-16 grid-cols-[auto_1fr_auto] items-center">
          <HeaderLogoButton onClick={scrollToTop} />

          <HeaderDesktopNav
            onItemClick={handleNavItemClick}
            className="hidden min-[1100px]:flex"
          />
          <div className="min-[1100px]:hidden" />

          <div className="flex items-center justify-end gap-4">
            <HeaderDesktopActions
              onSecondaryClick={() => scrollToTarget("footer")}
              onPrimaryClick={() => scrollToTarget("closing-cta")}
              className="hidden min-[1100px]:flex"
            />
            <HeaderMobileMenuButton
              onClick={() => setMobileMenuOpen(true)}
              isOpen={mobileMenuOpen}
              className="min-[1100px]:hidden"
            />
          </div>
        </PageContainer>
      </header>

      <HeaderMobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onLogoClick={scrollToTop}
        onItemClick={handleNavItemClick}
        onSecondaryClick={() => scrollToTarget("footer")}
        onPrimaryClick={() => scrollToTarget("closing-cta")}
      />
    </>
  );
}
