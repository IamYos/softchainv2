"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import styles from "./AnimeHeartBeat.module.css";

const GRID_SIZE = 13;
const GRID = [GRID_SIZE, GRID_SIZE] as const;
const FROM_INDEX = 84;
const CANVAS_SCALE = 2;
const HEART_COLOR = "#ff4b4b";
const GROW_DURATION = 500;
const SHRINK_DURATION = 800;
const LOOP_DELAY = 100;
const LOOP_DURATION = GROW_DURATION + SHRINK_DURATION + LOOP_DELAY;
const STAGGER_AMOUNT = 150;

const HEART_SHAPE = [
  0, 0, 0.1, 0.1, 0.1, 0, 0, 0, 0.1, 0.1, 0.1, 0, 0,
  0, 0.1, 0.5, 0.6, 0.5, 0.2, 0.1, 0.2, 0.5, 0.6, 0.5, 0.1, 0,
  0.1, 0.6, 0.8, 0.9, 0.9, 0.7, 0.5, 0.7, 0.9, 0.9, 0.8, 0.6, 0.1,
  0.5, 0.9, 1, 1, 1, 0.9, 0.8, 0.9, 1, 1, 1, 0.9, 0.5,
  0.8, 0.9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.9, 0.8,
  0.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.8,
  0.6, 0.9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.9, 0.6,
  0.4, 0.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.8, 0.4,
  0.2, 0.6, 0.9, 1, 1, 1, 1, 1, 1, 1, 0.9, 0.6, 0.2,
  0.1, 0.3, 0.6, 0.8, 1, 1, 1, 1, 1, 0.8, 0.6, 0.3, 0.1,
  0, 0.1, 0.3, 0.5, 0.8, 1, 1, 1, 0.8, 0.5, 0.3, 0.1, 0,
  0, 0, 0, 0.2, 0.4, 0.7, 0.9, 0.7, 0.4, 0.2, 0, 0, 0,
  0, 0, 0.1, 0.2, 0.4, 0.2, 0.1, 0, 0, 0, 0, 0, 0,
] as const;

type Circle = {
  baseScale: number;
  color: string;
  delay: number;
  opacity: number;
  radius: number;
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function easeInOutQuad(progress: number) {
  if (progress < 0.5) {
    return 2 * progress * progress;
  }

  return 1 - Math.pow(-2 * progress + 2, 2) / 2;
}

function easeIn4(progress: number) {
  return Math.pow(progress, 4);
}

function createStaggerValues(
  value: number | readonly [number, number],
  options: {
    ease?: (progress: number) => number;
    from: number;
    grid: readonly [number, number];
  },
) {
  const [columns, rows] = options.grid;
  const fromX = options.from % columns;
  const fromY = Math.floor(options.from / columns);
  const distances: number[] = [];

  let maxDistance = 0;

  for (let index = 0; index < columns * rows; index += 1) {
    const x = index % columns;
    const y = Math.floor(index / columns);
    const dx = fromX - x;
    const dy = fromY - y;
    const distance = Math.hypot(dx, dy);
    distances.push(distance);
    maxDistance = Math.max(maxDistance, distance);
  }

  const mappedDistances =
    options.ease && maxDistance > 0
      ? distances.map((distance) => options.ease!(distance / maxDistance) * maxDistance)
      : distances;

  if (Array.isArray(value)) {
    const [start, end] = value;
    const delta = maxDistance === 0 ? 0 : (end - start) / maxDistance;

    return mappedDistances.map((distance) => start + delta * distance);
  }

  const scalar = Number(value);

  return mappedDistances.map((distance) => distance * scalar);
}

function createCircles(width: number, height: number) {
  const halfWidth = width * 0.5;
  const halfHeight = height * 0.5;
  const stepX = halfWidth / (GRID_SIZE - 1);
  const stepY = halfHeight / (GRID_SIZE - 1);
  const offsetX = (width - halfWidth) / 2;
  const offsetY = (height - halfHeight) / 2;
  const opacities = createStaggerValues([0.8, 0.1], {
    from: FROM_INDEX,
    grid: GRID,
  });
  const delays = createStaggerValues(STAGGER_AMOUNT, {
    ease: easeIn4,
    from: FROM_INDEX,
    grid: GRID,
  });

  return HEART_SHAPE.map((value, index) => {
    const row = Math.floor(index / GRID_SIZE);
    const column = index % GRID_SIZE;

    return {
      baseScale: value > 0.1 ? value * 12 : 0,
      color: HEART_COLOR,
      delay: delays[index] ?? 0,
      opacity: opacities[index] ?? 0,
      radius: 1,
      x: offsetX + column * stepX,
      y: offsetY + row * stepY,
    } satisfies Circle;
  });
}

function getAnimatedScale(baseScale: number, elapsed: number) {
  if (baseScale <= 0 || elapsed < 0) {
    return 0;
  }

  const localTime = elapsed % LOOP_DURATION;

  if (localTime <= GROW_DURATION) {
    return baseScale * easeInOutQuad(localTime / GROW_DURATION);
  }

  if (localTime <= GROW_DURATION + SHRINK_DURATION) {
    const shrinkProgress = (localTime - GROW_DURATION) / SHRINK_DURATION;
    return baseScale * (1 - easeInOutQuad(shrinkProgress));
  }

  return 0;
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  circles: Circle[],
  elapsed: number,
  prefersReducedMotion: boolean,
) {
  ctx.clearRect(0, 0, width, height);

  for (const circle of circles) {
    const scale = prefersReducedMotion
      ? circle.baseScale
      : getAnimatedScale(circle.baseScale, elapsed - circle.delay);

    if (scale <= 0 || circle.opacity <= 0) {
      continue;
    }

    ctx.save();
    ctx.globalAlpha = clamp(circle.opacity, 0, 1);
    ctx.translate(circle.x, circle.y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 0, circle.radius, 0, Math.PI * 2);
    ctx.fillStyle = circle.color;
    ctx.fill();
    ctx.restore();
  }
}

export function AnimeHeartBeat() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (!container || !canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let circles: Circle[] = [];
    let frameId = 0;
    let startTime = performance.now();
    let width = 0;
    let height = 0;

    const resize = () => {
      width = container.offsetWidth;
      height = container.offsetHeight;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = width * CANVAS_SCALE;
      canvas.height = height * CANVAS_SCALE;

      context.setTransform(CANVAS_SCALE, 0, 0, CANVAS_SCALE, 0, 0);
      circles = createCircles(width, height);
      drawHeart(context, width, height, circles, performance.now() - startTime, prefersReducedMotion);
    };

    const render = (now: number) => {
      drawHeart(context, width, height, circles, now - startTime, prefersReducedMotion);

      if (!prefersReducedMotion) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const observer = new ResizeObserver(() => {
      resize();
    });

    observer.observe(container);
    resize();

    if (!prefersReducedMotion) {
      startTime = performance.now();
      frameId = window.requestAnimationFrame(render);
    }

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, [prefersReducedMotion]);

  return (
    <div className={styles.stage}>
      <div ref={containerRef} className={styles.frame}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      </div>
    </div>
  );
}
