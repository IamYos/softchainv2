import styles from "./NotFoundPage.module.css";

export function NotFoundGlyph() {
  return (
    <svg
      className={styles.glyph}
      viewBox="0 0 520 280"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="2"
        y="2"
        width="516"
        height="276"
        rx="10"
        ry="10"
        fill="none"
        stroke="#202020"
        strokeWidth="2"
      />
      <line
        x1="2"
        y1="44"
        x2="518"
        y2="44"
        stroke="#202020"
        strokeWidth="1.5"
      />
      <circle cx="22" cy="23" r="6" fill="none" stroke="#202020" strokeWidth="1.5" />
      <circle cx="42" cy="23" r="6" fill="none" stroke="#202020" strokeWidth="1.5" />
      <circle cx="62" cy="23" r="6" fill="none" stroke="#202020" strokeWidth="1.5" />

      <text
        x="40"
        y="186"
        fill="#202020"
        fontFamily="var(--font-aux-mono), monospace"
        fontSize="120"
        fontWeight="400"
        letterSpacing="6"
      >
        404
      </text>

      <rect
        className={styles.caret}
        x="298"
        y="92"
        width="22"
        height="106"
        fill="#ff5841"
      />

      <text
        x="40"
        y="232"
        fill="#202020"
        fontFamily="var(--font-aux-mono), monospace"
        fontSize="14"
        letterSpacing="3"
      >
        &gt; path not found
      </text>

      <text
        x="40"
        y="254"
        fill="#202020"
        fontFamily="var(--font-aux-mono), monospace"
        fontSize="11"
        letterSpacing="3"
        opacity="0.55"
      >
        signal: 404 &middot; status: terminated
      </text>
    </svg>
  );
}
