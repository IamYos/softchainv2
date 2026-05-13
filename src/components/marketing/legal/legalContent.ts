export type LegalDoc = "privacy" | "terms";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalContent = {
  kind: LegalDoc;
  title: string;
  lede: string;
  lastUpdated: string;
  sections: LegalSection[];
};

const LAST_UPDATED = "13 May 2026";

const PRIVACY_POLICY: LegalContent = {
  kind: "privacy",
  title: "Privacy Policy",
  lede: "This policy explains what information Softchain collects when you visit softchain.ae or engage us for services, how that information is used, and the choices you have.",
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: "Scope",
      paragraphs: [
        "This policy applies to softchain.ae and any service operated by Softchain, a company licensed in Dubai, UAE. It does not apply to third-party sites we link to.",
      ],
    },
    {
      heading: "Information we collect",
      paragraphs: [
        "We collect information you provide directly — for example when you submit a contact form, request a proposal, or correspond with us by email.",
        "We also collect limited technical information automatically, including IP address, browser type, device type, referring page, and timestamps. This is used to operate and secure the site.",
      ],
    },
    {
      heading: "How we use information",
      paragraphs: [
        "We use the information to respond to enquiries, deliver and improve our services, prevent abuse, and comply with legal obligations.",
        "We do not sell personal information to third parties.",
      ],
    },
    {
      heading: "Third parties",
      paragraphs: [
        "We rely on a limited number of service providers — for hosting, analytics, email delivery, and similar operational needs. These providers are contractually bound to handle data only on our instructions.",
      ],
    },
    {
      heading: "Retention",
      paragraphs: [
        "We retain personal information for as long as needed to provide our services and meet our legal and contractual obligations. When no longer required, it is deleted or anonymised.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "You may request access to, correction of, or deletion of personal information we hold about you. Where applicable law gives you additional rights, you may exercise them by contacting us using the address below.",
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "We apply reasonable technical and organisational measures to protect personal information against loss, misuse, and unauthorised access. No internet transmission is fully secure, so we cannot guarantee absolute security.",
      ],
    },
    {
      heading: "Changes",
      paragraphs: [
        "We may update this policy from time to time. Material changes will be reflected by updating the date at the top of this page.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        "Questions about this policy can be sent to hello@softchain.ae.",
      ],
    },
  ],
};

const TERMS_OF_USE: LegalContent = {
  kind: "terms",
  title: "Terms of Use",
  lede: "These terms govern your use of softchain.ae and any services we provide. By accessing the site or engaging us, you agree to these terms.",
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: "Acceptance",
      paragraphs: [
        "By using this site you confirm that you have read, understood, and accepted these terms. If you do not agree, please do not use the site.",
      ],
    },
    {
      heading: "Services",
      paragraphs: [
        "Softchain provides software design and engineering, AI systems, IT infrastructure, and technology management services. The scope and terms of any engagement are set out in a separate written agreement.",
      ],
    },
    {
      heading: "Acceptable use",
      paragraphs: [
        "You agree not to misuse the site — including attempting to gain unauthorised access, interfering with its operation, or using it for unlawful purposes.",
      ],
    },
    {
      heading: "Intellectual property",
      paragraphs: [
        "All content on this site — including text, graphics, logos, and code — is owned by Softchain or its licensors and is protected by applicable intellectual property laws. You may not copy, reproduce, or redistribute material from this site without prior written consent.",
      ],
    },
    {
      heading: "Disclaimers",
      paragraphs: [
        "The site and its content are provided on an “as is” and “as available” basis without warranties of any kind, express or implied, to the extent permitted by law.",
      ],
    },
    {
      heading: "Limitation of liability",
      paragraphs: [
        "To the maximum extent permitted by law, Softchain is not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the site.",
      ],
    },
    {
      heading: "Indemnification",
      paragraphs: [
        "You agree to indemnify Softchain against claims arising from your misuse of the site or breach of these terms.",
      ],
    },
    {
      heading: "Governing law",
      paragraphs: [
        "These terms are governed by the laws of the United Arab Emirates. Disputes are subject to the exclusive jurisdiction of the courts of Dubai.",
      ],
    },
    {
      heading: "Changes",
      paragraphs: [
        "We may update these terms from time to time. Continued use of the site after changes are posted constitutes acceptance of the updated terms.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        "Questions about these terms can be sent to hello@softchain.ae.",
      ],
    },
  ],
};

export const LEGAL_DOCS: Record<LegalDoc, LegalContent> = {
  privacy: PRIVACY_POLICY,
  terms: TERMS_OF_USE,
};
