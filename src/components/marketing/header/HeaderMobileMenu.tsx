"use client";

import { BeamButton } from "@/components/marketing/BeamButton";
import { HeaderMobileMenuButton } from "@/components/marketing/header/HeaderMobileMenuButton";
import {
  HEADER_NAV_ITEMS,
  type HeaderNavItem,
} from "@/components/marketing/header/navigation";

type HeaderMobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (item: HeaderNavItem) => void;
  onSecondaryClick: () => void;
  onPrimaryClick: () => void;
};

export function HeaderMobileMenu({
  isOpen,
  onClose,
  onItemClick,
  onSecondaryClick,
  onPrimaryClick,
}: HeaderMobileMenuProps) {
  return (
    <div
      className="fixed inset-0 z-40"
      style={{
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        visibility: isOpen ? "visible" : "hidden",
        transition: isOpen
          ? "opacity 0.4s ease"
          : "opacity 0.4s ease, visibility 0s linear 0.4s",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer border-0 bg-[#202020]"
        style={{
          opacity: isOpen ? 0.96 : 0,
          transition: "opacity 0.4s ease",
        }}
      />

      <div
        className="absolute inset-0 bg-[#ff5841] text-[#202020] md:inset-auto md:right-[2.4rem] md:top-[2.4rem] md:h-[min(50rem,calc(100vh-4.8rem))] md:min-h-[380px] md:w-[min(54rem,calc(100vw-4.8rem))] md:rounded-[8px] md:bg-[#b9b9b9]"
        style={{
          transform: isOpen ? "translate3d(0, 0, 0)" : "translate3d(100%, 0, 0)",
          transition: "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
          willChange: "transform",
        }}
      >
        <div className="absolute right-6 top-6 z-10 hidden md:block">
          <HeaderMobileMenuButton
            onClick={onClose}
            isOpen
            className="min-[1100px]:flex"
            style={{
              ["--header-menu-bg" as string]: "#b9b9b9",
              ["--header-menu-text" as string]: "#202020",
              ["--header-menu-focus" as string]: "#202020",
            }}
          />
        </div>

        <div className="flex h-full items-end px-6 pb-16 pt-24 md:px-10 md:pb-10 md:pt-[3.2rem]">
          <div className="w-full">
            <nav
              className="flex flex-col gap-3"
              aria-label="Primary navigation"
              style={{
                fontFamily: "var(--font-non-sans), var(--font-geist-sans), sans-serif",
                fontSize: "clamp(44px, 8vw, 72px)",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {HEADER_NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="w-fit cursor-pointer py-2 text-left text-[#202020] transition-opacity duration-200 hover:opacity-70"
                  onClick={() => onItemClick(item)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-12 flex flex-col gap-4 md:mt-16">
              <BeamButton
                onClick={onSecondaryClick}
                className="w-full rounded bg-transparent py-3 text-base font-medium text-[#202020] border border-[#202020]/20 hover:bg-[#202020]/5"
                style={{
                  color: "#202020",
                  borderColor: "rgba(32, 32, 32, 0.2)",
                  ["--beam-overlay" as string]: "rgba(32, 32, 32, 0.05)",
                  ["--btn-active-bg" as string]: "#202020",
                  ["--btn-active-text" as string]: "#b9b9b9",
                  ["--btn-active-border" as string]: "rgba(185, 185, 185, 0.35)",
                  fontFamily: "var(--font-aux-mono), monospace",
                  fontSize: "12px",
                  letterSpacing: "-0.24px",
                  lineHeight: "1.33",
                  textTransform: "uppercase",
                }}
              >
                Contact
              </BeamButton>
              <BeamButton
                onClick={onPrimaryClick}
                className="w-full rounded py-3 text-base font-medium"
                style={{
                  backgroundColor: "#202020",
                  color: "#b9b9b9",
                  borderColor: "transparent",
                  ["--beam-overlay" as string]: "rgba(255, 255, 255, 0.08)",
                  ["--btn-active-bg" as string]: "#b9b9b9",
                  ["--btn-active-text" as string]: "#202020",
                  ["--btn-active-border" as string]: "rgba(32, 32, 32, 0.18)",
                  fontFamily: "var(--font-aux-mono), monospace",
                  fontSize: "12px",
                  letterSpacing: "-0.24px",
                  lineHeight: "1.33",
                  textTransform: "uppercase",
                }}
              >
                Book a Call
              </BeamButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
