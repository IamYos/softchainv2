"use client";

import { useState } from "react";
import { FadeIn } from "@/components/marketing/FadeIn";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { PageContainer } from "@/components/marketing/PageContainer";
import { AboutScrambleHeading } from "@/components/marketing/about/AboutScrambleHeading";
import { SFContactForm } from "@/components/marketing/sf/SFContactForm";
import { SFFooter } from "@/components/marketing/sf/SFFooter";
import { InsightArticleOverlay, type InsightArticle } from "./InsightArticleOverlay";
import { INSIGHTS_PAGE_CONTENT } from "./insightsContent";
import styles from "./InsightsPage.module.css";

function InsightsHero() {
  return (
    <section
      id="hero-reveal"
      data-header-palette="dark"
      className={`${styles.heroSection} marketing-anchor`}
    >
      <PageContainer className={styles.heroContainer}>
        <div className={styles.heroInner}>
          <aside className={styles.heroCard}>
            <p className={styles.heroKicker}>Softchain Notes</p>
            <div className={styles.heroCardGlyph} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <h2 className={styles.heroCardTitle}>
              {INSIGHTS_PAGE_CONTENT.hero.cardTitle}
            </h2>
            <p className={styles.heroCardBody}>
              {INSIGHTS_PAGE_CONTENT.hero.cardBody}
            </p>
          </aside>

          <div className={styles.heroWordWrap}>
            <div className={styles.heroLineMask}>
              <AboutScrambleHeading
                as="h1"
                lines={[INSIGHTS_PAGE_CONTENT.hero.word]}
                className={styles.scrambleHeading}
                lineClassName={styles.heroWord}
                resolvedColor="#ff5841"
                scrambleColors={["#ff5841", "#b9b9b9"]}
                fitToContainer
                fitMode="width"
                minFontSizePx={52}
                maxFontSizePx={340}
              />
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

function InsightLibrary() {
  const [openArticle, setOpenArticle] = useState<InsightArticle | null>(null);

  return (
    <>
      <section
        id="insights-library"
        className={`${styles.librarySection} marketing-anchor`}
      >
        <PageContainer className={styles.libraryContainer}>
          <div className={styles.libraryIntro}>
            <p className={styles.sectionEyebrow}>Insight Library</p>
            <div className={styles.libraryTitleWrap}>
              <AboutScrambleHeading
                as="h2"
                lines={["Practical thinking for technical decisions."]}
                className={styles.libraryScrambleHeading}
                lineClassName={styles.libraryTitle}
                resolvedColor="#202020"
                scrambleColors={["#202020", "#ff5841"]}
                fitToContainer
                fitMode="width"
                minFontSizePx={24}
                maxFontSizePx={320}
              />
            </div>
          </div>

          <div className={styles.articleGridWrap}>
            {openArticle ? (
              <InsightArticleOverlay
                article={openArticle}
                onClose={() => setOpenArticle(null)}
              />
            ) : (
              <div className={styles.articleGrid}>
                {INSIGHTS_PAGE_CONTENT.articles.map((article, index) => (
                  <FadeIn key={article.title} delayMs={index * 55}>
                    <button
                      type="button"
                      className={styles.articleCard}
                      onClick={() => setOpenArticle(article)}
                      aria-label={`Read: ${article.title}`}
                    >
                      <div className={styles.articleMetaRow}>
                        <span>{article.label}</span>
                        <span>{article.readTime}</span>
                      </div>
                      <h3 className={styles.articleTitle}>{article.title}</h3>
                      <p className={styles.articleDescription}>{article.description}</p>
                      <div className={styles.articleTags} aria-label="Insight tags">
                        {article.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </button>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </PageContainer>
      </section>
    </>
  );
}

export function InsightsPage() {
  return (
    <MarketingPageShell currentPage="insights">
      <main className="marketing-v2" data-header-theme="dark">
        <InsightsHero />
        <InsightLibrary />
        <SFContactForm />
        <SFFooter currentPage="insights" />
      </main>
    </MarketingPageShell>
  );
}
