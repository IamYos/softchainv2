"use client";

import { AnimatePresence, motion } from "framer-motion";
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
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[var(--mf-z-modal)] flex flex-col p-6 min-[1100px]:hidden"
          style={{ backgroundColor: "#000000" }}
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
            <motion.button
              type="button"
              onClick={onClose}
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
              className="w-full rounded border border-transparent bg-white py-3 text-base font-medium text-black"
            >
              Book a Call
            </BeamButton>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
