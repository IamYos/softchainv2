# About Page Redesign — Design Spec

**Date:** 2026-03-21
**Reference:** Shift5.io/company/ (design language, animations, layout patterns)
**Scope:** Complete rebuild of `/src/components/marketing/about/` to match Shift5's Company page style

## Overview

Rebuild Softchain's About page to replicate Shift5's Company page design language: dark backgrounds, orange stripe hero, clip-path reveal animations, stacked content blocks, and 3-column values grid. Content is adapted for Softchain's architecture-first software delivery positioning.

Excluded from Shift5's page: Leadership Team, Testimonials, By the Numbers, The Tech showcase.

## Sections

### 1. Hero

**Visual:** Dark `#202020` background with absolutely-positioned `#ff5841` orange stripe overlay (full bleed, `inset: 0`). Large headline, tagline, sub-tagline, and body paragraph.

**Content:**
- Headline: "Company."
- Tagline: "Architecture-First Software Delivery."
- Sub-tagline: "Built on structure. Driven by ownership." (AuxMono, muted)
- Body: "Softchain was founded on a straightforward principle: software delivery stays clearer when architecture, execution, and support are not split apart. Headquartered in Dubai and delivering globally, the company brings scoping, implementation, infrastructure, and long-term support together under one accountable team."

**Layout:**
- `padding-top: 200px` desktop, reduced on mobile
- Headline: `clamp(48px, 8vw, 96px)`, NON-Sans-Medium, `letter-spacing: -0.02em`, color `#202020` (over stripe)
- Tagline: NON-Sans-Medium, ~20-24px, `#202020`
- Sub-tagline: AuxMono, ~14px, `rgba(32,32,32,0.7)`
- Body: NON-Sans-Medium, 16px, `#b9b9b9`, max-width ~560px, positioned below stripe area

**Animations:**
- `heroWordIn`: 1100ms `cubic-bezier(0.2, 0.95, 0.24, 1)`, 120ms delay. From `opacity: 0, translate3d(0, 18%, 0)` to visible.
- Orange stripe: static (no animation), provides visual weight behind headline area

**Header palette:** `data-header-palette="light"` (dark text on orange stripe background)

### 2. Disciplines

**Visual:** Dark background, stacked vertical discipline blocks with left orange border, each revealing via clip-path on scroll.

**Content:**
- Eyebrow: "What We Deliver" (AuxMono, uppercase, `#ff5841`)
- Heading: "Four disciplines. One accountable team." (NON-Sans-Medium)
- 4 blocks:
  1. **Software Design & Engineering** — "Product scoping, architecture, frontend and backend implementation, integration, and deployment — carried through production under clear technical ownership."
  2. **AI Systems** — "Model selection, deployment method, and system design chosen by constraints. AI belongs where it improves throughput, accuracy, or leverage — not as a bolt-on."
  3. **IT Infrastructure** — "Cloud, on-premise, and hybrid systems planned with observability, security, and support from the start. Infrastructure is part of delivery, not a cleanup phase."
  4. **Technology Management** — "Maintenance, retained engineering, managed updates, and operational support structured per project. Support continues after launch when the engagement requires it."
- Each block has "Learn more →" CTA linking to homepage solution slider

**Layout:**
- Section bg: `#202020` or similar dark
- Block styling: `padding: 20-24px`, `background: #1a1a1a` or slightly lighter, `border-left: 3px solid #ff5841`, `border-radius: 8px`
- Heading: `clamp(22px, 3vw, 32px)`, NON-Sans-Medium
- Body: 15px, `#b9b9b9`
- CTA: AuxMono, 12px, `#ff5841`

**Animations:**
- `clip-path: inset(100% 0 0 0)` → `inset(0 0 0 0)` on each block, triggered by IntersectionObserver on scroll (~600ms ease)
- Staggered FadeIn with 70ms delay between items
- Hover: `transform: translateX(4px)`, background lighten, 240ms ease transition

**Header palette:** `data-header-palette="dark"` (light text on dark background)

### 3. Values

**Visual:** Orange `#ff5841` section background with 3 dark cards in a grid.

