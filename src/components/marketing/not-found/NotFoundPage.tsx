import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { SFFooter } from "@/components/marketing/sf/SFFooter";
import { NotFoundGlyph } from "./NotFoundGlyph";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  return (
    <MarketingPageShell currentPage="not-found">
      <main className={styles.notFoundRoot} data-header-theme="light">
        <section
          id="hero-reveal"
          className={`${styles.hero} marketing-anchor`}
          data-header-palette="light"
        >
          <div className={styles.container}>
            <div className={styles.glyphFrame}>
              <NotFoundGlyph />
            </div>

            <div className={styles.copy}>
              <div className={styles.eyebrowRow}>
                <span className={styles.accentBar} aria-hidden="true" />
                <p className={styles.eyebrow}>Error 404 &middot; Page not found</p>
              </div>

              <h1 className={styles.heading}>This route does not exist.</h1>

              <p className={styles.body}>
                The page you are looking for has been moved, renamed, or never
                existed. Head back to the homepage or jump into our solutions.
              </p>

              <div className={styles.actions}>
                <Link href="/" className={styles.primaryCta}>
                  <span aria-hidden="true">&rarr;</span>
                  <span>cd /home</span>
                </Link>
                <Link href="/solutions" className={styles.secondaryCta}>
                  <span>See solutions</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <SFFooter currentPage="not-found" />
      </main>
    </MarketingPageShell>
  );
}
