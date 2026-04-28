import type { Metadata } from "next";
import { SolutionsPage } from "@/components/marketing/solutions/SolutionsPage";

const solutionsTitle =
  "Solutions | Softchain Software, AI, Infrastructure, and Technology Management";
const solutionsDescription =
  "Explore Softchain solutions across software design and engineering, AI systems, IT infrastructure, technology management, and long-term technical support.";

export const metadata: Metadata = {
  title: solutionsTitle,
  description: solutionsDescription,
  alternates: {
    canonical: "/solutions",
  },
  openGraph: {
    url: "/solutions",
    title: solutionsTitle,
    description: solutionsDescription,
  },
  twitter: {
    title: solutionsTitle,
    description: solutionsDescription,
  },
};

export default function SolutionsRoute() {
  return <SolutionsPage />;
}
