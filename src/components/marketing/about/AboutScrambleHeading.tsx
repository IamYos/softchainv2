"use client";

import {
  ScrambleTextReveal,
  type ScrambleTextRevealProps,
} from "@/components/marketing/ScrambleTextReveal";

type AboutScrambleHeadingProps = ScrambleTextRevealProps;

export function AboutScrambleHeading(props: AboutScrambleHeadingProps) {
  return <ScrambleTextReveal {...props} />;
}
