"use client";

import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BeamButton } from "@/components/marketing/BeamButton";
import { PageContainer } from "@/components/marketing/PageContainer";
import { SoftchainMark } from "@/components/marketing/SoftchainMark";
import { useLenis } from "@/components/marketing/SmoothScroll";

const NAV_ITEMS = [
  { label: "Software", target: "capabilities" },
  { label: "Infrastructure", target: "delivery" },
  { label: "AI Systems", target: "closing-cta" },
];

export function Header() {
  const lenis = useLenis();
  const { scrollY } = useScroll();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const darkness = useSpring(1, { stiffness: 120, damping: 24, mass: 1 });
  const headerBgOpacity = useSpring(0, { stiffness: 180, damping: 30, mass: 1 });

  useMotionValueEvent(scrollY, "change", (latest) => {
    const heroRange = typeof window !== "undefined" ? window.innerHeight * 1.2 : 900;
    const fadeStart = heroRange * 0.08;
    const fadeEnd = heroRange * 0.6;
    const nextOpacity =
      latest <= fadeStart ? 0 : latest >= fadeEnd ? 1 : (latest - fadeStart) / (fadeEnd - fadeStart);

    headerBgOpacity.set(nextOpacity);
    darkness.set(1);
  });

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [mobileMenuOpen]);

  const textColor = useTransform(darkness, [0, 1], ["#171717", "#ffffff"]);
  const primaryBg = useTransform(darkness, [0, 1], ["#171717", "#ffffff"]);
  const primaryText = useTransform(darkness, [0, 1], ["#ffffff", "#171717"]);
  const secondaryBorder = useTransform(darkness, [0, 1], [
    "rgba(23,23,23,0.18)",
    "rgba(255,255,255,0.28)",
  ]);
  const headerBg = useTransform(darkness, [0, 1], [
    "rgba(255,255,255,0.85)",
    "rgba(10,10,10,1)",
  ]);

  const scrollToTarget = (target: string) => {
    const element = document.getElementById(target);
    if (!element) return;
    lenis?.scrollTo(element, { duration: 1.2 });
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header className="fixed left-0 right-0 top-0 z-50 h-24 pointer-events-none">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: headerBg,
            opacity: headerBgOpacity,
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, transparent 100%)",
          }}
        />
        <PageContainer className="relative z-10 mt-2 grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4 pointer-events-auto">
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => lenis?.scrollTo(0, { duration: 1 })}
            aria-label="Scroll to top"
          >
            <SoftchainMark brightness={darkness} />
          </button>

          <motion.nav
            className="hidden items-center justify-center gap-6 pl-6 md:flex"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {NAV_ITEMS.map((item) => (
              <motion.button
                key={item.label}
                type="button"
                onClick={() => scrollToTarget(item.target)}
                className="relative cursor-pointer text-base font-medium"
                style={{ color: textColor }}
                whileHover={{ opacity: 1 }}
                initial={{ opacity: 0.55 }}
                animate={{ opacity: 0.55 }}
              >
                {item.label}
              </motion.button>
            ))}
          </motion.nav>

          <div className="hidden items-center justify-end gap-3 md:flex">
            <motion.button
              type="button"
              onClick={() => scrollToTarget("footer")}
              className="min-h-[44px] rounded border px-4 py-2 text-sm font-medium"
              style={{ color: textColor, borderColor: secondaryBorder }}
            >
              Contact
            </motion.button>
            <BeamButton
              onClick={() => scrollToTarget("closing-cta")}
              theme="light"
              style={{ backgroundColor: primaryBg, color: primaryText } as never}
            >
              Book a Call
            </BeamButton>
          </div>

          <motion.button
            type="button"
            className="ml-auto flex min-h-[44px] min-w-[44px] items-center justify-center md:hidden"
            style={{ color: textColor }}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </motion.button>
        </PageContainer>
      </motion.header>

      {mobileMenuOpen ? (
        <motion.div
          className="fixed inset-0 z-[var(--mf-z-modal)] flex flex-col bg-[rgba(10,10,10,0.98)] p-6 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between">
            <SoftchainMark brightness={darkness} />
            <button
              type="button"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-white"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>
          <div className="mt-16 flex flex-1 flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                className="link-underline w-fit py-3 text-left text-3xl text-white"
                onClick={() => scrollToTarget(item.target)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="min-h-[48px] rounded border border-white/20 px-5 text-white"
              onClick={() => scrollToTarget("footer")}
            >
              Contact
            </button>
            <BeamButton onClick={() => scrollToTarget("closing-cta")} theme="light">
              Book a Call
            </BeamButton>
          </div>
        </motion.div>
      ) : null}
    </>
  );
}
