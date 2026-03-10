"use client";

import {
  AnimatePresence,
  motion,
  type MotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { X } from "lucide-react";
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

function NavLink({
  children,
  onClick,
  textColor,
}: {
  children: React.ReactNode;
  onClick: () => void;
  textColor: MotionValue<string>;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative flex cursor-pointer flex-col items-center justify-center transition-opacity duration-300"
      style={{ color: textColor, opacity: isHovered ? 1 : 0.5 }}
    >
      <div className="relative">
        <span className="relative z-10 font-medium">{children}</span>
        {isHovered ? (
          <>
            <motion.span
              className="pointer-events-none absolute inset-0 z-20 select-none bg-clip-text font-medium text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent 0%, var(--mf-brand-blue) 45%, var(--mf-brand-red) 55%, transparent 100%)",
                backgroundSize: "200% 100%",
              }}
              initial={{ backgroundPosition: "150% 0" }}
              animate={{ backgroundPosition: "-50% 0" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {children}
            </motion.span>
            <motion.div
              className="absolute -bottom-1.5 left-0 right-0 h-px"
              style={{ backgroundColor: "currentColor" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </>
        ) : null}
      </div>
    </motion.button>
  );
}

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
      lenis?.start();
      return;
    }

    document.body.style.overflow = "hidden";
    lenis?.stop();

    return () => {
      document.body.style.removeProperty("overflow");
      lenis?.start();
    };
  }, [lenis, mobileMenuOpen]);

  const textColor = useTransform(darkness, [0, 1], ["#171717", "#ffffff"]);
  const primaryBg = useTransform(darkness, [0, 1], ["#171717", "#ffffff"]);
  const primaryText = useTransform(darkness, [0, 1], ["#ffffff", "#171717"]);
  const secondaryBorder = useTransform(darkness, [0, 1], [
    "rgba(23,23,23,0.18)",
    "rgba(255,255,255,0.28)",
  ]);
  const secondaryBg = useTransform(darkness, [0, 1], ["#ffffff", "transparent"]);
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
      <motion.header
        className="fixed left-0 right-0 top-0 z-50 h-24 pointer-events-none"
        data-contrast="light"
      >
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
        <PageContainer className="relative z-10 mt-2 grid h-16 grid-cols-[auto_1fr_auto] items-center pointer-events-auto">
          <motion.button
            type="button"
            className="relative h-[28px] w-[130px] cursor-pointer shrink-0"
            onClick={() => lenis?.scrollTo(0, { duration: 1 })}
            aria-label="Scroll to top"
          >
            <SoftchainMark brightness={darkness} />
          </motion.button>

          <AnimatePresence mode="wait" initial={false}>
            <motion.nav
              key="desktop-nav"
              className="hidden min-[1100px]:flex items-center justify-center gap-6 min-w-0 whitespace-nowrap pl-6 text-[16px]"
              aria-label="Main navigation"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.label}
                  onClick={() => scrollToTarget(item.target)}
                  textColor={textColor}
                >
                  {item.label}
                </NavLink>
              ))}
            </motion.nav>
          </AnimatePresence>

          <div className="flex items-center justify-end gap-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key="desktop-buttons"
                className="hidden min-[1100px]:flex items-center gap-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <BeamButton
                  onClick={() => scrollToTarget("footer")}
                  className="rounded px-4 py-2 text-sm font-medium border transition-colors duration-300"
                  theme="light"
                  style={{
                    borderColor: secondaryBorder,
                    backgroundColor: secondaryBg,
                    color: textColor,
                  } as never}
                >
                  Contact
                </BeamButton>
                <BeamButton
                  onClick={() => scrollToTarget("closing-cta")}
                  className="rounded px-4 py-2 text-sm font-medium border transition-colors duration-300 whitespace-nowrap"
                  style={{
                    borderColor: secondaryBorder,
                    backgroundColor: primaryBg,
                    color: primaryText,
                  } as never}
                >
                  Book a Call
                </BeamButton>
              </motion.div>
            </AnimatePresence>

            <motion.button
              type="button"
              key="mobile-menu-toggle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={() => setMobileMenuOpen(true)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center cursor-pointer p-2 min-[1100px]:hidden"
              style={{ color: textColor }}
              aria-label="Open menu"
              whileHover="hover"
            >
              <motion.span
                className="flex flex-col gap-[5px]"
                variants={{
                  hover: {
                    transition: { staggerChildren: 0.05 },
                  },
                }}
              >
                {[0, 1, 2].map((index) => (
                  <motion.span
                    key={index}
                    className="block h-[2px] w-5 rounded-full"
                    style={{ backgroundColor: "currentColor" }}
                    variants={{
                      hover: {
                        y: [0, -2, 0],
                        transition: {
                          duration: 0.3,
                          ease: [0.25, 0.1, 0.25, 1],
                        },
                      },
                    }}
                  />
                ))}
              </motion.span>
            </motion.button>
          </div>
        </PageContainer>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            className="fixed inset-0 z-[var(--mf-z-modal)] flex flex-col p-6 min-[1100px]:hidden"
            style={{ backgroundColor: "#000000" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <button
                type="button"
                className="relative h-[28px] w-[130px] cursor-pointer"
                onClick={() => {
                  lenis?.scrollTo(0, { duration: 1 });
                  setMobileMenuOpen(false);
                }}
                aria-label="Scroll to top"
              >
                <SoftchainMark brightness={darkness} />
              </button>
              <motion.button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center p-2 text-white cursor-pointer"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                aria-label="Close menu"
              >
                <X size={24} />
              </motion.button>
            </div>

            <nav
              className="flex flex-col gap-2 text-xl font-medium text-white"
              aria-label="Mobile navigation"
            >
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="link-underline min-h-[44px] w-fit cursor-pointer py-3 text-left text-white"
                  onClick={() => scrollToTarget(item.target)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-4">
              <BeamButton
                onClick={() => scrollToTarget("footer")}
                className="w-full rounded bg-transparent py-3 text-base font-medium text-white border border-white/20 hover:bg-white/[0.06]"
              >
                Contact
              </BeamButton>
              <BeamButton
                onClick={() => scrollToTarget("closing-cta")}
                className="w-full rounded border border-transparent bg-white py-3 text-base font-medium text-black"
              >
                Book a Call
              </BeamButton>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
