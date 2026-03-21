"use client";

import { ReactNode } from "react";
import { CustomCursor } from "@/components/marketing/CustomCursor";
import { Header } from "@/components/marketing/Header";
import {
  MarketingPerfOverlay,
  PerfSection,
} from "@/components/marketing/MarketingPerfDebug";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import { useDevFlags } from "@/components/marketing/useDevFlags";
import { type MarketingPageContext } from "@/components/marketing/header/navigation";

type MarketingPageShellProps = {
  children: ReactNode;
  currentPage: MarketingPageContext;
  cursorRgb?: string;
};

export function MarketingPageShell({
  children,
  currentPage,
  cursorRgb = "255, 88, 65",
}: MarketingPageShellProps) {
  const { noCursor } = useDevFlags();

  return (
    <SmoothScroll
      overlay={
        <>
          <PerfSection id="Header">
            <Header currentPage={currentPage} />
          </PerfSection>
          {!noCursor ? (
            <PerfSection id="CustomCursor">
              <CustomCursor rgb={cursorRgb} />
            </PerfSection>
          ) : null}
          <MarketingPerfOverlay />
        </>
      }
    >
      {children}
    </SmoothScroll>
  );
}
