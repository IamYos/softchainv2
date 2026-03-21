import { FadeIn } from "@/components/marketing/FadeIn";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { PageContainer } from "@/components/marketing/PageContainer";
import { SFContactForm } from "@/components/marketing/sf/SFContactForm";
import { SFFooter } from "@/components/marketing/sf/SFFooter";
import { AboutProcessSection } from "./AboutProcessSection";
import { AboutScrambleHeading } from "./AboutScrambleHeading";
import { AboutPixelGrid } from "./AboutPixelGrid";
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
              <AboutScrambleHeading
                as="h1"
                lines={[ABOUT_PAGE_CONTENT.hero.word]}
                className={styles.scrambleHeading}
                lineClassName={styles.heroWord}
                resolvedColor="#202020"
                scrambleColors={["#202020", "#b9b9b9"]}
              />
            </div>
          </div>
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
                <AboutPixelGrid />
              </div>

              <div className={styles.principlesPanelContent}>
                <p className={styles.sectionEyebrowDark}>
                  {ABOUT_PAGE_CONTENT.principles.eyebrow}
                </p>
                <AboutScrambleHeading
                  lines={[ABOUT_PAGE_CONTENT.principles.title]}
                  className={`${styles.scrambleHeading} ${styles.principlesHeading}`}
                  lineClassName={styles.principlesTitle}
                  resolvedColor="#b9b9b9"
                  fitToContainer
                  minFontSizePx={22}
                  maxFontSizePx={124}
                />
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
          <AboutScrambleHeading
            lines={[ABOUT_PAGE_CONTENT.values.title]}
            className={styles.scrambleHeading}
            lineClassName={styles.valuesTitle}
            resolvedColor="#b9b9b9"
          />
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

        <div className={styles.valuesSnapshot}>
          <FadeIn>
            <p className={styles.sectionEyebrowDark}>{ABOUT_PAGE_CONTENT.snapshot.eyebrow}</p>
          </FadeIn>

          <FadeIn delayMs={80}>
            <p className={styles.valuesSnapshotDescription}>
              {ABOUT_PAGE_CONTENT.snapshot.description}
            </p>
          </FadeIn>

          <div className={styles.valuesSnapshotGrid}>
            {ABOUT_PAGE_CONTENT.snapshot.items.map((item, index) => (
              <FadeIn key={item.label} delayMs={index * 60}>
                <article className={styles.valuesSnapshotCard}>
                  <p className={styles.valuesSnapshotValue}>{item.value}</p>
                  <p className={styles.valuesSnapshotLabel}>{item.label}</p>
                  <p className={styles.valuesSnapshotCopy}>{item.description}</p>
                </article>
              </FadeIn>
            ))}
          </div>
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
        <AboutProcessSection />
        <PrinciplesSection />
        <ValuesSection />
        <SFContactForm />
        <SFFooter currentPage="about" />
      </main>
    </MarketingPageShell>
  );
}
