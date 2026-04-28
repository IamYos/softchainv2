import type { Metadata } from "next";
import { InsightsPage } from "@/components/marketing/insights/InsightsPage";

const insightsTitle =
  "Insights | Softchain Software, AI, Infrastructure, and Technology Notes";
const insightsDescription =
  "Read Softchain insights on software architecture, AI systems, IT infrastructure, technology management, delivery ownership, and long-term technical support.";

export const metadata: Metadata = {
  title: insightsTitle,
  description: insightsDescription,
  alternates: {
    canonical: "/insights",
  },
  openGraph: {
    url: "/insights",
    title: insightsTitle,
    description: insightsDescription,
  },
  twitter: {
    title: insightsTitle,
    description: insightsDescription,
  },
};

export default function InsightsRoute() {
  return <InsightsPage />;
}
