import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal/LegalPage";

const termsTitle = "Terms of Use | Softchain";
const termsDescription =
  "The terms that govern your use of softchain.ae and any services provided by Softchain.";

export const metadata: Metadata = {
  title: termsTitle,
  description: termsDescription,
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    url: "/terms",
    title: termsTitle,
    description: termsDescription,
  },
  twitter: {
    title: termsTitle,
    description: termsDescription,
  },
};

export default function TermsRoute() {
  return <LegalPage doc="terms" />;
}
