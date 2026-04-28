export type MarketingPageContext = "home" | "about" | "solutions" | "insights";

export type HeaderNavItem = {
  label: string;
  href: string;
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
    })
  | (HeaderNavItem & {
      isActive: boolean;
      kind: "scroll-top";
    });

export type HeaderHrefDestination = {
  kind: "href";
  href: string;
};

export type HeaderScrollDestination<Target extends string | number = string | number> = {
  kind: "scroll";
  target: Target;
};

export type HeaderDestination = HeaderHrefDestination | HeaderScrollDestination;

export const HEADER_MENU_SECONDARY_ITEMS: HeaderNavItem[] = [
  {
    label: "Solutions",
    href: "/solutions",
    activeOn: "solutions",
  },
  {
    label: "About",
    href: "/about",
    activeOn: "about",
  },
  {
    label: "Insights",
    href: "/insights",
    activeOn: "insights",
  },
];

export const HEADER_NAV_ITEMS: HeaderNavItem[] = [...HEADER_MENU_SECONDARY_ITEMS];

export function resolveHeaderNavItem(
  item: HeaderNavItem,
  currentPage: MarketingPageContext,
): ResolvedHeaderNavItem {
  const isActive = item.activeOn === currentPage;

  // Already on the destination page — don't re-route, just bring the user
  // back to the top. Avoids the bulky "navigate to same URL" flash and
  // gives a useful affordance for repeated clicks on the active item.
  if (isActive) {
    return { ...item, isActive, kind: "scroll-top" };
  }

  // Otherwise: navigate to the actual page. Every nav item maps to a real
  // route; clicking it should open that page, not scroll to an inline
  // teaser on whichever page you're currently on.
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
  // The "scroll-top" case is the active item on the active page — keep the
  // visible href stable so middle-click / right-click "Open in new tab"
  // still produces a sensible URL.
  if (resolvedItem.kind === "scroll-top") {
    return resolvedItem.href;
  }

  return resolvedItem.href;
}

// Every marketing page renders <SFContactForm /> with
// id="closing-cta" - scroll to it in-place instead of bouncing through the home
// route, which used to flash home then jump to the CTA on solutions/about.
export function getContactDestination(): HeaderScrollDestination<string> {
  return {
    kind: "scroll" as const,
    target: "closing-cta",
  };
}

export function getLogoDestination(
  currentPage: MarketingPageContext,
): HeaderDestination {
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