**Content:**
- Eyebrow: "Values" (AuxMono, uppercase)
- Heading: "What drives every engagement."
- 3 value cards:
  1. **Architecture-First Discipline** — "We do not start building before the stack, boundaries, and delivery plan are coherent. Structure precedes speed."
  2. **Constraint-Led Decisions** — "Technology selection, deployment method, and system design are chosen by real constraints — not trends, not defaults."
  3. **Accountable Ownership** — "One team carries scoping through production and beyond. No fragmented handoffs, no ambiguous responsibility."

**Layout:**
- Section bg: `#ff5841`
- Card grid: `grid-template-columns: repeat(3, 1fr)`, gap 16px → stacked on mobile
- Card: `background: #202020`, `border-radius: 8px`, `padding: 5.6rem 4rem` desktop / `3.2rem 1.6rem` mobile
- Card heading: `#ff5841`, NON-Sans-Medium
- Card body: `#b9b9b9`
- Section text (eyebrow, heading): `#202020`

**Animations:**
- `clip-path: inset(100% 0 0 0)` → `inset(0)` on each card
- Stagger: 80ms between cards, left to right
- Hover: subtle lift `translate3d(0, -2px, 0)`, 240ms ease

**Header palette:** `data-header-palette="light"` (dark text on orange bg)

### 4. Contact CTA

Existing `SFContactForm` component. No changes.

### 5. Footer

Existing `SFFooter` with `context="about"`. No changes.

## New Component: ClipReveal

IntersectionObserver-based wrapper that applies `clip-path: inset(100% 0 0 0)` → `inset(0 0 0 0)` animation when element enters viewport. This is Shift5's signature scroll-reveal pattern.

**Props:**
- `delay?: number` — stagger delay in ms (default 0)
- `duration?: number` — transition duration in ms (default 600)
- `direction?: 'up' | 'down' | 'left' | 'right'` — reveal direction (default 'up')
- `className?: string`
- `children: React.ReactNode`

**Implementation:**
- Uses `useInView` hook (same as FadeIn, `once: true`, `rootMargin: "-10% 0px"`)
- CSS transition: `clip-path ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`
- Respects `prefers-reduced-motion`

## File Changes

| File | Action |
|------|--------|
| `src/components/marketing/about/AboutPage.tsx` | Rewrite — new section structure |
| `src/components/marketing/about/AboutPage.module.css` | Rewrite — all new styles matching Shift5 |
| `src/components/marketing/about/aboutContent.ts` | Rewrite — new content structure |
| `src/components/marketing/ClipReveal.tsx` | Create — new clip-path reveal component |
| `src/app/about/page.tsx` | Minor update — metadata description |

## Responsive Breakpoints

| Breakpoint | Changes |
|-----------|---------|
| `max-width: 749px` | Hero padding reduced, disciplines single column, values single column, all clamp() at minimums |
| `750px - 1023px` | Intermediate padding, disciplines stacked, values may go 2-col |
| `1024px+` | Full desktop — hero 200px top padding, values 3-col grid, max content widths |

## Color Palette (existing, no changes)

- Primary: `#ff5841`
- Dark: `#202020`
- Light gray: `#b9b9b9`
- Base: `#0a0a0a`

## Typography (existing fonts, no changes)

- NON-Sans-Medium (`--font-non-sans`) — headings, body
- AuxMono (`--font-aux-mono`) — eyebrows, labels, CTAs
- PPEditorialNew-Light (`--font-pp-editorial`) — not used on this page

## Animation Summary

| Name | Duration | Easing | Trigger |
|------|----------|--------|---------|
| heroWordIn | 1100ms | cubic-bezier(0.2, 0.95, 0.24, 1) | Page load, 120ms delay |
| ClipReveal | ~600ms | cubic-bezier(0.16, 1, 0.3, 1) | Scroll into view |
| FadeIn | 800ms | cubic-bezier(0.16, 1, 0.3, 1) | Scroll into view |
| Hover transitions | 240ms | ease | Mouse enter/leave |
| Reduced motion | All disabled | — | `prefers-reduced-motion: reduce` |
