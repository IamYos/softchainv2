import type { Metadata } from "next";
import { AboutPage } from "@/components/marketing/about/AboutPage";

const aboutTitle =
  "About Softchain | Software Design & Engineering, AI Systems, IT Infrastructure, and Technology Management";
const aboutDescription =
  "Learn how Softchain structures software design and engineering, AI systems, IT infrastructure, and technology management with clear technical ownership from scoping through long-term support.";

export const metadata: Metadata = {
  title: aboutTitle,
  description: aboutDescription,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    url: "/about",
    title: aboutTitle,
    description: aboutDescription,
  },
  twitter: {
    title: aboutTitle,
    description: aboutDescription,
  },
};

export default function AboutRoute() {
  return <AboutPage />;
}
