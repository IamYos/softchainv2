export const ABOUT_PAGE_CONTENT = {
  hero: {
    word: "Company.",
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
    title: "The team behind the work.",
    description:
      "Softchain is an engineering firm. We scope, design, build, integrate, and operate systems for clients globally from a single accountable team in Dubai.",
    items: [
      {
        value: "2022",
        label: "Founded",
        description:
          "Softchain was founded in 2022 as an engineering firm focused on end-to-end delivery rather than separate strategy, build, and support vendors.",
      },
      {
        value: "Dubai, UAE",
        label: "Headquarters",
        description:
          "The team operates from Dubai, with engineering, delivery coordination, and client relationships run out of a single base.",
      },
      {
        value: "Licensed",
        label: "Operating jurisdiction",
        description:
          "Softchain is licensed in the United Arab Emirates and contracts directly with clients across regions under that framework.",
      },
      {
        value: "Global",
        label: "Client delivery",
        description:
          "Engagements are delivered internationally across startups, founders, growing businesses, and established companies, without sector or geography limits.",
      },
    ],
  },
  principles: {
    eyebrow: "Operating Principles",
    title: "The positions the team holds, on every project.",
    items: [
      {
        label: "Architecture",
        title: "Defined before development starts.",
        description:
          "We do not begin building before the stack, system boundaries, data model, and delivery plan are coherent. The position the business is agreeing to is written down before the first commit.",
      },
      {
        label: "Integration",
        title: "Designed, not improvised at the seams.",
        description:
          "Connections to ERPs, CRMs, APIs, identity, and data systems are treated as first-class architecture. Contracts, failure modes, and ownership are decided up front rather than discovered in production.",
      },
      {
        label: "Infrastructure",
        title: "Part of delivery, not a cleanup phase.",
        description:
          "Cloud, on-premise, and hybrid environments are planned with observability, permissions, recovery, and operational support designed in from the start — not bolted on after launch.",
      },
      {
        label: "Support",
        title: "Scoped to the risk the system carries.",
        description:
          "Maintenance, retained engineering, managed updates, and incident response are structured around what the business stands to lose when the system is down or drifting, not as a default package.",
      },
    ],
  },
} as const;
