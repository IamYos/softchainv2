"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ScrambleTextReveal } from "@/components/marketing/ScrambleTextReveal";
import { useLenis } from "@/components/marketing/SmoothScroll";
import {
  getHeaderNavHref,
  HEADER_MENU_SECONDARY_ITEMS,
  resolveHeaderNavItem,
  type HeaderNavItem,
  type MarketingPageContext,
} from "@/components/marketing/header/navigation";
import styles from "./SFPostFrame.module.css";

type SFFooterProps = {
  currentPage: MarketingPageContext;
};

export function SFFooter({ currentPage }: SFFooterProps) {
  const lenis = useLenis();
  const router = useRouter();

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    item: HeaderNavItem,
  ) => {
    // Let modified clicks (cmd/ctrl/middle/shift) follow the visible href so
    // "open in new tab" / new window still work as a normal link.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
      return;
    }
    event.preventDefault();

    const resolved = resolveHeaderNavItem(item, currentPage);
    if (resolved.kind === "scroll-top") {
      lenis?.scrollTo(0, { duration: 1 });
      return;
    }
    if (resolved.kind === "scroll") {
      lenis?.scrollTo(`#${resolved.target}`, { duration: 1.2 });
      return;
    }
    router.push(resolved.href);
  };

  return (
    <footer id="footer" className={`${styles.sectionRoot} ${styles.footerSection}`}>
      <div className={styles.wrapper} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div
          className={styles.footerBlock}
          data-header-hide-zone="footer"
          data-softchain-cursor-rgb="255, 88, 65"
        >
          <div className={styles.footerBrandRow}>
            <div className={styles.footerBrandLogo}>
              <Image
                src="/softchain-logo-orange.png"
                alt="Softchain"
                fill
                sizes="148px"
                className={styles.footerBrandLogoImage}
              />
            </div>
          </div>

          <div className={styles.footerTopGrid}>
            <div className={styles.footerSecondaryColumn}>
              <ul className={`${styles.footerNav} ${styles.footerNavSecondary}`}>
                {HEADER_MENU_SECONDARY_ITEMS.map((item) => (
                  <li key={item.label} className={`${styles.footerNavItem} ${styles.p2}`}>
                    <a
                      href={getHeaderNavHref(item, currentPage)}
                      onClick={(event) => handleNavClick(event, item)}
                    >
                      {item.label}
                    </a>
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

          <div className={styles.footerTitle}>
            <ScrambleTextReveal
              as="div"
              lines={["SOFTCHAIN"]}
              className={styles.footerWordmarkText}
              loopClassName="block w-full"
              lineClassName="block max-w-full whitespace-nowrap"
              resolvedColor="#ff5841"
              scrambleColors={["#ff5841", "#b9b9b9"]}
              fitToContainer
              fitMode="width"
              minFontSizePx={36}
              maxFontSizePx={280}
              rootMargin="-5% 0px"
            />
          </div>

          <div className={styles.footerCopy}>
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
