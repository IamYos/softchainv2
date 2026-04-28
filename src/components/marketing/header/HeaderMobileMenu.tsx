"use client";

import {
  HEADER_MENU_SECONDARY_ITEMS,
  type HeaderNavItem,
  type MarketingPageContext,
  resolveHeaderNavItem,
} from "@/components/marketing/header/navigation";

type HeaderMobileMenuProps = {
  currentPage: MarketingPageContext;
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (item: HeaderNavItem) => void;
  onPrimaryClick: () => void;
};

export function HeaderMobileMenu({
  currentPage,
  isOpen,
  onClose,
  onItemClick,
  onPrimaryClick,
}: HeaderMobileMenuProps) {
  const menuItemStyle = {
    fontFamily: "var(--font-non-sans), var(--font-geist-sans), sans-serif",
    fontSize: "clamp(44px, 8vw, 72px)",
    fontWeight: 500,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  } as const;

  const secondaryItems = HEADER_MENU_SECONDARY_ITEMS.map((item) =>
    resolveHeaderNavItem(item, currentPage),
  );

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
        <div className="flex h-full overflow-y-auto px-6 pb-16 pt-24 md:px-10 md:pb-10 md:pt-[3.2rem]">
          <div className="mt-auto w-full">
            <nav
              className="flex flex-col gap-3"
              aria-label="Primary navigation"
              style={menuItemStyle}
            >
              {secondaryItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  // Active item uses the panel's *opposite* accent so it never
                  // sits the-same-color on its background:
                  //   mobile panel = #ff5841 (orange) → active text = #b9b9b9 (gray)
                  //   desktop panel = #b9b9b9 (gray)  → active text = #ff5841 (orange)
                  // Inactive items stay dark — readable on both panel colors.
                  className={`w-fit cursor-pointer py-2 text-left transition-opacity duration-200 hover:opacity-70 ${
                    item.isActive
                      ? "text-[#b9b9b9] opacity-100 md:text-[#ff5841]"
                      : "text-[#202020]"
                  }`}
                  onClick={() => onItemClick(item)}
                  aria-current={item.isActive ? "page" : undefined}
                >
                  {item.label}
                </button>
              ))}

              <button
                type="button"
                className="w-fit cursor-pointer py-2 text-left text-[#b9b9b9] transition-opacity duration-200 hover:opacity-70 md:text-[#ff5841]"
                style={{
                  ...menuItemStyle,
                }}
                onClick={onPrimaryClick}
              >
                <span>Book a Call</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
