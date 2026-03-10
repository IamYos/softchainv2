"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { BeamButton } from "@/components/marketing/BeamButton";
import { HeaderLogoButton } from "@/components/marketing/header/HeaderLogoButton";
import {
  HEADER_NAV_ITEMS,
  type HeaderNavItem,
} from "@/components/marketing/header/navigation";

type HeaderMobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogoClick: () => void;
  onItemClick: (item: HeaderNavItem) => void;
  onSecondaryClick: () => void;
  onPrimaryClick: () => void;
};

export function HeaderMobileMenu({
  isOpen,
  onClose,
  onLogoClick,
  onItemClick,
  onSecondaryClick,
  onPrimaryClick,
}: HeaderMobileMenuProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    if (isOpen) {
      el.style.visibility = "visible";
      el.getBoundingClientRect();
      el.style.transform = "translate3d(0, 0, 0)";
      el.style.opacity = "1";
    } else {
      el.style.transform = "translate3d(100%, 0, 0)";
      el.style.opacity = "0";
      const onEnd = () => {
        if (!isOpen) el.style.visibility = "hidden";
      };
      el.addEventListener("transitionend", onEnd, { once: true });
      const timeout = setTimeout(onEnd, 500);
      return () => {
        clearTimeout(timeout);
        el.removeEventListener("transitionend", onEnd);
      };
    }
  }, [isOpen]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[var(--mf-z-modal)] flex flex-col p-6 min-[1100px]:hidden"
      style={{
        backgroundColor: "#000000",
        transform: "translate3d(100%, 0, 0)",
        opacity: 0,
        visibility: "hidden",
        transition: "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease",
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <div className="mb-8 flex items-center justify-between">
        <HeaderLogoButton
          filter="brightness(0) invert(1)"
          onClick={onLogoClick}
          ariaLabel="Scroll to top"
        />
        <button
          type="button"
          onClick={onClose}
          className="group flex min-h-[44px] min-w-[44px] items-center justify-center p-2 text-white cursor-pointer"
          aria-label="Close menu"
          style={{
            transform: "rotate(90deg)",
            transition: "transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "rotate(180deg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "rotate(90deg)";
          }}
        >
          <X size={24} />
        </button>
      </div>

      <nav
        className="flex flex-col gap-2 text-xl font-medium text-white"
        aria-label="Mobile navigation"
      >
        {HEADER_NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            className="link-underline min-h-[44px] w-fit cursor-pointer py-3 text-left text-white"
            onClick={() => onItemClick(item)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <BeamButton
          onClick={onSecondaryClick}
          className="w-full rounded bg-transparent py-3 text-base font-medium text-white border border-white/20 hover:bg-white/[0.06]"
        >
          Contact
        </BeamButton>
        <BeamButton
          onClick={onPrimaryClick}
          theme="light"
          className="w-full rounded border border-transparent py-3 text-base font-medium"
        >
          Book a Call
        </BeamButton>
      </div>
    </div>
  );
}
