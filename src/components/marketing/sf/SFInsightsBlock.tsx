import Image from "next/image";
import styles from "./SFPostFrame.module.css";

const FEATURED_INSIGHT = {
  title: "Engineering work that survives the real world, not just the kickoff.",
  date: "Softchain delivery model",
  description:
    "We take ownership of scoping, architecture, implementation, integration, deployment, and long-term support instead of stopping at advisory work.",
  href: "#closing-cta",
  image: "/softchain-logo.png",
};

const INSIGHTS = [
  {
    title: "Architecture is defined before development starts.",
    date: "Scoping",
    description:
      "We do not start building before the stack, boundaries, and delivery plan are coherent.",
  },
  {
    title: "AI belongs where it improves throughput, accuracy, or leverage.",
    date: "AI Systems",
    description:
      "Model selection, deployment method, and system design are chosen by constraints, not hype.",
  },
  {
    title: "Native mobile is used when platform quality actually matters.",
    date: "Mobile",
    description:
      "Internal tools, secure workflows, and public products are built without compromising platform standards.",
  },
  {
    title: "Infrastructure is part of delivery, not a cleanup phase.",
    date: "Operations",
    description:
      "Cloud, on-premise, and hybrid systems are planned with observability, security, and support from the start.",
  },
  {
    title: "Support continues after launch when the engagement requires it.",
    date: "Long-term",
    description:
      "Maintenance, retained engineering, managed updates, and operational support are structured per project.",
  },
  {
    title: "Founders can work with Softchain as a CTO-level partner.",
    date: "Startups",
    description:
      "We translate product goals into architecture and carry execution through production when there is no internal technical lead.",
  },
  {
    title: "Businesses get senior execution without building oversized teams.",
    date: "Businesses",
    description:
      "Delivery, integration, infrastructure, and support can be owned end to end without internal bloat.",
  },
  {
    title: "Licensed in Dubai. Delivering internationally.",
    date: "Company",
    description:
      "Softchain is headquartered in Dubai, UAE and delivers software and technical systems internationally.",
  },
] as const;

function InsightLines() {
  return (
    <div className={styles.insightLines} aria-hidden="true">
      <span className={styles.insightLineX} />
      <span className={styles.insightLineY} />
    </div>
  );
}

function FeaturedPanel() {
  return (
    <div className={styles.featurePanel}>
      <div className={styles.featureGrid}>
        <div className={styles.featureImageWrap}>
          <Image
            src={FEATURED_INSIGHT.image}
            alt="Softchain logo"
            className={styles.featureImage}
            height={1931}
            priority={false}
            sizes="(max-width: 749px) 100vw, (max-width: 1024px) 72rem, 72rem"
            width={2160}
          />
        </div>
        <div className={styles.featureContent}>
          <h2 className={`${styles.featureTitle} ${styles.t8}`}>{FEATURED_INSIGHT.title}</h2>
          <p className={`${styles.featureDate} ${styles.p}`}>{FEATURED_INSIGHT.date}</p>
          <p className={`${styles.featureDescription} ${styles.p}`}>
            {FEATURED_INSIGHT.description}
          </p>
          <a
            href={FEATURED_INSIGHT.href}
            className={`${styles.monoPill} ${styles.featureButton} ${styles.p}`}
          >
            Start a Project
          </a>
        </div>
      </div>
    </div>
  );
}

function InsightRail() {
  return (
    <div className={styles.insightRail}>
      {INSIGHTS.map((insight) => (
        <a key={insight.title} href="#closing-cta" className={styles.insightItem}>
          <InsightLines />
          <div>
            <h3 className={`${styles.insightItemTitle} ${styles.p2}`}>{insight.title}</h3>
            <p className={`${styles.insightItemDate} ${styles.p}`}>{insight.date}</p>
            <p className={`${styles.insightItemDescription} ${styles.p}`}>
              {insight.description}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}

export function SFInsightsBlock() {
  return (
    <section
      id="sf-insights"
      className={`${styles.sectionRoot} ${styles.insightsSection}`}
    >
      <div className={styles.insightsMobile}>
        <FeaturedPanel />
        <InsightRail />
      </div>

      <div className={`${styles.insightsDesktop} ${styles.wrapper}`}>
        <div className={styles.insightsDesktopLayout}>
          <div className={styles.stickyPanelWrap}>
            <FeaturedPanel />
          </div>
          <InsightRail />
        </div>
      </div>
    </section>
  );
}
