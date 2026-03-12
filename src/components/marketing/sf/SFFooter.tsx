"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./SFPostFrame.module.css";

const FOOTER_LINKS = {
  platform: [{ label: "Overview", href: "#sf-solutions" }],
  services: [
    { label: "Software Engineering", href: "#sf-solutions" },
    { label: "AI Systems", href: "#sf-solutions" },
    { label: "Infrastructure", href: "#sf-solutions" },
    { label: "Mobile Delivery", href: "#sf-solutions" },
  ],
  company: [
    { label: "Company Profile", href: "#sf-insights" },
    { label: "Global Delivery", href: "#sf-insights" },
  ],
} as const;

export function SFFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(Boolean(email.trim()));
  };

  return (
    <footer id="footer" className={`${styles.sectionRoot} ${styles.footerSection}`}>
      <div className={styles.wrapper}>
        <div className={styles.newsletterForm}>
          <div className={styles.newsletterShell}>
            <form className={styles.newsletterInner} onSubmit={handleSubmit}>
              <label htmlFor="newsletter-email" className={`${styles.newsletterLabel} ${styles.p}`}>
                Sign up for updates
              </label>
              <input
                id="newsletter-email"
                className={styles.newsletterInput}
                placeholder="Enter your email address"
                type="email"
                value={email}
                onChange={(event) => {
                  setSubscribed(false);
                  setEmail(event.target.value);
                }}
              />
              <button
                type="submit"
                className={`${styles.monoPill} ${styles.newsletterSubmit} ${styles.p}`}
              >
                Subscribe
              </button>
            </form>
            {subscribed ? (
              <p className={`${styles.newsletterSuccess} ${styles.p}`}>
                Added. We will only send relevant updates.
              </p>
            ) : null}
          </div>
        </div>

        <div className={styles.footerBlock}>
          <div className={styles.footerBlockContent}>
            <Link href="/" className={styles.footerLogo} aria-label="Softchain home">
              <div className="relative h-full w-full">
                <Image
                  src="/softchain-logo-white.png"
                  alt="Softchain"
                  fill
                  sizes="160px"
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <ul className={styles.footerNav}>
              {FOOTER_LINKS.platform.map((item) => (
                <li key={item.label} className={`${styles.footerNavItem} ${styles.p2}`}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>

            <ul className={`${styles.footerNav} ${styles.footerNavPrimary}`}>
              <li className={`${styles.footerNavItem} ${styles.p2}`}>
                <h4 className={styles.footerSubmenuTitle} aria-level={4}>
                  Solutions<sup>4</sup>
                </h4>
                <ul className={styles.footerSubmenuList}>
                  {FOOTER_LINKS.services.map((item) => (
                    <li key={item.label} className={`${styles.footerSubmenuItem} ${styles.p2}`}>
                      <a href={item.href}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>

            <ul className={`${styles.footerNav} ${styles.footerNavSecondary}`}>
              <li className={`${styles.footerNavItem} ${styles.p2}`}>
                <h4 className={styles.footerSubmenuTitle} aria-level={4}>
                  About<sup>2</sup>
                </h4>
                <ul className={styles.footerSubmenuList}>
                  {FOOTER_LINKS.company.map((item) => (
                    <li key={item.label} className={`${styles.footerSubmenuItem} ${styles.p2}`}>
                      <a href={item.href}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              </li>
              <li className={`${styles.footerNavItem} ${styles.p2}`}>
                <a href="#sf-insights">Insights</a>
              </li>
              <li className={`${styles.footerNavItem} ${styles.p2}`}>
                <a href="#closing-cta">Contact</a>
              </li>
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
                Founded 2022
                <br />
                Licensed in Dubai, UAE
              </p>
            </div>
          </div>

          <div className={`${styles.footerCopy} ${styles.footerCopyMobile}`}>
            <p className={`${styles.footerCopyItem} ${styles.p}`}>©2026 Softchain.</p>
            <a className={`${styles.footerCopyItem} ${styles.p}`} href="#footer">
              Privacy Policy
            </a>
            <a className={`${styles.footerCopyItem} ${styles.p}`} href="#footer">
              Terms of Use
            </a>
            <span className={`${styles.footerCopyItem} ${styles.p}`}>Global delivery</span>
          </div>

          <div className={styles.footerTitle}>
            <span className={styles.footerWordmark}>SOFTCHAIN</span>
          </div>

          <div className={`${styles.footerCopy} ${styles.footerCopyDesktop}`}>
            <p className={`${styles.footerCopyItem} ${styles.p}`}>©2026 Softchain.</p>
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
