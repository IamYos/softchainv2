"use client";

import Lenis from "lenis";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SmoothScrollContextValue = {
  lenis: Lenis | null;
  setSlowZoneEnd: (value: number) => void;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  setSlowZoneEnd: () => {},
});

export function useLenis() {
  return useContext(SmoothScrollContext).lenis;
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
};

const SLOW_ZONE_MULTIPLIER = 0.5;

export function SmoothScroll({ children }: SmoothScrollProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const slowZoneEndRef = useRef(0);

  const setSlowZoneEnd = useMemo(
    () => (value: number) => {
      slowZoneEndRef.current = value;
    },
    [],
  );

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    const instance = new Lenis({
      autoRaf: false,
      syncTouch: isTouchDevice,
      virtualScroll: (event) => {
        const threshold = slowZoneEndRef.current;
        const isTouch = event.event instanceof TouchEvent;

        if (isTouch && threshold > 0 && instance.scroll < threshold) {
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
      document.documentElement.classList.remove(
        "lenis",
        "lenis-smooth",
        "lenis-stopped",
      );
      setLenis(null);
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ lenis, setSlowZoneEnd }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
