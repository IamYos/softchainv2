import { FadeIn } from "@/components/marketing/FadeIn";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { PageContainer } from "@/components/marketing/PageContainer";
import { SFContactForm } from "@/components/marketing/sf/SFContactForm";
import { SFFooter } from "@/components/marketing/sf/SFFooter";
import { TechStackGrid } from "@/components/marketing/sf/TechStackGrid";
import { ABOUT_PAGE_CONTENT } from "./aboutContent";
import styles from "./AboutPage.module.css";

function AboutHero() {
  return (
    <section
      id="hero-reveal"
      data-header-palette="light"
      className={`${styles.heroSection} marketing-anchor`}
    >
      <PageContainer className={styles.heroContainer}>
        <div className={styles.heroInner}>
          <aside className={styles.heroCard}>
            <div className={styles.heroCardGlyph} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <h2 className={styles.heroCardTitle}>{ABOUT_PAGE_CONTENT.hero.cardTitle}</h2>
            <p className={styles.heroCardBody}>{ABOUT_PAGE_CONTENT.hero.cardBody}</p>
          </aside>

          <div className={styles.heroWordWrap}>
            <div className={styles.heroLineMask}>
              <h1 className={styles.heroWord}>{ABOUT_PAGE_CONTENT.hero.word}</h1>
            </div>
          </div>
        </div>
      </PageContainer>
      <div className={styles.heroBottomBand} aria-hidden="true" />
    </section>
  );
}

function SnapshotSection() {
  return (
    <section id="about-snapshot" className={`${styles.snapshotSection} marketing-anchor`}>
      <PageContainer className={styles.snapshotContainer}>
        <div className={styles.snapshotHeader}>
          <FadeIn>
            <p className={styles.sectionEyebrow}>{ABOUT_PAGE_CONTENT.snapshot.eyebrow}</p>
          </FadeIn>
          <FadeIn delayMs={80}>
            <h2 className={styles.snapshotTitle}>{ABOUT_PAGE_CONTENT.snapshot.title}</h2>
          </FadeIn>
          <FadeIn delayMs={140}>
            <p className={styles.snapshotDescription}>
              {ABOUT_PAGE_CONTENT.snapshot.description}
            </p>
          </FadeIn>
        </div>

        <div className={styles.snapshotGrid}>
          {ABOUT_PAGE_CONTENT.snapshot.items.map((item, index) => (
            <FadeIn key={item.label} delayMs={index * 70}>
              <article className={styles.snapshotCard}>
                <p className={styles.snapshotValue}>{item.value}</p>
                <h3 className={styles.snapshotLabel}>{item.label}</h3>
                <p className={styles.snapshotCopy}>{item.description}</p>
              </article>
            </FadeIn>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

function PrinciplesSection() {
  return (
    <section
      id="about-principles"
      className={`${styles.principlesSection} marketing-anchor`}
    >
      <div className={styles.principlesFrame}>
        <div className={styles.principlesLayout}>
          <div className={styles.principlesSticky}>
            <div className={styles.principlesPanel}>
              <div className={styles.principlesVisual}>
                <TechStackGrid />
              </div>

              <div className={styles.principlesPanelContent}>
                <p className={styles.sectionEyebrowDark}>
                  {ABOUT_PAGE_CONTENT.principles.eyebrow}
                </p>
                <h2 className={styles.principlesTitle}>
                  {ABOUT_PAGE_CONTENT.principles.title}
                </h2>
                <p className={styles.principlesDescription}>
                  {ABOUT_PAGE_CONTENT.principles.description}
                </p>
                <p className={styles.principlesQuote}>
                  {ABOUT_PAGE_CONTENT.principles.quote}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.principlesRail}>
            {ABOUT_PAGE_CONTENT.principles.items.map((item, index) => (
              <FadeIn key={item.title} delayMs={index * 80}>
                <article className={styles.principleCard}>
                  <p className={styles.principleLabel}>{item.label}</p>
                  <h3 className={styles.principleTitle}>{item.title}</h3>
                  <p className={styles.principleDescription}>{item.description}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section id="about-values" className={`${styles.valuesSection} marketing-anchor`}>
      <PageContainer className={styles.valuesContainer}>
        <div className={styles.valuesIntro}>
          <FadeIn>
            <p className={styles.sectionEyebrowDark}>{ABOUT_PAGE_CONTENT.values.eyebrow}</p>
          </FadeIn>
          <FadeIn delayMs={80}>
            <h2 className={styles.valuesTitle}>{ABOUT_PAGE_CONTENT.values.title}</h2>
          </FadeIn>
          <FadeIn delayMs={160}>
            <p className={styles.valuesAccent}>{ABOUT_PAGE_CONTENT.values.accent}</p>
          </FadeIn>
        </div>

        <div className={styles.valuesList}>
          {ABOUT_PAGE_CONTENT.values.items.map((item, index) => (
            <FadeIn key={item.title} delayMs={index * 70}>
              <article className={styles.valueRow}>
                <h3 className={styles.valueTitle}>{item.title}</h3>
                <p className={styles.valueDescription}>{item.description}</p>
              </article>
            </FadeIn>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

export function AboutPage() {
  return (
    <MarketingPageShell currentPage="about">
      <main className="marketing-v2" data-header-theme="dark">
        <AboutHero />
        <SnapshotSection />
        <PrinciplesSection />
        <ValuesSection />
        <SFContactForm />
        <SFFooter currentPage="about" />
      </main>
    </MarketingPageShell>
  );
}
