"use client";

import {
  createContext,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useRef,
} from "react";

type ScrollContextValue = {
  scrollTo: (target: string | number, options?: { duration?: number }) => void;
  viewportRef: RefObject<HTMLDivElement | null>;
  scrollWrapperRef: RefObject<HTMLDivElement | null>;
  scrollContentRef: RefObject<HTMLDivElement | null>;
};

const NULL_DIV_REF = { current: null } as RefObject<HTMLDivElement | null>;

const ScrollContext = createContext<ScrollContextValue>({
  scrollTo: () => {},
  viewportRef: NULL_DIV_REF,
  scrollWrapperRef: NULL_DIV_REF,
  scrollContentRef: NULL_DIV_REF,
});

export function useLenis(): { scrollTo: ScrollContextValue["scrollTo"] } | null {
  const ctx = useContext(ScrollContext);
  return ctx.scrollTo ? { scrollTo: ctx.scrollTo } : null;
}

export function useScrollShell() {
  const { viewportRef, scrollWrapperRef, scrollContentRef } = useContext(ScrollContext);
  return { viewportRef, scrollWrapperRef, scrollContentRef };
}

export function useSlowZone() {
  // No-op: retained for compatibility with previous experiments.
}

type SmoothScrollProps = {
  children: ReactNode;
  overlay?: ReactNode;
};

export function SmoothScroll({ children, overlay }: SmoothScrollProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  // No scroll-restoration handling here — that runs synchronously in the
  // root layout's <head> via an inline script, before the browser would
  // otherwise restore the previous Y. Doing it in a useEffect causes a
  // visible flash because hydration runs after restoration.

  const scrollTo = useCallback(
    (target: string | number, options?: { duration?: number }) => {
      const behavior: ScrollBehavior = options?.duration === 0 ? "auto" : "smooth";

      if (typeof target === "number") {
        window.scrollTo({ top: target, behavior });
        return;
      }

      const selector = target.startsWith("#") ? target : `#${target}`;
      const element = document.querySelector<HTMLElement>(selector);
      if (element) {
        element.scrollIntoView({ behavior, block: "start" });
      }
    },
    [],
  );

  return (
    <ScrollContext.Provider
      value={{
        scrollTo,
        viewportRef,
        scrollWrapperRef,
        scrollContentRef,
      }}
    >
      <div ref={viewportRef} className="app-viewport-shell">
        {overlay}
        <div ref={scrollWrapperRef} className="app-scroll-wrapper">
          <div ref={scrollContentRef} className="app-scroll-content">
            {children}
          </div>
        </div>
      </div>
    </ScrollContext.Provider>
  );
}
