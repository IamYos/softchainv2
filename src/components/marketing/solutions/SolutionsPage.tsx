import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { PageContainer } from "@/components/marketing/PageContainer";
import { AboutScrambleHeading } from "@/components/marketing/about/AboutScrambleHeading";
import { SFContactForm } from "@/components/marketing/sf/SFContactForm";
import { SFFooter } from "@/components/marketing/sf/SFFooter";
import { SOLUTIONS_PAGE_CONTENT } from "./solutionsContent";
import styles from "./SolutionsPage.module.css";

function SolutionsHero() {
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
            <h2 className={styles.heroCardTitle}>
              {SOLUTIONS_PAGE_CONTENT.hero.cardTitle}
            </h2>
            <p className={styles.heroCardBody}>
              {SOLUTIONS_PAGE_CONTENT.hero.cardBody}
            </p>
          </aside>

          <div className={styles.heroWordWrap}>
            <div className={styles.heroLineMask}>
              <AboutScrambleHeading
                as="h1"
                lines={[SOLUTIONS_PAGE_CONTENT.hero.word]}
                className={styles.scrambleHeading}
                lineClassName={styles.heroWord}
                resolvedColor="#202020"
                scrambleColors={["#202020", "#ff5841"]}
                fitToContainer
                fitMode="width"
                minFontSizePx={52}
                maxFontSizePx={360}
              />
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

function SolutionsEngine() {
  return (
    <section
      id="solutions-engine"
      className={`${styles.engineSection} marketing-anchor`}
    >
      <iframe
        title="Anime.js homepage solutions"
        src="/solutions/home.html"
        className={styles.engineFrame}
      />
    </section>
  );
}

export function SolutionsPage() {
  return (
    <MarketingPageShell currentPage="solutions">
      <main className="marketing-v2" data-header-theme="dark">
        <SolutionsHero />
        <SolutionsEngine />
        <SFContactForm />
        <SFFooter currentPage="solutions" />
      </main>
    </MarketingPageShell>
  );
}
