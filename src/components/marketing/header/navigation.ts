export type MarketingPageContext = "home" | "about";

export type HeaderNavItem = {
  label: string;
  href: string;
  homeTarget?: string;
  activeOn?: MarketingPageContext;
};

export type ResolvedHeaderNavItem =
  | (HeaderNavItem & {
      isActive: boolean;
      kind: "href";
    })
  | (HeaderNavItem & {
      isActive: boolean;
      kind: "scroll";
      target: string;
    });

export const HEADER_MENU_SOLUTION_ITEMS: HeaderNavItem[] = [
  {
    label: "Software Design & Engineering",
    href: "/#sf-solutions",
    homeTarget: "sf-solutions",
  },
  {
    label: "AI Systems",
    href: "/#sf-solutions",
    homeTarget: "sf-solutions",
  },
  {
    label: "IT Infrastructure",
    href: "/#sf-solutions",
    homeTarget: "sf-solutions",
  },
  {
    label: "Technology Management",
    href: "/#sf-solutions",
    homeTarget: "sf-solutions",
  },
];

export const HEADER_MENU_SECONDARY_ITEMS: HeaderNavItem[] = [
  {
    label: "About",
    href: "/about",
    activeOn: "about",
  },
  {
    label: "Insights",
    href: "/#sf-insights",
    homeTarget: "sf-insights",
  },
];

export const HEADER_NAV_ITEMS: HeaderNavItem[] = [...HEADER_MENU_SECONDARY_ITEMS];

export function resolveHeaderNavItem(
  item: HeaderNavItem,
  currentPage: MarketingPageContext,
): ResolvedHeaderNavItem {
  const isActive = item.activeOn === currentPage;

  if (currentPage === "home" && item.homeTarget) {
    return {
      ...item,
      isActive,
      kind: "scroll",
      target: item.homeTarget,
    };
  }

  return {
    ...item,
    isActive,
    kind: "href",
  };
}

export function getHeaderNavHref(
  item: HeaderNavItem,
  currentPage: MarketingPageContext,
) {
  const resolvedItem = resolveHeaderNavItem(item, currentPage);

  if (resolvedItem.kind === "scroll") {
    return `#${resolvedItem.target}`;
  }

  return resolvedItem.href;
}

export function getContactDestination(currentPage: MarketingPageContext) {
  if (currentPage === "home") {
    return {
      kind: "scroll" as const,
      target: "closing-cta",
    };
  }

  return {
    kind: "href" as const,
    href: "/#closing-cta",
  };
}

export function getLogoDestination(currentPage: MarketingPageContext) {
  if (currentPage === "home") {
    return {
      kind: "scroll" as const,
      target: 0,
    };
  }

  return {
    kind: "href" as const,
    href: "/",
  };
}
