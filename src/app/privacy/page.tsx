import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal/LegalPage";

const privacyTitle = "Privacy Policy | Softchain";
const privacyDescription =
  "How Softchain collects, uses, and protects information when you visit softchain.ae or engage our services.";

export const metadata: Metadata = {
  title: privacyTitle,
  description: privacyDescription,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    url: "/privacy",
    title: privacyTitle,
    description: privacyDescription,
  },
  twitter: {
    title: privacyTitle,
    description: privacyDescription,
  },
};

export default function PrivacyRoute() {
  return <LegalPage doc="privacy" />;
}
