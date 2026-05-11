"use client";

import { useEffect, useRef } from "react";
import styles from "./InsightArticleOverlay.module.css";

export type InsightArticleBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: readonly string[] };

export type InsightArticleSection = {
  heading?: string;
  blocks: readonly InsightArticleBlock[];
};

export type InsightArticle = {
  slug: string;
  label: string;
  readTime: string;
  title: string;
  description: string;
  body: readonly InsightArticleSection[];
  tags: readonly string[];
};

type Props = {
  article: InsightArticle;
  onClose: () => void;
};

export function InsightArticleOverlay({ article, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only listen for Escape — the overlay is contained inside the article
    // grid block, not a fullscreen modal, so we don't lock body scroll.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    // Scroll the WRAP (parent) into view, not the overlay itself.
    // The overlay enters at transform: translateY(-100%) and animates down.
    // scrollIntoView measures the visual position (which includes the
    // transform), so targeting the overlay scrolls to its mid-animation
    // location and leaves the final resting position one overlay-height
    // too low — which is exactly the "starts in the middle" symptom.
    // The wrap doesn't animate, so its layout top is the right target;
    // CSS provides the header-clearance via scroll-margin-top on the wrap.
    requestAnimationFrame(() => {
      ref.current?.parentElement?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <div
      ref={ref}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={article.title}
    >
      {/* No autoFocus on the back button — the overlay starts at translateY(-100%)
          (above its container) and animates down, so focusing on mount makes the
          browser scroll to bring the off-screen button into view, dragging the
          whole page with it. Esc still closes via the document keydown listener. */}
      <button type="button" className={styles.backButton} onClick={onClose}>
        <svg className={styles.backArrow} viewBox="0 0 16 12" aria-hidden>
          <path
            d="M6 1 1 6l5 5M1 6h14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Back</span>
      </button>

      <article className={styles.content}>
        <div className={styles.metaRow}>
          <span>{article.label}</span>
          <span className={styles.metaDivider} aria-hidden>·</span>
          <span>{article.readTime}</span>
        </div>

        <h1 className={styles.title}>{article.title}</h1>

        {article.body.map((section, sIdx) => (
          <section key={sIdx} className={styles.section}>
            {section.heading && (
              <h2 className={styles.sectionHeading}>{section.heading}</h2>
            )}
            {section.blocks.map((block, bIdx) =>
              block.type === "p" ? (
                <p key={bIdx} className={styles.body}>
                  {block.text}
                </p>
              ) : (
                <ul key={bIdx} className={styles.list}>
                  {block.items.map((item, iIdx) => (
                    <li key={iIdx} className={styles.listItem}>
                      {item}
                    </li>
                  ))}
                </ul>
              ),
            )}
          </section>
        ))}

        <div className={styles.tags} aria-label="Tags">
          {article.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </article>
    </div>
  );
}
