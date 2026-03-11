"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type ScrambleGlyph = {
  char: string;
  color: string;
  resolved: boolean;
};

const DEFAULT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
const DEFAULT_SCRAMBLE_COLORS = [
  "var(--mf-brand-red)",
  "var(--mf-brand-blue)",
] as const;
const DEFAULT_CONTAINER_CLASS = "flex w-full flex-col items-center justify-center gap-4";
const DEFAULT_LINE_CLASS = "flex flex-nowrap items-center justify-center leading-[0.9]";

type ScrambleLineProps = {
  text: string;
  delayMs: number;
  charset: string;
  scrambleColors: readonly string[];
  lineClassName: string;
  letterSpacing: string;
};

function ScrambleHeadlineLine({
  text,
  delayMs,
  charset,
  scrambleColors,
  lineClassName,
  letterSpacing,
}: ScrambleLineProps) {
  const cleanText = text.replace(/~/g, "");
  const [glyphs, setGlyphs] = useState<ScrambleGlyph[]>(
    cleanText.split("").map(() => ({
      char: " ",
      color: "transparent",
      resolved: false,
    })),
  );
  const rafRef = useRef<number | undefined>(undefined);
  const tickRef = useRef(0);

  useEffect(() => {
    tickRef.current = 0;

    const timer = window.setTimeout(() => {
      const step = () => {
        const nextGlyphs: ScrambleGlyph[] = [];

        for (let index = 0; index < cleanText.length; index += 1) {
          const targetChar = cleanText[index];

          if (targetChar === " ") {
            nextGlyphs.push({
              char: " ",
              color: "transparent",
              resolved: true,
            });
            continue;
          }

          if (tickRef.current > 2.5 * index + 25) {
            nextGlyphs.push({
              char: targetChar,
              color: "var(--mf-text-foreground)",
              resolved: true,
            });
            continue;
          }

          const randomChar = charset[Math.floor(Math.random() * charset.length)];
          const randomColor =
            scrambleColors[Math.floor(Math.random() * scrambleColors.length)];

          nextGlyphs.push({
            char: randomChar,
            color: randomColor,
            resolved: false,
          });
        }

        setGlyphs(nextGlyphs);

        if (tickRef.current < 2.5 * cleanText.length + 40) {
          tickRef.current += 1;
          rafRef.current = window.requestAnimationFrame(step);
        }
      };

      step();
    }, delayMs);

    return () => {
      window.clearTimeout(timer);

      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [charset, cleanText, delayMs, scrambleColors]);

  return (
    <div className={lineClassName} style={{ letterSpacing }}>
      {(() => {
        const words: ReactNode[] = [];
        let currentWord: ReactNode[] = [];
        let wordIndex = 0;
        let glyphIndex = 0;
        let tightenNextCharacter = false;

        const renderGlyph = (
          index: number,
          fallbackChar: string,
          tighten: boolean = false,
        ) => {
          const glyph = glyphs[index] ?? {
            char: fallbackChar,
            color: "transparent",
            resolved: false,
          };

          return (
            <div
              key={index}
              className="relative inline-flex justify-center"
              style={tighten ? { marginLeft: "-0.03em" } : undefined}
            >
              <span className="invisible opacity-0 select-none" aria-hidden="true">
                {fallbackChar === " " ? "\u00A0" : fallbackChar}
              </span>
              <span
                className="absolute bottom-0 left-0 right-0 top-0 text-center"
                style={{ color: glyph.color }}
              >
                {glyph.char === " " ? "\u00A0" : glyph.char}
              </span>
            </div>
          );
        };

        for (let sourceIndex = 0; sourceIndex <= text.length; sourceIndex += 1) {
          const character = text[sourceIndex];

          if (sourceIndex === text.length || character === " ") {
            if (currentWord.length > 0) {
              words.push(
                <span key={`word-${wordIndex}`} className="inline-flex">
                  {currentWord}
                </span>,
              );
              currentWord = [];
              wordIndex += 1;
            }

            if (character === " ") {
              words.push(
                <span
                  key={`space-${sourceIndex}`}
                  className="inline-flex w-[0.25em] shrink-0"
                />,
              );
              glyphIndex += 1;
            }

            continue;
          }

          if (character === "~") {
            tightenNextCharacter = true;
            continue;
          }

          currentWord.push(renderGlyph(glyphIndex, character, tightenNextCharacter));
          glyphIndex += 1;
          tightenNextCharacter = false;
        }

        return words;
      })()}
    </div>
  );
}

export type ScrambleHeadlineLoopProps = {
  lineSets: readonly (readonly string[])[];
  intervalMs?: number;
  lineDelayMs?: number;
  charset?: string;
  scrambleColors?: readonly string[];
  className?: string;
  lineClassName?: string;
  letterSpacing?: string;
};

export function ScrambleHeadlineLoop({
  lineSets,
  intervalMs = 4000,
  lineDelayMs = 100,
  charset = DEFAULT_CHARSET,
  scrambleColors = DEFAULT_SCRAMBLE_COLORS,
  className = DEFAULT_CONTAINER_CLASS,
  lineClassName = DEFAULT_LINE_CLASS,
  letterSpacing = "var(--mf-tracking-hero)",
}: ScrambleHeadlineLoopProps) {
  const [lineSetIndex, setLineSetIndex] = useState(0);
  const safeCharset = charset.length > 0 ? charset : DEFAULT_CHARSET;
  const safeScrambleColors =
    scrambleColors.length > 0 ? scrambleColors : DEFAULT_SCRAMBLE_COLORS;

  useEffect(() => {
    if (lineSets.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setLineSetIndex((current) => (current + 1) % lineSets.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, lineSets.length]);

  if (lineSets.length === 0) {
    return null;
  }

  const activeLineSet = lineSets[lineSetIndex % lineSets.length];

  return (
    <div className={className}>
      {activeLineSet.map((line, lineIndex) => (
        <ScrambleHeadlineLine
          key={`${lineSetIndex}-${lineIndex}`}
          text={line}
          delayMs={lineDelayMs * lineIndex}
          charset={safeCharset}
          scrambleColors={safeScrambleColors}
          lineClassName={lineClassName}
          letterSpacing={letterSpacing}
        />
      ))}
    </div>
  );
}
