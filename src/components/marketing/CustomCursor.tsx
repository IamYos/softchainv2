"use client";

import { CSSProperties, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type CustomCursorProps = {
  rgb?: string;
};

type ResolvedColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

const CURSOR_CONTRAST_RGB = "32, 32, 32";

function parseResolvedColor(value: string): ResolvedColor | null {
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;

  const parts = match[1].split(",").map((p) => Number.parseFloat(p.trim()));
  const [r, g, b, a = 1] = parts;
  if ([r, g, b, a].some((n) => Number.isNaN(n))) return null;
  return { r, g, b, a };
}

// Perceived brightness in [0,1] — standard luminance weighting.
function luminance(c: ResolvedColor): number {
  return (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;
}

// Luminance of the two cursor tones we can pick between.
const ORANGE_LUM = (0.299 * 255 + 0.587 * 88 + 0.114 * 65) / 255; // ≈ 0.53
const CONTRAST_LUM = 32 / 255; // ≈ 0.125

function contrast(a: number, b: number): number {
  const hi = Math.max(a, b) + 0.05;
  const lo = Math.min(a, b) + 0.05;
  return hi / lo;
}

// Effective bg at the pointer: topmost element with a non-transparent
// background. Walking siblings/ancestors (the old approach) produced the
// "always black" bug — a dark button inside the orange contact section
// would still pick up the section color from a parent and flip to contrast,
// even though the dark surface was directly under the cursor.
function effectiveBackground(x: number, y: number): ResolvedColor | null {
  const els = document.elementsFromPoint(x, y);
  for (const el of els) {
    const bg = parseResolvedColor(window.getComputedStyle(el).backgroundColor);
    if (bg && bg.a >= 0.4) return bg;
  }
  return null;
}

function getCursorRgbOverride(element: Element | null): string | null {
  let current = element;
  while (current && current !== document.documentElement) {
    if (current instanceof HTMLElement) {
      const override = current.dataset.softchainCursorRgb;
      if (override) return override;
    }
    current = current.parentElement;
  }
  return null;
}

const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function CustomCursor({ rgb = "255, 88, 65" }: CustomCursorProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  // Detect client without a setState-in-effect; needed because the cursor
  // must live in document.body (not inside the marketing viewport shell —
  // that shell uses `isolation: isolate`, which traps any z-index inside
  // its own stacking context, so modals portaled to body would paint above
  // the cursor).
  const mounted = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!mounted) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const layer = layerRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!layer || !ring || !dot) return;

    document.body.dataset.softchainCursor = "on";
    layer.style.setProperty("--softchain-cursor-rgb", rgb);

    let frameId = 0;
    let activeCursorRgb = rgb;
    const state = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.5,
      targetX: window.innerWidth * 0.5,
      targetY: window.innerHeight * 0.5,
      dotX: window.innerWidth * 0.5,
      dotY: window.innerHeight * 0.5,
      visible: false,
      scale: 1,
      targetScale: 1,
    };

    const setCursorRgb = (nextRgb: string) => {
      if (nextRgb === activeCursorRgb) return;
      activeCursorRgb = nextRgb;
      layer.style.setProperty("--softchain-cursor-rgb", nextRgb);
    };

    const syncCursorTone = (clientX: number, clientY: number) => {
      // Explicit override wins — any ancestor of any stacked element can pin
      // the cursor tone via data-softchain-cursor-rgb.
      const stacked = document.elementsFromPoint(clientX, clientY);
      const override = stacked
        .map((el) => getCursorRgbOverride(el))
        .find((v): v is string => Boolean(v));
      if (override) {
        setCursorRgb(override);
        return;
      }

      // Otherwise pick whichever tone (orange vs near-black) has the higher
      // contrast ratio against the topmost opaque background. This handles
      // every surface: orange section → dark cursor, dark buttons/modal →
      // orange cursor, light/gray surfaces → dark cursor.
      const bg = effectiveBackground(clientX, clientY);
      if (!bg) {
        setCursorRgb(rgb);
        return;
      }
      const bgLum = luminance(bg);
      const useContrast = contrast(bgLum, CONTRAST_LUM) > contrast(bgLum, ORANGE_LUM);
      setCursorRgb(useContrast ? CURSOR_CONTRAST_RGB : rgb);
    };

    const onPointerMove = (event: PointerEvent) => {
      state.targetX = event.clientX;
      state.targetY = event.clientY;
      state.visible = true;
      syncCursorTone(event.clientX, event.clientY);
    };

    const onPointerLeave = () => {
      state.visible = false;
      state.targetScale = 1;
      setCursorRgb(rgb);
    };

    const onPointerDown = () => {
      state.targetScale = 0.84;
    };

    const onPointerUp = () => {
      state.targetScale = 1;
    };

    const onMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) onPointerLeave();
    };

    const onScroll = () => {
      if (!state.visible) return;
      syncCursorTone(state.targetX, state.targetY);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("blur", onPointerLeave);
    window.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });

    const render = () => {
      frameId = window.requestAnimationFrame(render);

      state.x += (state.targetX - state.x) * 0.22;
      state.y += (state.targetY - state.y) * 0.22;
      state.dotX += (state.targetX - state.dotX) * 0.45;
      state.dotY += (state.targetY - state.dotY) * 0.45;
      state.scale += (state.targetScale - state.scale) * 0.2;

      const opacity = state.visible ? 1 : 0;
      ring.style.opacity = `${opacity}`;
      dot.style.opacity = `${opacity}`;
      ring.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;
      dot.style.transform = `translate3d(${state.dotX}px, ${state.dotY}px, 0)`;
    };

    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("blur", onPointerLeave);
      window.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll, true);
      delete document.body.dataset.softchainCursor;
    };
  }, [rgb, mounted]);

  const layer = (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="softchain-cursor-layer"
      style={{ ["--softchain-cursor-rgb" as string]: rgb } as CSSProperties}
    >
      <span ref={ringRef} className="softchain-cursor-ring" />
      <span ref={dotRef} className="softchain-cursor-dot" />
    </div>
  );

  if (!mounted) return null;
  return createPortal(layer, document.body);
}
