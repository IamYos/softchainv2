import Link from "next/link";
import { ScrambleTextReveal } from "@/components/marketing/ScrambleTextReveal";
import { INSIGHTS_PAGE_CONTENT } from "@/components/marketing/insights/insightsContent";
import styles from "./SFPostFrame.module.css";
import { TechStackGrid } from "./TechStackGrid";

const FEATURED_INSIGHT = {
  title: "End-to-end delivery with clear technical ownership.",
  date: "Lifecycle",
  description:
    "Scoping, architecture, implementation, integration, deployment, and long-term support handled by one team.",
  href: "/insights",
};

const INSIGHTS = INSIGHTS_PAGE_CONTENT.articles;

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
          <TechStackGrid />
        </div>
        <div className={styles.featureContent}>
          <ScrambleTextReveal
            as="h2"
            lines={[FEATURED_INSIGHT.title]}
            className={`${styles.featureTitle} ${styles.t8}`}
            lineClassName="block"
            loopClassName="block"
            resolvedColor="#b9b9b9"
          />
          <p className={`${styles.featureDate} ${styles.p}`}>{FEATURED_INSIGHT.date}</p>
          <p className={`${styles.featureDescription} ${styles.p}`}>
            {FEATURED_INSIGHT.description}
          </p>
          <Link
            href={FEATURED_INSIGHT.href}
            className={`${styles.monoPill} ${styles.featureButton} ${styles.p}`}
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
}

function InsightRail() {
  return (
    <div className={styles.insightRail}>
      {INSIGHTS.map((insight) => (
        <Link
          key={insight.slug}
          href={`/insights?article=${insight.slug}`}
          className={styles.insightItem}
        >
          <InsightLines />
          <div>
            <h3 className={`${styles.insightItemTitle} ${styles.p2}`}>{insight.title}</h3>
            <p className={`${styles.insightItemDate} ${styles.p}`}>{insight.label}</p>
            <p className={`${styles.insightItemDescription} ${styles.p}`}>
              {insight.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function SFInsightsBlock() {
  return (
    <section
      id="sf-insights"
      className={`${styles.sectionRoot} ${styles.insightsSection} marketing-anchor`}
    >
      <div className={styles.insightsMobile}>
        <FeaturedPanel />
        <InsightRail />
      </div>

      <div className={styles.insightsDesktop}>
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
