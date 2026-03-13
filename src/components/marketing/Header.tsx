"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { PageContainer } from "@/components/marketing/PageContainer";
import { recordPerfSample } from "@/components/marketing/MarketingPerfDebug";
import { useLenis, useScrollShell } from "@/components/marketing/SmoothScroll";
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
  ["--header-menu-bg" as string]: "#b9b9b9",
  ["--header-menu-border" as string]: "rgba(32, 32, 32, 0.12)",
  ["--header-menu-text" as string]: "#202020",
  ["--header-menu-mobile-text" as string]: "#202020",
  ["--header-menu-hover-bg" as string]: "#202020",
  ["--header-menu-hover-border" as string]: "#b9b9b9",
  ["--header-menu-hover-text" as string]: "#b9b9b9",
  ["--header-menu-focus" as string]: "#202020",
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
  ["--header-menu-bg" as string]: "#b9b9b9",
  ["--header-menu-border" as string]: "rgba(185, 185, 185, 0.38)",
  ["--header-menu-text" as string]: "#202020",
  ["--header-menu-mobile-text" as string]: "#b9b9b9",
  ["--header-menu-hover-bg" as string]: "#202020",
  ["--header-menu-hover-border" as string]: "#b9b9b9",
  ["--header-menu-hover-text" as string]: "#b9b9b9",
  ["--header-menu-focus" as string]: "#b9b9b9",
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

const MENU_OPEN_HEADER_PALETTE = {
  ...LIGHT_FRAME_HEADER_PALETTE,
  ["--header-text" as string]: "#202020",
  ["--header-logo-filter" as string]: "none",
  ["--header-menu-mobile-text" as string]: "#202020",
} satisfies Record<string, string>;

function applyHeaderPalette(
  header: HTMLElement,
  palette: Record<string, string>,
) {
  Object.entries(palette).forEach(([name, value]) => {
    header.style.setProperty(name, value);
  });
}

export function Header() {
  const lenis = useLenis();
  const { scrollWrapperRef } = useScrollShell();
  const headerRef = useRef<HTMLElement>(null);
  const isFrameOnePaletteRef = useRef<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      const wrapper = scrollWrapperRef.current;
      if (wrapper) wrapper.style.overflow = "hidden";
    } else {
      const wrapper = scrollWrapperRef.current;
      if (wrapper) wrapper.style.overflow = "";
    }

    return () => {
      const wrapper = scrollWrapperRef.current;
      if (wrapper) wrapper.style.overflow = "";
    };
  }, [mobileMenuOpen, scrollWrapperRef]);

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
    const scrollRoot = scrollWrapperRef.current;

    if (!header || !scrollRoot) {
      return;
    }

    let frame = 0;

    const update = () => {
      const startedAt = performance.now();
      frame = 0;
      if (mobileMenuOpen) {
        isFrameOnePaletteRef.current = null;
        applyHeaderPalette(header, MENU_OPEN_HEADER_PALETTE);
        recordPerfSample("header-scroll-update", performance.now() - startedAt);
        return;
      }

      // Check if hero section is the currently visible snap section
      const heroReveal = document.getElementById("hero-reveal");
      if (!heroReveal) {
        recordPerfSample("header-scroll-update", performance.now() - startedAt);
        return;
      }

      const heroRect = heroReveal.getBoundingClientRect();
      // Hero is visible if its top is close to 0 (within snap threshold)
      const showFrameOnePalette = heroRect.top > -heroRect.height * 0.5;

      if (showFrameOnePalette === isFrameOnePaletteRef.current) {
        recordPerfSample("header-scroll-update", performance.now() - startedAt);
        return;
      }

      isFrameOnePaletteRef.current = showFrameOnePalette;
      applyHeaderPalette(
        header,
        showFrameOnePalette ? DARK_FRAME_HEADER_PALETTE : LIGHT_FRAME_HEADER_PALETTE,
      );
      recordPerfSample("header-scroll-update", performance.now() - startedAt);
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
  }, [mobileMenuOpen, scrollWrapperRef]);

  const scrollToTop = () => {
    setMobileMenuOpen(false);
    lenis?.scrollTo(0, { duration: 1 });
  };

  const scrollToTarget = (target: string) => {
    setMobileMenuOpen(false);
    lenis?.scrollTo(`#${target}`, { duration: 1.2 });
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
        style={DARK_FRAME_HEADER_PALETTE as CSSProperties}
      >
        <PageContainer className="relative z-10 mt-2 flex h-16 items-center justify-between">
          <HeaderLogoButton onClick={scrollToTop} />

          <HeaderMobileMenuButton
            onClick={() => setMobileMenuOpen((open) => !open)}
            isOpen={mobileMenuOpen}
          />
        </PageContainer>
      </header>

      <HeaderMobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onItemClick={handleNavItemClick}
        onSecondaryClick={() => scrollToTarget("footer")}
        onPrimaryClick={() => scrollToTarget("closing-cta")}
      />
    </>
  );
}
