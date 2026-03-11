"use client";

import { CSSProperties, useEffect, useRef } from "react";

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
const BRAND_ORANGE = { r: 255, g: 88, b: 65 };

function parseResolvedColor(value: string) {
  const match = value.match(/rgba?\(([^)]+)\)/i);

  if (!match) {
    return null;
  }

  const [r, g, b, a = 1] = match[1]
    .split(",")
    .map((part) => Number.parseFloat(part.trim()));

  if ([r, g, b, a].some((channel) => Number.isNaN(channel))) {
    return null;
  }

  return { r, g, b, a } satisfies ResolvedColor;
}

function getColorDistance(color: ResolvedColor, target: Omit<ResolvedColor, "a">) {
  return Math.hypot(color.r - target.r, color.g - target.g, color.b - target.b);
}

function getColorCandidates(element: Element) {
  const style = window.getComputedStyle(element);

  return [
    style.color,
    style.backgroundColor,
    style.borderTopColor,
    style.borderRightColor,
    style.borderBottomColor,
    style.borderLeftColor,
    style.outlineColor,
    style.textDecorationColor,
    style.getPropertyValue("fill"),
    style.getPropertyValue("stroke"),
    style.backgroundImage,
  ];
}

function isBrandOrangeValue(value: string) {
  const normalized = value.replace(/\s+/g, "").toLowerCase();

  if (
    normalized.includes("#ff5841") ||
    normalized.includes("rgb(255,88,65)") ||
    normalized.includes("rgba(255,88,65")
  ) {
    return true;
  }

  const color = parseResolvedColor(value);

  if (!color || color.a < 0.18) {
    return false;
  }

  return getColorDistance(color, BRAND_ORANGE) <= 96;
}

function elementUsesBrandOrange(element: Element | null) {
  let current = element;

  while (current && current !== document.documentElement) {
    if (getColorCandidates(current).some(isBrandOrangeValue)) {
      return true;
    }

    current = current.parentElement;
  }

  return false;
}

export function CustomCursor({ rgb = "255, 88, 65" }: CustomCursorProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const layer = layerRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;

    if (!layer || !ring || !dot) {
      return;
    }

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
      if (nextRgb === activeCursorRgb) {
        return;
      }

      activeCursorRgb = nextRgb;
      layer.style.setProperty("--softchain-cursor-rgb", nextRgb);
    };

    const syncCursorTone = (clientX: number, clientY: number) => {
      const hoveredElements = document.elementsFromPoint(clientX, clientY);
      const shouldUseContrast =
        hoveredElements.length > 0 &&
        hoveredElements.some((element) => elementUsesBrandOrange(element));

      setCursorRgb(shouldUseContrast ? CURSOR_CONTRAST_RGB : rgb);
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
      if (!event.relatedTarget) {
        onPointerLeave();
      }
    };

    const onScroll = () => {
      if (!state.visible) {
        return;
      }

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
  }, [rgb]);

  return (
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
}
