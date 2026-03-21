"use client";

import {
  getHeaderNavHref,
  HEADER_MENU_SECONDARY_ITEMS,
  HEADER_MENU_SOLUTION_ITEMS,
  type MarketingPageContext,
} from "@/components/marketing/header/navigation";
import styles from "./SFPostFrame.module.css";

type SFFooterProps = {
  currentPage: MarketingPageContext;
};

export function SFFooter({ currentPage }: SFFooterProps) {
  return (
    <footer id="footer" className={`${styles.sectionRoot} ${styles.footerSection}`}>
      <div className={styles.wrapper} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div
          className={styles.footerBlock}
          data-header-hide-zone="footer"
          data-softchain-cursor-rgb="255, 88, 65"
        >
          <div className={styles.footerTopGrid}>
            <div className={styles.footerPrimaryColumn}>
              <ul className={`${styles.footerNav} ${styles.footerNavPrimary}`}>
                <li className={`${styles.footerNavItem} ${styles.p2}`}>
                  <h4 className={styles.footerSubmenuTitle} aria-level={4}>
                    Solutions<sup>{HEADER_MENU_SOLUTION_ITEMS.length}</sup>
                  </h4>
                  <ul className={styles.footerSubmenuList}>
                    {HEADER_MENU_SOLUTION_ITEMS.map((item) => (
                      <li key={item.label} className={`${styles.footerSubmenuItem} ${styles.p2}`}>
                        <a href={getHeaderNavHref(item, currentPage)}>{item.label}</a>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </div>

            <div className={styles.footerSecondaryColumn}>
              <ul className={`${styles.footerNav} ${styles.footerNavSecondary}`}>
                {HEADER_MENU_SECONDARY_ITEMS.map((item) => (
                  <li key={item.label} className={`${styles.footerNavItem} ${styles.p2}`}>
                    <a href={getHeaderNavHref(item, currentPage)}>{item.label}</a>
                  </li>
                ))}
              </ul>

              <div className={styles.footerMetaStack}>
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

          <div className={styles.footerTitle}>
            <svg
              viewBox="0 0 1000 180"
              aria-hidden="true"
              className={styles.footerWordmarkSvg}
              preserveAspectRatio="xMinYMax meet"
            >
              <text
                x="0"
                y="148"
                textLength="1000"
                lengthAdjust="spacingAndGlyphs"
                className={styles.footerWordmarkText}
              >
                SOFTCHAIN
              </text>
            </svg>
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
