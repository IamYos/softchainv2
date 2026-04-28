"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { scrollToHashWhenReady } from "@/components/navigation/scrollTargets";

export function RouteScrollManager() {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);
  const isHistoryNavigationRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      isHistoryNavigationRef.current = true;
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useLayoutEffect(() => {
    if (previousPathnameRef.current === null) {
      previousPathnameRef.current = pathname;
      return;
    }

    if (previousPathnameRef.current === pathname) {
      return;
    }

    previousPathnameRef.current = pathname;

    if (isHistoryNavigationRef.current) {
      isHistoryNavigationRef.current = false;
      return;
    }

    const hash = window.location.hash;

    window.requestAnimationFrame(() => {
      if (hash) {
        scrollToHashWhenReady(hash);
        return;
      }

      window.scrollTo(0, 0);
    });
  }, [pathname]);

  return null;
}
