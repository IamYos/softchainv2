"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PageContainer } from "@/components/marketing/PageContainer";
import { useLenis } from "@/components/marketing/SmoothScroll";
import { HeaderDesktopActions } from "@/components/marketing/header/HeaderDesktopActions";
import { HeaderDesktopNav } from "@/components/marketing/header/HeaderDesktopNav";
import { HeaderLogoButton } from "@/components/marketing/header/HeaderLogoButton";
import { HeaderMobileMenu } from "@/components/marketing/header/HeaderMobileMenu";
import { HeaderMobileMenuButton } from "@/components/marketing/header/HeaderMobileMenuButton";
import { type HeaderNavItem } from "@/components/marketing/header/navigation";

function getHeaderBackdropOpacity(scrollTop: number) {
  const heroScrollRange = window.innerHeight * 1.2;

  if (scrollTop >= heroScrollRange) {
    return 1;
  }

  const fadeStart = window.innerHeight * 0.08;
  const fadeEnd = window.innerHeight * 0.3;

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
  const { scrollY } = useScroll();
  const darknessRaw = useMotionValue(1);
  const headerBgOpacityRaw = useMotionValue(0);
  const darkness = useSpring(darknessRaw, {
    stiffness: 100,
    damping: 20,
    mass: 1,
  });
  const headerBgOpacity = useSpring(headerBgOpacityRaw, {
    stiffness: 200,
    damping: 30,
    mass: 1,
  });

  const [currentContrast, setCurrentContrast] = useState<"light" | "dark">(
    "dark",
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const contrastRef = useRef<"light" | "dark">("dark");

  useEffect(() => setMounted(true), []);

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
      document.body.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.body.style.removeProperty("overflow");
      lenis?.start();
    }

    return () => {
      document.body.style.removeProperty("overflow");
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
    contrastRef.current = currentContrast;
  }, [currentContrast]);

  const updateDarkness = useCallback((latest: number) => {
    const headerSampleY = 40;
    const centerX = window.innerWidth / 2;
    let isLightBehind = false;
    let foundTheme = false;

    try {
      const elements = document.elementsFromPoint(centerX, headerSampleY);
      const headerEl = document.querySelector("[data-contrast]");

      for (const element of elements) {
        if (headerEl instanceof HTMLElement && headerEl.contains(element)) {
          continue;
        }

        const themed = (element as HTMLElement).closest?.("[data-header-theme]");
        if (!(themed instanceof HTMLElement)) {
          continue;
        }

        const theme = themed.getAttribute("data-header-theme");
        const style = window.getComputedStyle(themed);
        const opacity = Number.parseFloat(style.opacity || "1");

        if (opacity < 0.1 || style.display === "none" || style.visibility === "hidden") {
          continue;
        }

        isLightBehind = theme === "light";
        foundTheme = true;
        break;
      }

      if (!foundTheme) {
        for (const element of elements) {
          if (headerEl instanceof HTMLElement && headerEl.contains(element)) {
            continue;
          }

          const bg = window.getComputedStyle(element).backgroundColor;
          if (!bg || bg === "rgba(0, 0, 0, 0)" || bg === "transparent") {
            continue;
          }

          const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            const r = Number.parseInt(match[1], 10);
            const g = Number.parseInt(match[2], 10);
            const b = Number.parseInt(match[3], 10);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

            isLightBehind = luminance > 0.5;
          }

          break;
        }
      }
    } catch {
      isLightBehind = false;
    }

    const targetDarkness = isLightBehind ? 0 : 1;
    darknessRaw.set(targetDarkness);
    headerBgOpacityRaw.set(getHeaderBackdropOpacity(latest));

    const contrast = targetDarkness > 0.5 ? "dark" : "light";
    if (contrast !== contrastRef.current) {
      contrastRef.current = contrast;
      setCurrentContrast(contrast);
    }
  }, [darknessRaw, headerBgOpacityRaw]);

  useMotionValueEvent(scrollY, "change", updateDarkness);

  useEffect(() => {
    const targetDarkness = 1;
    const initialBackdropOpacity =
      typeof window === "undefined" ? 0 : getHeaderBackdropOpacity(window.scrollY);

    darkness.jump(targetDarkness);
    darknessRaw.set(targetDarkness);
    headerBgOpacity.jump(initialBackdropOpacity);
    headerBgOpacityRaw.set(initialBackdropOpacity);

    const timeout = window.setTimeout(() => updateDarkness(window.scrollY), 50);

    return () => window.clearTimeout(timeout);
  }, [darkness, darknessRaw, headerBgOpacity, headerBgOpacityRaw, updateDarkness]);

  const textColor = useTransform(darkness, [0, 1], ["#171717", "#ffffff"]);
  const logoFilter = useTransform(
    darkness,
    [0, 1],
    ["brightness(0) invert(0)", "brightness(0) invert(1)"],
  );
  const secondaryBorder = useTransform(darkness, [0, 1], [
    "rgba(23, 23, 23, 0.28)",
    "rgba(255, 255, 255, 0.28)",
  ]);
  const secondaryBg = useTransform(darkness, [0, 1], ["#ffffff", "rgba(0, 0, 0, 0)"]);
  const primaryBg = useTransform(darkness, [0, 1], ["#171717", "#ffffff"]);
  const primaryText = useTransform(darkness, [0, 1], ["#ffffff", "#171717"]);
  const headerBg = useTransform(darkness, [0, 1], [
    "rgba(255, 255, 255, 0.85)",
    "rgba(10, 10, 10, 1)",
  ]);

  const scrollToTop = () => {
    setMobileMenuOpen(false);
    lenis?.scrollTo(0, { duration: 1 });
  };

  const scrollToTarget = (target: string) => {
    const element = document.getElementById(target);

    setMobileMenuOpen(false);

    if (!element) {
      return;
    }

    lenis?.scrollTo(element, { duration: 1.2 });
  };

  const handleNavItemClick = (item: HeaderNavItem) => {
    scrollToTarget(item.target);
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <motion.header
        className="fixed left-0 right-0 top-0 z-[var(--mf-z-header)] w-full"
        data-contrast={currentContrast}
      >
        <motion.div
          className="absolute inset-0 h-24 pointer-events-none"
          style={{
            backgroundColor: headerBg,
            opacity: headerBgOpacity,
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, transparent 100%)",
          }}
        />

        <PageContainer className="relative z-10 mt-2 grid h-16 grid-cols-[auto_1fr_auto] items-center">
          <HeaderLogoButton filter={logoFilter} onClick={scrollToTop} />

          <HeaderDesktopNav
            textColor={textColor}
            onItemClick={handleNavItemClick}
            className="hidden min-[1100px]:flex"
          />
          <div className="min-[1100px]:hidden" />

          <div className="flex items-center justify-end gap-4">
            <HeaderDesktopActions
              textColor={textColor}
              primaryBg={primaryBg}
              primaryText={primaryText}
              secondaryBorder={secondaryBorder}
              secondaryBg={secondaryBg}
              onSecondaryClick={() => scrollToTarget("footer")}
              onPrimaryClick={() => scrollToTarget("closing-cta")}
              className="hidden min-[1100px]:flex"
            />
            <HeaderMobileMenuButton
              textColor={textColor}
              onClick={() => setMobileMenuOpen(true)}
              isOpen={mobileMenuOpen}
              className="min-[1100px]:hidden"
            />
          </div>
        </PageContainer>
      </motion.header>

      <HeaderMobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onLogoClick={scrollToTop}
        onItemClick={handleNavItemClick}
        onSecondaryClick={() => scrollToTarget("footer")}
        onPrimaryClick={() => scrollToTarget("closing-cta")}
      />
    </>,
    document.body,
  );
}
