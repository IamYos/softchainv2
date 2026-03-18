# Softchain v2

Corporate website and web platform for [Softchain](https://softchain.ae) — an engineering firm headquartered in Dubai, UAE.

## Brand Positioning

Current approved top-level website label: `Solutions`

Current approved solution pillars:

- `Software Design & Engineering`
- `AI Systems`
- `IT Infrastructure`
- `Technology Management`

Messaging rules for future work:

- Mobile delivery sits under `Software Design & Engineering`.
- `Technology Management` covers procurement, digitization planning, vendor coordination, governance, and long-term partnership support.

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.1.6 | React framework (App Router, Turbopack) |
| [React](https://react.dev) | 19.2.3 | UI library |
| [TypeScript](https://typescriptlang.org) | 5.9.3 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | 4.2.1 | Utility-first CSS |
| [ESLint](https://eslint.org) | 9.x | Linting (flat config) |
| [Bun](https://bun.sh) | 1.3.10 | Package manager & runtime |

Deployed on [Vercel](https://vercel.com) at [softchainv2.vercel.app](https://softchainv2.vercel.app)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed (`curl -fsSL https://bun.com/install | bash`)
- [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`) — for deployments
- [GitHub CLI](https://cli.github.com) (`brew install gh`) — for repo management

### Install dependencies

```bash
bun install
```

### Run development server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000). The page auto-updates as you edit files.

### Build for production

```bash
bun run build
```

### Start production server

```bash
bun start
```

### Lint

```bash
bun lint
```

## Project Structure

```
softchainv2/
├── src/
│   └── app/                    # App Router — all pages and layouts
│       ├── layout.tsx          # Root layout (fonts, metadata, global wrapper)
│       ├── page.tsx            # Homepage (/)
│       ├── globals.css         # Global styles + Tailwind imports
│       └── favicon.ico         # Site favicon
│       │
│       ├── about/              # Example: /about route
│       │   └── page.tsx
│       ├── services/           # Example: /services route
│       │   └── page.tsx
│       └── contact/            # Example: /contact route
│           └── page.tsx
│
├── public/                     # Static files served at root (/)
│   ├── next.svg
│   ├── vercel.svg
│   └── ...
│
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── postcss.config.mjs          # PostCSS config (Tailwind plugin)
├── eslint.config.mjs           # ESLint flat config
├── package.json                # Dependencies and scripts
├── bun.lock                    # Bun lockfile
└── .gitignore                  # Git ignore rules
```

### Where to put things

| What | Where | Notes |
|---|---|---|
| **Pages/routes** | `src/app/<route>/page.tsx` | Each folder = URL segment. `page.tsx` makes it a route. |
| **Layouts** | `src/app/<route>/layout.tsx` | Wraps child pages. Nested layouts are supported. |
| **Components** | `src/components/` | Shared React components (create this folder as needed). |
| **Static assets** (images, fonts served via URL) | `public/` | Accessible at `/<filename>`. Use `next/image` for optimization. |
| **Global styles** | `src/app/globals.css` | Tailwind imports + CSS variables live here. |
| **API routes** | `src/app/api/<route>/route.ts` | Backend endpoints (for chatbot, webhooks, etc.). |
| **Utilities/helpers** | `src/lib/` | Shared TypeScript utilities (create as needed). |
| **Types** | `src/types/` | Shared TypeScript type definitions (create as needed). |
| **Environment variables** | `.env.local` | Never committed. Copy `.env.example` for reference. |

### Adding a new page

```tsx
// src/app/about/page.tsx
export default function AboutPage() {
  return (
    <main>
      <h1>About Softchain</h1>
    </main>
  );
}
```

This creates the `/about` route automatically.

### Adding an API route

```tsx
// src/app/api/contact/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  // handle form submission, connect to backend, etc.
  return NextResponse.json({ success: true });
}
```

## Deployment

### Vercel (production)

Pushes to `main` auto-deploy if GitHub is connected in Vercel settings. Manual deploy:

```bash
vercel --prod
```

### Preview deployments

Every push to a non-main branch creates a preview URL automatically (when GitHub integration is connected).

### Environment variables

Set production env vars in [Vercel project settings](https://vercel.com/iamyos-projects/softchainv2/settings/environment-variables). For local development:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

## Git Workflow

```bash
# Create a feature branch
git checkout -b feature/homepage

# Make changes, then commit
git add -A
git commit -m "Add homepage design"

# Push and create PR
git push -u origin feature/homepage
gh pr create --title "Add homepage design" --body "Description of changes"
```

## Useful Commands

| Command | Description |
|---|---|
| `bun dev` | Start dev server with Turbopack (fast HMR) |
| `bun run build` | Production build |
| `bun start` | Start production server locally |
| `bun lint` | Run ESLint |
| `bun add <package>` | Add a dependency |
| `bun add -d <package>` | Add a dev dependency |
| `vercel` | Deploy preview |
| `vercel --prod` | Deploy to production |
| `vercel env pull` | Pull env vars from Vercel to `.env.local` |

## Resources

- [Next.js Docs](https://nextjs.org/docs) — framework documentation
- [Tailwind CSS Docs](https://tailwindcss.com/docs) — styling reference
- [Vercel Docs](https://vercel.com/docs) — deployment and platform features
- [React Docs](https://react.dev) — React library reference
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/) — TypeScript reference
