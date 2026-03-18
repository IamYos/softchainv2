"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HEADER_MENU_SECONDARY_ITEMS,
  HEADER_MENU_SOLUTION_ITEMS,
} from "@/components/marketing/header/navigation";
import styles from "./SFPostFrame.module.css";

export function SFFooter() {
  const footerTitleRef = useRef<HTMLDivElement>(null);
  const footerWordmarkRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = footerTitleRef.current;
    const wordmark = footerWordmarkRef.current;

    if (!container || !wordmark) {
      return;
    }

    const fitWordmark = () => {
      const maxSize = 260;
      const minSize = 48;
      const availableWidth = container.clientWidth;

      if (availableWidth <= 0) {
        return;
      }

      let low = minSize;
      let high = maxSize;
      let best = minSize;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        wordmark.style.fontSize = `${mid}px`;

        if (wordmark.scrollWidth <= availableWidth) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      wordmark.style.fontSize = `${best}px`;
    };

    fitWordmark();

    const observer = new ResizeObserver(() => {
      fitWordmark();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <footer id="footer" className={`${styles.sectionRoot} ${styles.footerSection}`}>
      <div className={styles.wrapper} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div className={styles.footerBlock}>
          <div className={styles.footerBlockContent}>
            <Link href="/" className={styles.footerLogo} aria-label="Softchain home">
              <div className={`relative h-full w-full ${styles.footerLogoMark}`}>
                <Image
                  src="/softchain-logo.png"
                  alt="Softchain"
                  fill
                  sizes="160px"
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <ul className={`${styles.footerNav} ${styles.footerNavPrimary}`}>
              <li className={`${styles.footerNavItem} ${styles.p2}`}>
                <h4 className={styles.footerSubmenuTitle} aria-level={4}>
                  Solutions<sup>{HEADER_MENU_SOLUTION_ITEMS.length}</sup>
                </h4>
                <ul className={styles.footerSubmenuList}>
                  {HEADER_MENU_SOLUTION_ITEMS.map((item) => (
                    <li key={item.label} className={`${styles.footerSubmenuItem} ${styles.p2}`}>
                      <a href={`#${item.target}`}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>

            <ul className={`${styles.footerNav} ${styles.footerNavSecondary}`}>
              {HEADER_MENU_SECONDARY_ITEMS.map((item) => (
                <li key={item.label} className={`${styles.footerNavItem} ${styles.p2}`}>
                  <a href={`#${item.target}`}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.footerBlockContent} ${styles.footerBlockContentSecondary}`}>
            <div className={styles.footerBlockItem}>
              <span className="mb-2 block h-[2px] w-10 bg-[#ff5841]" />
              <p className={styles.p}>Headquartered in Dubai. Delivering globally.</p>
            </div>
            <div className={styles.footerBlockItem}>
              <p className={styles.p}>
                Softchain
                <br />
                Licensed in Dubai, UAE
              </p>
            </div>
          </div>

          <div className={`${styles.footerCopy} ${styles.footerCopyMobile}`}>
            <p className={`${styles.footerCopyItem} ${styles.p}`}>&copy;2026 Softchain.</p>
            <a className={`${styles.footerCopyItem} ${styles.p}`} href="#footer">
              Privacy Policy
            </a>
            <a className={`${styles.footerCopyItem} ${styles.p}`} href="#footer">
              Terms of Use
            </a>
            <span className={`${styles.footerCopyItem} ${styles.p}`}>Global delivery</span>
          </div>

          <div ref={footerTitleRef} className={styles.footerTitle}>
            <span ref={footerWordmarkRef} className={styles.footerWordmark}>
              SOFTCHAIN
            </span>
          </div>

          <div className={`${styles.footerCopy} ${styles.footerCopyDesktop}`}>
            <p className={`${styles.footerCopyItem} ${styles.p}`}>&copy;2026 Softchain.</p>
            <a className={`${styles.footerCopyItem} ${styles.p}`} href="#footer">
              Privacy Policy
            </a>
            <a className={`${styles.footerCopyItem} ${styles.p}`} href="#footer">
              Terms of Use
            </a>
            <span className={`${styles.footerCopyItem} ${styles.p}`}>Dubai, UAE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
