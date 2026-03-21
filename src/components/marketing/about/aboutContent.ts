export const ABOUT_PAGE_CONTENT = {
  hero: {
    word: "About.",
    cardTitle: "Architecture first. Delivery end to end.",
    cardBody:
      "Scoping, architecture, implementation, integration, deployment, and long-term support handled by one team.",
  },
  process: {
    heading: "How we work.",
    description:
      "Softchain scopes, designs, builds, integrates, and supports systems through one continuous delivery path so strategy, execution, and long-term ownership stay aligned.",
    stages: [
      {
        title: "Discovery",
        visualLabel: ["Discovery"],
        description:
          "We start with the business context, delivery constraints, existing systems, and the operational outcome the project needs to reach before any architecture is locked in.",
      },
      {
        title: "Architecture",
        visualLabel: ["Architecture"],
        description:
          "The working model, system boundaries, data flow, integrations, and implementation plan are shaped before the build begins so the delivery path stays coherent.",
      },
      {
        title: "Build",
        visualLabel: ["Build"],
        description:
          "Software, AI workflows, infrastructure components, and automation are implemented against the agreed architecture with delivery quality controlled inside one team.",
      },
      {
        title: "Integration",
        visualLabel: ["Integration"],
        description:
          "Deployments, environment setup, testing, observability, and third-party or internal connections are handled as part of the same system rather than separate handoffs.",
      },
      {
        title: "Ongoing Support",
        visualLabel: ["Ongoing", "Support"],
        description:
          "After launch, Softchain can continue through managed updates, retained engineering, infrastructure operations, and long-term technical support where required.",
      },
    ],
  },
  snapshot: {
    eyebrow: "Company Snapshot",
    title: "Businesses get senior execution without building oversized teams.",
    description:
      "Headquartered in Dubai and delivering globally, Softchain brings architecture, delivery, infrastructure, and long-term support together under one accountable team.",
    items: [
      {
        value: "Dubai",
        label: "Headquarters",
        description: "Softchain is headquartered in Dubai, UAE.",
      },
      {
        value: "Global",
        label: "Delivery",
        description: "Software and technical systems are delivered internationally.",
      },
      {
        value: "4",
        label: "Core disciplines",
        description:
          "Software Design & Engineering, AI Systems, IT Infrastructure, and Technology Management.",
      },
      {
        value: "End-to-end",
        label: "Ownership",
        description:
          "Scoping, architecture, implementation, integration, deployment, and long-term support handled by one team.",
      },
    ],
  },
  principles: {
    eyebrow: "Operating Principles",
    title: "Delivery stays clearer when architecture, execution, and support are not split apart.",
    items: [
      {
        label: "Lifecycle",
        title: "End-to-end delivery with clear technical ownership.",
        description:
          "Scoping, architecture, implementation, integration, deployment, and long-term support handled by one team.",
      },
      {
        label: "Startups",
        title: "Founders can work with Softchain as a CTO-level partner.",
        description:
          "Product goals are translated into architecture and carried through production when there is no internal technical lead.",
      },
      {
        label: "Businesses",
        title: "Businesses get senior execution without building oversized teams.",
        description:
          "Delivery, integration, infrastructure, and support can be owned end to end without internal bloat.",
      },
      {
        label: "Company",
        title: "Licensed in Dubai. Delivering internationally.",
        description:
          "Softchain is headquartered in Dubai, UAE and delivers software and technical systems internationally.",
      },
    ],
  },
  values: {
    eyebrow: "How We Work",
    title: "Constraint-led decisions across software, AI, infrastructure, and support.",
    items: [
      {
        title: "AI belongs where it improves throughput, accuracy, or leverage.",
        description:
          "Model selection, deployment method, and system design are chosen by constraints, not hype.",
      },
      {
        title: "IT infrastructure is part of delivery, not a cleanup phase.",
        description:
          "Cloud, on-premise, and hybrid systems are planned with observability, security, and support from the start.",
      },
      {
        title: "Support continues after launch when the engagement requires it.",
        description:
          "Maintenance, retained engineering, managed updates, and operational support are structured per project.",
      },
    ],
  },
} as const;
