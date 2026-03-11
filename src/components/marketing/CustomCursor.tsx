"use client";

import { CSSProperties, useEffect, useRef } from "react";

type CustomCursorProps = {
  rgb?: string;
};

export function CustomCursor({ rgb = "255, 88, 65" }: CustomCursorProps) {
  const ringRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const ring = ringRef.current;
    const dot = dotRef.current;

    if (!ring || !dot) {
      return;
    }

    document.body.dataset.softchainCursor = "on";

    let frameId = 0;
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

    const onPointerMove = (event: PointerEvent) => {
      state.targetX = event.clientX;
      state.targetY = event.clientY;
      state.visible = true;
    };

    const onPointerLeave = () => {
      state.visible = false;
      state.targetScale = 1;
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

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("blur", onPointerLeave);
    window.addEventListener("mouseout", onMouseOut);

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
      delete document.body.dataset.softchainCursor;
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="softchain-cursor-layer"
      style={{ ["--softchain-cursor-rgb" as string]: rgb } as CSSProperties}
    >
      <span ref={ringRef} className="softchain-cursor-ring" />
      <span ref={dotRef} className="softchain-cursor-dot" />
    </div>
  );
}

