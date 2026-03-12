"use client";

import { useEffect, useRef } from "react";

type SpherePoint = {
  x: number;
  y: number;
  z: number;
  phase: number;
  wobble: number;
  scatterX: number;
  scatterY: number;
  scatterZ: number;
  settleDelay: number;
  glyph: "0" | "1";
  nextGlyphFlipAt: number;
};

type RenderPoint = {
  x: number;
  y: number;
  z: number;
  fontSize: number;
  alpha: number;
  r: number;
  g: number;
  b: number;
  glyph: "0" | "1";
};

const TAU = Math.PI * 2;
const PARTICLE_FONT_FALLBACK =
  '"Hack", "IBM Plex Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';
const PARTICLE_FONT_SCALE = 3.6;
const BUBBLE_SCALE = 1.15;
const MIN_GLYPH_FLIP_DELAY = 0.35;
const MAX_GLYPH_FLIP_DELAY = 1.75;
export const HERO_BUBBLE_CENTER_Y_RATIO = 0.46;
const PARTICLE_PALETTE = [
  { r: 255, g: 88, b: 65 }, // #ff5841
  { r: 80, g: 200, b: 120 }, // #50C878
  { r: 0, g: 0, b: 0 }, // black
] as const;

type HeroParticleBubbleProps = {
  active?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function createGlyphFlipDelay() {
  return MIN_GLYPH_FLIP_DELAY + Math.random() * (MAX_GLYPH_FLIP_DELAY - MIN_GLYPH_FLIP_DELAY);
}

function createBinaryGlyph(): "0" | "1" {
  return Math.random() < 0.5 ? "0" : "1";
}

function samplePalette(cycle: number) {
  const wrapped = ((cycle % 1) + 1) % 1;
  const scaled = wrapped * PARTICLE_PALETTE.length;
  const startIndex = Math.floor(scaled) % PARTICLE_PALETTE.length;
  const endIndex = (startIndex + 1) % PARTICLE_PALETTE.length;
  const mix = scaled - Math.floor(scaled);
  const start = PARTICLE_PALETTE[startIndex];
  const end = PARTICLE_PALETTE[endIndex];

  return {
    r: lerp(start.r, end.r, mix),
    g: lerp(start.g, end.g, mix),
    b: lerp(start.b, end.b, mix),
  };
}

function createSpherePoints(count: number): SpherePoint[] {
  const points: SpherePoint[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < count; index += 1) {
    const y = 1 - (index / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * index;

    points.push({
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
      phase: Math.random(),
      wobble: 0.8 + Math.random() * 1.6,
      scatterX:
        Math.cos(theta) * radius * (2.2 + Math.random() * 3.2) +
        (Math.random() - 0.5) * 1.2,
      scatterY:
        y * (2.2 + Math.random() * 3.2) + (Math.random() - 0.5) * 1.2,
      scatterZ:
        Math.sin(theta) * radius * (2.2 + Math.random() * 3.2) +
        (Math.random() - 0.5) * 1.2,
      settleDelay: Math.random() * 0.28,
      glyph: createBinaryGlyph(),
      nextGlyphFlipAt: Math.random() * MAX_GLYPH_FLIP_DELAY,
    });
  }

  return points;
}

export function HeroParticleBubble({ active = true }: HeroParticleBubbleProps) {
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

    const auxMonoFontVariable =
      getComputedStyle(document.documentElement).getPropertyValue("--font-aux-mono").trim();
    const monoFontVariable =
      getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim();
    const particleFontFamily =
      auxMonoFontVariable || monoFontVariable
        ? `${auxMonoFontVariable || monoFontVariable}, ${PARTICLE_FONT_FALLBACK}`
        : PARTICLE_FONT_FALLBACK;

    let width = 1;
    let height = 1;
    let dpr = 1;
    let frameId = 0;
    let time = 0;
    let elapsed = 0;
    let lastTimestamp = 0;
    let points = createSpherePoints(window.innerWidth < 768 ? 1300 : 2200);

    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

      points = createSpherePoints(width < 768 ? 1300 : 2200);
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = wrapper.getBoundingClientRect();

      if (bounds.width <= 0 || bounds.height <= 0) {
        return;
      }

      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

      mouse.targetX = clamp(x, -1, 1);
      mouse.targetY = clamp(y, -1, 1);
    };

    const resetPointer = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
    };

    resize();

    const resizeObserver =
      "ResizeObserver" in window ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(wrapper);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", resetPointer);

    const stop = () => {
      if (!frameId) {
        return;
      }

      window.cancelAnimationFrame(frameId);
      frameId = 0;
      lastTimestamp = 0;
    };

    const render = (timestamp: number) => {
      if (!activeRef.current || document.hidden) {
        frameId = 0;
        lastTimestamp = 0;
        return;
      }

      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const delta = Math.min(timestamp - lastTimestamp, 64);
      lastTimestamp = timestamp;
      elapsed += delta / 1000;

      const normalizedDelta = delta / (1000 / 60);
      time += (prefersReducedMotion ? 0.0025 : 0.006) * normalizedDelta;

      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      context.clearRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * HERO_BUBBLE_CENTER_Y_RATIO;
      const minAxis = Math.min(width, height);
      const mobileWidthProgress = clamp((width - 320) / (768 - 320), 0, 1);
      const mobileRadiusFactor = lerp(0.32, 0.275, mobileWidthProgress);
      const sphereRadius =
        minAxis * (width < 768 ? mobileRadiusFactor : 0.255) * BUBBLE_SCALE;
      const pointSizeScale = clamp(sphereRadius / 180, 0.65, 1);
      const cameraDepth = 3.3;
      const rotateY = time * 0.55 + mouse.x * 0.5;
      const rotateX = time * 0.3 - mouse.y * 0.35;
      const sinY = Math.sin(rotateY);
      const cosY = Math.cos(rotateY);
      const sinX = Math.sin(rotateX);
      const cosX = Math.cos(rotateX);
      const introProgress = prefersReducedMotion ? 1 : clamp(elapsed / 1.3, 0, 1);
      const introOpacity = prefersReducedMotion ? 1 : clamp(elapsed / 0.85, 0, 1);

      const aura = context.createRadialGradient(
        centerX,
        centerY,
        sphereRadius * 0.35,
        centerX,
        centerY,
        sphereRadius * 1.75,
      );
      aura.addColorStop(0, "rgba(0, 105, 62, 0.16)");
      aura.addColorStop(0.55, "rgba(56, 66, 78, 0.1)");
      aura.addColorStop(1, "rgba(0, 105, 62, 0)");
      context.fillStyle = aura;
      context.beginPath();
      context.arc(centerX, centerY, sphereRadius * 1.75, 0, TAU);
      context.fill();

      const drawPoints: RenderPoint[] = [];

      for (let index = 0; index < points.length; index += 1) {
        const point = points[index];
        if (elapsed >= point.nextGlyphFlipAt) {
          point.glyph = point.glyph === "0" ? "1" : "0";
          point.nextGlyphFlipAt = elapsed + createGlyphFlipDelay();
        }

        const pulse = Math.sin(time * point.wobble + point.phase * TAU) * 0.045;

        let x = point.x * (1 + pulse);
        let y = point.y * (1 + pulse);
        let z = point.z * (1 + pulse);
        const settleProgress = clamp(
          (introProgress - point.settleDelay) / (1 - point.settleDelay),
          0,
          1,
        );
        const settleEase = 1 - Math.pow(1 - settleProgress, 3);
        const scatterFactor = 1 - settleEase;
        x += point.scatterX * scatterFactor;
        y += point.scatterY * scatterFactor;
        z += point.scatterZ * scatterFactor;

        const xzX = x * cosY - z * sinY;
        const xzZ = x * sinY + z * cosY;
        x = xzX;
        z = xzZ;

        const yzY = y * cosX - z * sinX;
        const yzZ = y * sinX + z * cosX;
        y = yzY;
        z = yzZ;

        const mouseFactor = (z + 1) * 0.5;
        x += mouse.x * 0.2 * mouseFactor;
        y += mouse.y * 0.16 * mouseFactor;

        const depth = z + cameraDepth;
        if (depth <= 0.05) {
          continue;
        }
        const perspective = cameraDepth / depth;
        const screenX = centerX + x * sphereRadius * perspective;
        const screenY = centerY + y * sphereRadius * perspective;
        const depthMix = clamp((z + 1) * 0.5, 0, 1);
        const phaseMix =
          (Math.sin(time * 1.9 + point.phase * TAU + x * 2.2 - y * 1.6) + 1) * 0.5;
        const colorCycle =
          time * 0.1 + point.phase * 0.8 + depthMix * 0.28 + phaseMix * 0.22;
        const color = samplePalette(colorCycle);
        const shade = clamp(
          0.74 + depthMix * 0.22 + Math.sin(time * 2.5 + point.phase * TAU) * 0.18,
          0.32,
          1.2,
        );

        const red = Math.round(clamp(color.r * shade, 0, 255));
        const green = Math.round(clamp(color.g * shade, 0, 255));
        const blue = Math.round(clamp(color.b * shade, 0, 255));

        const dotSize = Math.max(
          (0.6 + depthMix * 2.1) * perspective * pointSizeScale,
          0.01,
        );
        const glyphFontSize = Math.max(
          Math.round(dotSize * PARTICLE_FONT_SCALE * 10) / 10,
          0.8,
        );

        drawPoints.push({
          x: screenX,
          y: screenY,
          z,
          fontSize: glyphFontSize,
          alpha: clamp((0.12 + depthMix * 0.7) * lerp(0.35, 1, introOpacity), 0.05, 0.85),
          r: clamp(red, 0, 255),
          g: clamp(green, 0, 255),
          b: clamp(blue, 0, 255),
          glyph: point.glyph,
        });
      }

      drawPoints.sort((left, right) => left.z - right.z);

      context.textAlign = "center";
      context.textBaseline = "middle";

      let activeFontSize = -1;
      for (let index = 0; index < drawPoints.length; index += 1) {
        const point = drawPoints[index];

        if (point.fontSize !== activeFontSize) {
          activeFontSize = point.fontSize;
          context.font = `700 ${point.fontSize}px ${particleFontFamily}`;
        }

        context.fillStyle = `rgba(${point.r}, ${point.g}, ${point.b}, ${point.alpha})`;
        context.fillText(point.glyph, point.x, point.y);
      }

      frameId = window.requestAnimationFrame(render);
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
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", resetPointer);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="pointer-events-none absolute inset-0 z-[6]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
