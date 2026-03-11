"use client";

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

            <div className="mx-auto mt-12 flex w-full max-w-[360px] flex-col gap-4 md:mt-16 lg:mx-0">
              <button
                type="button"
                onClick={onSecondaryClick}
                className="frame1-cm-btn w-full"
                style={{
                  minWidth: "0",
                  ["--frame1-cm-bg" as string]: "#b9b9b9",
                  ["--frame1-cm-border" as string]: "rgba(32, 32, 32, 0.28)",
                  ["--frame1-cm-text" as string]: "#202020",
                  ["--frame1-cm-hover-bg" as string]: "#202020",
                  ["--frame1-cm-hover-border" as string]: "#b9b9b9",
                  ["--frame1-cm-hover-text" as string]: "#b9b9b9",
                  ["--frame1-cm-focus" as string]: "#202020",
                }}
              >
                <span>Contact</span>
              </button>
              <button
                type="button"
                onClick={onPrimaryClick}
                className="frame1-cm-btn w-full"
                style={{
                  minWidth: "0",
                  ["--frame1-cm-bg" as string]: "#202020",
                  ["--frame1-cm-border" as string]: "rgba(32, 32, 32, 0.28)",
                  ["--frame1-cm-text" as string]: "#b9b9b9",
                  ["--frame1-cm-hover-bg" as string]: "#b9b9b9",
                  ["--frame1-cm-hover-border" as string]: "rgba(32, 32, 32, 0.28)",
                  ["--frame1-cm-hover-text" as string]: "#202020",
                  ["--frame1-cm-focus" as string]: "#202020",
                }}
              >
                <span>Book a Call</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
