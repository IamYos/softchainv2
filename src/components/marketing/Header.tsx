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
  const backdropRef = useRef<HTMLDivElement>(null);
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
    const backdrop = backdropRef.current;
    const scrollRoot = scrollWrapperRef.current;

    if (!backdrop || !scrollRoot) {
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      backdrop.style.opacity = `${getHeaderBackdropOpacity(
        scrollRoot.scrollTop,
        scrollRoot.clientHeight || window.innerHeight,
      )}`;
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
        className="absolute left-0 right-0 top-0 z-[var(--mf-z-header)] w-full"
        data-contrast="dark"
        style={{
          ["--header-text" as string]: "#ffffff",
          ["--header-logo-filter" as string]: "brightness(0) invert(1)",
          ["--header-secondary-border" as string]: "rgba(255, 255, 255, 0.28)",
          ["--header-secondary-bg" as string]: "rgba(0, 0, 0, 0)",
          ["--header-primary-bg" as string]: "#ffffff",
          ["--header-primary-text" as string]: "#171717",
        } as CSSProperties}
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
