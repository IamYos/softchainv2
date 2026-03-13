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

export function useSlowZone(_endY: number) {
  // No-op: slow zones are not needed with snap scrolling
}

type SmoothScrollProps = {
  children: ReactNode;
  overlay?: ReactNode;
};

export function SmoothScroll({ children, overlay }: SmoothScrollProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback(
    (target: string | number, _options?: { duration?: number }) => {
      const wrapper = scrollWrapperRef.current;
      if (!wrapper) return;

      if (typeof target === "number") {
        wrapper.scrollTo({ top: target, behavior: "smooth" });
        return;
      }

      const selector = target.startsWith("#") ? target : `#${target}`;
      const element = wrapper.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
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
