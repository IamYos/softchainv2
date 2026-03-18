"use client";

import { useState } from "react";
import {
  HEADER_MENU_SECONDARY_ITEMS,
  HEADER_MENU_SOLUTION_ITEMS,
  type HeaderNavItem,
} from "@/components/marketing/header/navigation";

type HeaderMobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (item: HeaderNavItem) => void;
  onPrimaryClick: () => void;
};

export function HeaderMobileMenu({
  isOpen,
  onClose,
  onItemClick,
  onPrimaryClick,
}: HeaderMobileMenuProps) {
  const [openSection, setOpenSection] = useState<"solutions" | null>(null);

  const menuItemStyle = {
    fontFamily: "var(--font-non-sans), var(--font-geist-sans), sans-serif",
    fontSize: "clamp(44px, 8vw, 72px)",
    fontWeight: 500,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  } as const;

  const submenuItemStyle = {
    fontFamily: "var(--font-non-sans), var(--font-geist-sans), sans-serif",
    fontSize: "clamp(22px, 4.2vw, 30px)",
    fontWeight: 500,
    letterSpacing: "-0.02em",
    lineHeight: 1.02,
  } as const;

  const toggleSection = (section: "solutions") => {
    setOpenSection((current) => (current === section ? null : section));
  };

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
        onTransitionEnd={(event) => {
          if (event.target !== event.currentTarget || event.propertyName !== "transform" || isOpen) {
            return;
          }

          setOpenSection(null);
        }}
      >
        <div className="flex h-full overflow-y-auto px-6 pb-16 pt-24 md:px-10 md:pb-10 md:pt-[3.2rem]">
          <div className="mt-auto w-full">
            <nav
              className="flex flex-col gap-3"
              aria-label="Primary navigation"
              style={menuItemStyle}
            >
              <div>
                <button
                  type="button"
                  className="w-fit cursor-pointer py-2 text-left text-[#202020] transition-opacity duration-200 hover:opacity-70"
                  aria-expanded={openSection === "solutions"}
                  onClick={() => toggleSection("solutions")}
                >
                  Solutions
                  <sup className="ml-1 align-top text-[0.38em]">
                    {HEADER_MENU_SOLUTION_ITEMS.length}
                  </sup>
                </button>
                <div
                  className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    openSection === "solutions" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                  aria-hidden={openSection !== "solutions"}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div
                      className={`flex flex-col gap-3 pb-2 pl-8 pt-2 transition-transform duration-300 ease-out ${
                        openSection === "solutions" ? "translate-y-0" : "-translate-y-2"
                      }`}
                    >
                      {HEADER_MENU_SOLUTION_ITEMS.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          className="flex w-fit cursor-pointer items-start gap-3 text-left text-[#202020] transition-opacity duration-200 hover:opacity-70"
                          style={submenuItemStyle}
                          tabIndex={openSection === "solutions" ? 0 : -1}
                          onClick={() => onItemClick(item)}
                        >
                          <span aria-hidden="true" className="pt-[0.08em] text-[0.9em]">
                            ↳
                          </span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {HEADER_MENU_SECONDARY_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="w-fit cursor-pointer py-2 text-left text-[#202020] transition-opacity duration-200 hover:opacity-70"
                  onClick={() => onItemClick(item)}
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
