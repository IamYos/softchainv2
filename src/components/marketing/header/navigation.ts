export type HeaderNavItem = {
  label: string;
  target: string;
};

export const HEADER_MENU_OVERVIEW_ITEM: HeaderNavItem = {
  label: "Overview",
  target: "sf-solutions",
};

export const HEADER_MENU_SOLUTION_ITEMS: HeaderNavItem[] = [
  { label: "Software Engineering", target: "sf-solutions" },
  { label: "AI Systems", target: "sf-solutions" },
  { label: "Infrastructure", target: "sf-solutions" },
  { label: "Mobile Delivery", target: "sf-solutions" },
];

export const HEADER_MENU_ABOUT_ITEMS: HeaderNavItem[] = [
  { label: "Company Profile", target: "sf-insights" },
  { label: "Global Delivery", target: "sf-insights" },
];

export const HEADER_MENU_SECONDARY_ITEMS: HeaderNavItem[] = [
  { label: "Insights", target: "sf-insights" },
  { label: "Contact", target: "closing-cta" },
];

export const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  HEADER_MENU_OVERVIEW_ITEM,
  ...HEADER_MENU_SECONDARY_ITEMS,
];
