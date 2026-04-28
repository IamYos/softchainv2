export const INSIGHTS_PAGE_CONTENT = {
  hero: {
    word: "Insights.",
    cardTitle: "Field notes for teams building serious systems.",
    cardBody:
      "Architecture, AI, infrastructure, delivery, and support notes from the work Softchain is built to own.",
  },
  featured: {
    eyebrow: "Featured Brief",
    title: "Clear technical ownership is the difference between software that launches and software that keeps working.",
    description:
      "The strongest delivery model connects scoping, architecture, implementation, deployment, and support before the first sprint starts.",
    meta: "Lifecycle / Delivery",
  },
  tracks: [
    "Software Design & Engineering",
    "AI Systems",
    "IT Infrastructure",
    "Technology Management",
  ],
  articles: [
    {
      label: "Architecture",
      readTime: "6 min read",
      title: "Architecture is a business decision before it is a technical diagram.",
      description:
        "A system plan should make tradeoffs visible: speed, security, cost, maintainability, vendor dependency, and the operational load after launch.",
      tags: ["Scoping", "Systems", "Delivery"],
    },
    {
      label: "AI Systems",
      readTime: "5 min read",
      title: "AI earns its place when it improves throughput, accuracy, or leverage.",
      description:
        "Model choice, retrieval design, private data boundaries, and deployment method should follow the workflow constraints instead of the hype cycle.",
      tags: ["RAG", "Automation", "Inference"],
    },
    {
      label: "Infrastructure",
      readTime: "7 min read",
      title: "Infrastructure cannot be treated as cleanup after the product is built.",
      description:
        "Cloud, on-premise, and hybrid environments need observability, permissions, backups, and support paths designed into the delivery plan.",
      tags: ["Cloud", "Security", "Operations"],
    },
    {
      label: "Mobile",
      readTime: "4 min read",
      title: "Native mobile is worth it when platform quality carries the workflow.",
      description:
        "Secure access, device capabilities, offline behavior, and polished public product experiences can justify a native path over a shortcut.",
      tags: ["iOS", "Android", "Product"],
    },
    {
      label: "Support",
      readTime: "5 min read",
      title: "Support is part of the architecture when the system matters.",
      description:
        "Maintenance, retained engineering, incident response, and managed updates should be scoped around the business risk of downtime or drift.",
      tags: ["Maintenance", "Reliability", "Ownership"],
    },
    {
      label: "Leadership",
      readTime: "6 min read",
      title: "Fractional technical leadership works when execution stays attached.",
      description:
        "Technology management is strongest when planning, vendor coordination, implementation decisions, and delivery accountability live together.",
      tags: ["CTO", "Procurement", "Governance"],
    },
  ],
} as const;
