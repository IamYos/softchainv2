"use client";

import { useEffect, useRef } from "react";

type GridHoverEffectProps = {
  active?: boolean;
  cellSize?: number;
  segmentInset?: number;
  maxAlpha?: number;
  spread?: number;
  glow?: number;
  lineWidth?: number;
  fadeOutMs?: number;
};

const FOREST_GREEN = [0, 105, 62] as const;
const ORANGE = [255, 88, 65] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function mixChannel(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

export function GridHoverEffect({
  active = true,
  cellSize = 102,
  segmentInset = 10,
  maxAlpha = 0.46,
  spread = 2,
  glow = 8,
  lineWidth = 1.2,
  fadeOutMs = 240,
}: GridHoverEffectProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const controlsRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    activeRef.current = active;

    const controls = controlsRef.current;
    if (!controls) {
      return;
    }

    if (active) {
      controls.start();
    } else {
      controls.stop();
    }
  }, [active]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrapper || !canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let frameId = 0;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let hideTimeout = 0;

    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      visible: false,
      intensity: 0,
    };

    const clearHideTimeout = () => {
      if (hideTimeout) {
        window.clearTimeout(hideTimeout);
        hideTimeout = 0;
      }
    };

    const resize = () => {
      const bounds = wrapper.getBoundingClientRect();
      width = Math.max(Math.round(bounds.width), 1);
      height = Math.max(Math.round(bounds.height), 1);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.lineWidth = lineWidth;
    };

    const setPointerFromClientPoint = (clientX: number, clientY: number) => {
      const bounds = wrapper.getBoundingClientRect();
      const localX = clientX - bounds.left;
      const localY = clientY - bounds.top;
      const inside =
        localX >= 0 &&
        localY >= 0 &&
        localX <= bounds.width &&
        localY <= bounds.height;

      if (!inside) {
        pointer.visible = false;
        return;
      }

      clearHideTimeout();
      pointer.visible = true;
      pointer.targetX = clamp(localX, 0, bounds.width);
      pointer.targetY = clamp(localY, 0, bounds.height);
    };

    const onPointerMove = (event: PointerEvent) => {
      setPointerFromClientPoint(event.clientX, event.clientY);
    };

    const onPointerDown = (event: PointerEvent) => {
      setPointerFromClientPoint(event.clientX, event.clientY);
    };

    const onPointerLeave = () => {
      clearHideTimeout();
      hideTimeout = window.setTimeout(() => {
        pointer.visible = false;
      }, fadeOutMs);
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      setPointerFromClientPoint(touch.clientX, touch.clientY);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      setPointerFromClientPoint(touch.clientX, touch.clientY);
    };

    const onTouchEnd = () => {
      onPointerLeave();
    };

    resize();
    pointer.x = width * 0.5;
    pointer.y = height * 0.5;
    pointer.targetX = pointer.x;
    pointer.targetY = pointer.y;

    const resizeObserver =
      "ResizeObserver" in window ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(wrapper);

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    wrapper.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("blur", onPointerLeave);

    const drawCellEdges = (
      cellX: number,
      cellY: number,
      alpha: number,
      time: number,
    ) => {
      const top = cellY + 0.5;
      const left = cellX + 0.5;
      const start = cellX + segmentInset;
      const end = cellX + cellSize - segmentInset;
      const verticalStart = cellY + segmentInset;
      const verticalEnd = cellY + cellSize - segmentInset;

      const phase =
        (Math.sin(time * 0.002 + cellX * 0.011 + cellY * 0.017) + 1) * 0.5;
      const rStart = Math.round(mixChannel(FOREST_GREEN[0], ORANGE[0], phase));
      const gStart = Math.round(mixChannel(FOREST_GREEN[1], ORANGE[1], phase));
      const bStart = Math.round(mixChannel(FOREST_GREEN[2], ORANGE[2], phase));

      const rEnd = Math.round(mixChannel(ORANGE[0], FOREST_GREEN[0], phase));
      const gEnd = Math.round(mixChannel(ORANGE[1], FOREST_GREEN[1], phase));
      const bEnd = Math.round(mixChannel(ORANGE[2], FOREST_GREEN[2], phase));

      const horizontalGradient = context.createLinearGradient(start, top, end, top);
      horizontalGradient.addColorStop(
        0,
        `rgba(${rStart}, ${gStart}, ${bStart}, ${alpha})`,
      );
      horizontalGradient.addColorStop(
        1,
        `rgba(${rEnd}, ${gEnd}, ${bEnd}, ${alpha * 0.92})`,
      );
      context.shadowColor = `rgba(${rStart}, ${gStart}, ${bStart}, ${alpha * 0.95})`;
      context.strokeStyle = horizontalGradient;
      context.beginPath();
      context.moveTo(start, top);
      context.lineTo(end, top);
      context.stroke();

      const verticalGradient = context.createLinearGradient(
        left,
        verticalStart,
        left,
        verticalEnd,
      );
      verticalGradient.addColorStop(0, `rgba(${rEnd}, ${gEnd}, ${bEnd}, ${alpha})`);
      verticalGradient.addColorStop(
        1,
        `rgba(${rStart}, ${gStart}, ${bStart}, ${alpha * 0.9})`,
      );
      context.shadowColor = `rgba(${rEnd}, ${gEnd}, ${bEnd}, ${alpha * 0.95})`;
      context.strokeStyle = verticalGradient;
      context.beginPath();
      context.moveTo(left, verticalStart);
      context.lineTo(left, verticalEnd);
      context.stroke();
    };

    const stop = () => {
      if (!frameId) {
        return;
      }

      window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const render = (time: number) => {
      if (!activeRef.current || document.hidden) {
        frameId = 0;
        return;
      }

      frameId = window.requestAnimationFrame(render);
      context.clearRect(0, 0, width, height);
      context.shadowBlur = glow;

      pointer.x += (pointer.targetX - pointer.x) * 0.16;
      pointer.y += (pointer.targetY - pointer.y) * 0.16;
      pointer.intensity += ((pointer.visible ? 1 : 0) - pointer.intensity) * 0.1;

      if (pointer.intensity < 0.01) {
        return;
      }

      const centerCol = Math.floor(pointer.x / cellSize);
      const centerRow = Math.floor(pointer.y / cellSize);
      const drawDistanceLimit = spread + 0.15;

      for (let rowOffset = -spread; rowOffset <= spread; rowOffset += 1) {
        for (let colOffset = -spread; colOffset <= spread; colOffset += 1) {
          const distance = Math.hypot(colOffset, rowOffset);
          if (distance > drawDistanceLimit) {
            continue;
          }

          const falloff = clamp(1 - distance / (spread + 0.35), 0, 1);
          const alpha = maxAlpha * pointer.intensity * falloff;
          if (alpha <= 0.01) {
            continue;
          }

          const cellX = (centerCol + colOffset) * cellSize;
          const cellY = (centerRow + rowOffset) * cellSize;

          if (
            cellX > width ||
            cellY > height ||
            cellX + cellSize < 0 ||
            cellY + cellSize < 0
          ) {
            continue;
          }

          drawCellEdges(cellX, cellY, alpha, time);
        }
      }
    };

    const start = () => {
      if (frameId || !activeRef.current || document.hidden) {
        return;
      }

      frameId = window.requestAnimationFrame(render);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
        return;
      }

      start();
    };

    controlsRef.current = { start, stop };
    document.addEventListener("visibilitychange", onVisibilityChange);
    start();

    return () => {
      controlsRef.current = null;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
      clearHideTimeout();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      wrapper.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("blur", onPointerLeave);
      resizeObserver?.disconnect();
    };
  }, [cellSize, fadeOutMs, glow, lineWidth, maxAlpha, segmentInset, spread]);

  return (
    <div ref={wrapperRef} className="pointer-events-none absolute inset-0 z-[5]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
