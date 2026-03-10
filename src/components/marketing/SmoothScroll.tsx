"use client";

import Lenis from "lenis";
import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SmoothScrollContextValue = {
  lenis: Lenis | null;
  setSlowZoneEnd: (value: number) => void;
  viewportRef: RefObject<HTMLDivElement | null>;
  scrollWrapperRef: RefObject<HTMLDivElement | null>;
  scrollContentRef: RefObject<HTMLDivElement | null>;
};

const NULL_DIV_REF = { current: null } as RefObject<HTMLDivElement | null>;

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  setSlowZoneEnd: () => {},
  viewportRef: NULL_DIV_REF,
  scrollWrapperRef: NULL_DIV_REF,
  scrollContentRef: NULL_DIV_REF,
});

export function useLenis() {
  return useContext(SmoothScrollContext).lenis;
}

export function useScrollShell() {
  const { viewportRef, scrollWrapperRef, scrollContentRef } = useContext(SmoothScrollContext);

  return { viewportRef, scrollWrapperRef, scrollContentRef };
}

export function useSlowZone(endY: number) {
  const { setSlowZoneEnd } = useContext(SmoothScrollContext);

  useEffect(() => {
    setSlowZoneEnd(endY);

    return () => setSlowZoneEnd(0);
  }, [endY, setSlowZoneEnd]);
}

type SmoothScrollProps = {
  children: ReactNode;
  overlay?: ReactNode;
};

const SLOW_ZONE_MULTIPLIER = 0.5;

export function SmoothScroll({ children, overlay }: SmoothScrollProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const slowZoneEndRef = useRef(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  const setSlowZoneEnd = useMemo(
    () => (value: number) => {
      slowZoneEndRef.current = value;
    },
    [],
  );

  useEffect(() => {
    const wrapper = scrollWrapperRef.current;
    const content = scrollContentRef.current;

    if (!wrapper || !content) {
      return;
    }

    const instance = new Lenis({
      wrapper,
      content,
      eventsTarget: wrapper,
      autoRaf: false,
      // Disabled: syncTouch hijacks native touch scrolling, causing
      // sluggish feel and blocking tap events on fixed-position elements.
      syncTouch: false,
      virtualScroll: (event) => {
        const threshold = slowZoneEndRef.current;

        if (threshold > 0 && instance.scroll < threshold) {
          event.deltaY *= SLOW_ZONE_MULTIPLIER;
        }

        return true;
      },
    });

    setLenis(instance);

    let frame = 0;

    const raf = (time: number) => {
      instance.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis,
        setSlowZoneEnd,
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
    </SmoothScrollContext.Provider>
  );
}
