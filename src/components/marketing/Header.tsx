"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/marketing/PageContainer";
import { recordPerfSample } from "@/components/marketing/MarketingPerfDebug";
import { useLenis } from "@/components/marketing/SmoothScroll";
import { HeaderLogoButton } from "@/components/marketing/header/HeaderLogoButton";
import { HeaderMobileMenu } from "@/components/marketing/header/HeaderMobileMenu";
import { HeaderMobileMenuButton } from "@/components/marketing/header/HeaderMobileMenuButton";
import {
  getContactDestination,
  getLogoDestination,
  type HeaderNavItem,
  type MarketingPageContext,
  resolveHeaderNavItem,
} from "@/components/marketing/header/navigation";

const LIGHT_FRAME_HEADER_PALETTE = {
  ["--header-text" as string]: "#202020",
  ["--header-logo-dark-opacity" as string]: "1",
  ["--header-logo-gray-opacity" as string]: "0",
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
  ["--header-logo-dark-opacity" as string]: "0",
  ["--header-logo-gray-opacity" as string]: "1",
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

function applyHeaderVisibility(header: HTMLElement, hidden: boolean) {
  header.style.opacity = hidden ? "0" : "1";
  header.style.pointerEvents = hidden ? "none" : "auto";
  header.style.transform = hidden
    ? "translate3d(0, calc(-100% - 1rem), 0)"
    : "translate3d(0, 0, 0)";
}

type HeaderProps = {
  currentPage: MarketingPageContext;
};

export function Header({ currentPage }: HeaderProps) {
  const lenis = useLenis();
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);
  const isFrameOnePaletteRef = useRef<boolean | null>(null);
  const isFooterFullyVisibleRef = useRef<boolean | null>(null);
  const pendingActionRef = useRef<
    | {
        kind: "scroll";
        target: string | number;
        duration: number;
      }
    | {
        kind: "href";
        href: string;
      }
    | null
  >(null);
  const scrollLockYRef = useRef(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const body = document.body;
    scrollLockYRef.current = window.scrollY;
    body.style.left = "0";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.right = "0";
    body.style.top = `-${scrollLockYRef.current}px`;
    body.style.width = "100%";

    return () => {
      body.style.left = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.right = "";
      body.style.top = "";
      body.style.width = "";
      window.scrollTo({ top: scrollLockYRef.current, behavior: "auto" });
    };
  }, [currentPage, mobileMenuOpen]);

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
  }, [currentPage, mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      return;
    }

    const pendingAction = pendingActionRef.current;
    if (!pendingAction) {
      return;
    }

    pendingActionRef.current = null;
    window.requestAnimationFrame(() => {
      if (pendingAction.kind === "scroll") {
        lenis?.scrollTo(pendingAction.target, { duration: pendingAction.duration });
        return;
      }

      router.push(pendingAction.href);
    });
  }, [lenis, mobileMenuOpen, router]);

  useEffect(() => {
    const header = headerRef.current;

    if (!header) {
      return;
    }

    let frame = 0;
    const footerHideZone = document.querySelector<HTMLElement>('[data-header-hide-zone="footer"]');

    const update = () => {
      const startedAt = performance.now();
      frame = 0;
      if (mobileMenuOpen) {
        isFrameOnePaletteRef.current = null;
        isFooterFullyVisibleRef.current = null;
        applyHeaderPalette(header, MENU_OPEN_HEADER_PALETTE);
        applyHeaderVisibility(header, false);
        recordPerfSample("header-scroll-update", performance.now() - startedAt);
        return;
      }

      const footerRect = footerHideZone?.getBoundingClientRect();
      const isFooterFullyVisible = footerRect
        ? footerRect.top >= 0 && footerRect.bottom <= window.innerHeight
        : false;

      if (isFooterFullyVisible !== isFooterFullyVisibleRef.current) {
        isFooterFullyVisibleRef.current = isFooterFullyVisible;
        applyHeaderVisibility(header, isFooterFullyVisible);
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
      const heroPalette =
        heroReveal.dataset.headerPalette === "light"
          ? LIGHT_FRAME_HEADER_PALETTE
          : DARK_FRAME_HEADER_PALETTE;
      const postHeroPalette =
        currentPage === "about" ? DARK_FRAME_HEADER_PALETTE : LIGHT_FRAME_HEADER_PALETTE;

      if (showFrameOnePalette === isFrameOnePaletteRef.current) {
        recordPerfSample("header-scroll-update", performance.now() - startedAt);
        return;
      }

      isFrameOnePaletteRef.current = showFrameOnePalette;
      applyHeaderPalette(
        header,
        showFrameOnePalette ? heroPalette : postHeroPalette,
      );
      recordPerfSample("header-scroll-update", performance.now() - startedAt);
    };

    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [currentPage, mobileMenuOpen]);

  const queueOrRunScroll = (target: string | number, duration: number) => {
    if (mobileMenuOpen) {
      pendingActionRef.current = { kind: "scroll", target, duration };
      setMobileMenuOpen(false);
      return;
    }

    lenis?.scrollTo(target, { duration });
  };

  const queueOrRunHref = (href: string) => {
    if (mobileMenuOpen) {
      pendingActionRef.current = { kind: "href", href };
      setMobileMenuOpen(false);
      return;
    }

    router.push(href);
  };

  const scrollToTarget = (target: string) => {
    queueOrRunScroll(`#${target}`, 1.2);
  };

  const handleNavItemClick = (item: HeaderNavItem) => {
    const resolvedItem = resolveHeaderNavItem(item, currentPage);

    if (resolvedItem.kind === "scroll") {
      scrollToTarget(resolvedItem.target);
      return;
    }

    queueOrRunHref(resolvedItem.href);
  };

  const handleLogoClick = () => {
    const destination = getLogoDestination(currentPage);

    if (destination.kind === "scroll") {
      queueOrRunScroll(destination.target, 1);
      return;
    }

    queueOrRunHref(destination.href);
  };

  const handlePrimaryClick = () => {
    const destination = getContactDestination(currentPage);

    if (destination.kind === "scroll") {
      scrollToTarget(destination.target);
      return;
    }

    queueOrRunHref(destination.href);
  };

  return (
    <>
      <header
        ref={headerRef}
        className="fixed left-0 right-0 top-0 z-[var(--mf-z-header)] w-full"
        data-contrast="light"
        style={{
          ...(DARK_FRAME_HEADER_PALETTE as CSSProperties),
          opacity: 1,
          transform: "translate3d(0, 0, 0)",
          transition: "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.24s ease",
          willChange: "transform, opacity",
        }}
      >
        <PageContainer className="relative z-10 mt-2 flex h-16 items-center justify-between">
          <HeaderLogoButton
            onClick={handleLogoClick}
            ariaLabel={currentPage === "home" ? "Scroll to top" : "Go to homepage"}
          />

          <HeaderMobileMenuButton
            onClick={() => setMobileMenuOpen((open) => !open)}
            isOpen={mobileMenuOpen}
          />
        </PageContainer>
      </header>

      <HeaderMobileMenu
        currentPage={currentPage}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onItemClick={handleNavItemClick}
        onPrimaryClick={handlePrimaryClick}
      />
    </>
  );
}
