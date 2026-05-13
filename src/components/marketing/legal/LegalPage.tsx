import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { SFFooter } from "@/components/marketing/sf/SFFooter";
import { LEGAL_DOCS, type LegalDoc } from "./legalContent";
import styles from "./LegalPage.module.css";

type LegalPageProps = {
  doc: LegalDoc;
};

export function LegalPage({ doc }: LegalPageProps) {
  const content = LEGAL_DOCS[doc];
  const eyebrowLabel = doc === "privacy" ? "Privacy" : "Terms";

  return (
    <MarketingPageShell currentPage="legal">
      <main className={styles.legalRoot} data-header-theme="light">
        <section
          id="hero-reveal"
          className={`${styles.hero} marketing-anchor`}
          data-header-palette="light"
        >
          <div className={styles.container}>
            <div className={styles.eyebrowRow}>
              <span className={styles.accentBar} aria-hidden="true" />
              <p className={styles.eyebrow}>{eyebrowLabel}</p>
            </div>
            <h1 className={styles.title}>{content.title}</h1>
            <p className={styles.lede}>{content.lede}</p>
          </div>
        </section>

        <section className={styles.body}>
          <div className={styles.container}>
            <div className={styles.sectionList}>
              {content.sections.map((section) => (
                <article key={section.heading} className={styles.sectionItem}>
                  <h2 className={styles.sectionHeading}>{section.heading}</h2>
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index} className={styles.paragraph}>
                      {paragraph}
                    </p>
                  ))}
                </article>
              ))}
            </div>

            <div className={styles.backRow}>
              <Link href="/" className={styles.backLink}>
                <span aria-hidden="true">&larr;</span>
                <span>Back home</span>
              </Link>
            </div>
          </div>
        </section>

        <SFFooter currentPage="legal" />
      </main>
    </MarketingPageShell>
  );
}
