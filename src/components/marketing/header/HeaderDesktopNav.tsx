"use client";

import { HeaderNavLink } from "@/components/marketing/header/HeaderNavLink";
import {
  HEADER_NAV_ITEMS,
  type HeaderNavItem,
  type MarketingPageContext,
  resolveHeaderNavItem,
} from "@/components/marketing/header/navigation";

type HeaderDesktopNavProps = {
  onItemClick: (item: HeaderNavItem) => void;
  currentPage: MarketingPageContext;
  className?: string;
};

export function HeaderDesktopNav({
  onItemClick,
  currentPage,
  className = "",
}: HeaderDesktopNavProps) {
  return (
    <nav
      className={`min-w-0 items-center justify-center gap-6 whitespace-nowrap pl-6 text-[12px] ${className}`}
      aria-label="Main navigation"
    >
      {HEADER_NAV_ITEMS.map((item) => {
        const resolvedItem = resolveHeaderNavItem(item, currentPage);

        return (
        <HeaderNavLink
          key={item.label}
          onClick={() => onItemClick(item)}
          isActive={resolvedItem.isActive}
        >
          {item.label}
        </HeaderNavLink>
        );
      })}
    </nav>
  );
}
