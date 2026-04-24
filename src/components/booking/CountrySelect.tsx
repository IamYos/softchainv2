"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as flagSvgs from "country-flag-icons/string/3x2";
import type { CountryCode } from "libphonenumber-js/min";
import styles from "./CountrySelect.module.css";
import {
  PRIMARY_COUNTRIES,
  findCountryByCode,
  searchCountries,
  type Country,
} from "./countries";

type Props = {
  value: CountryCode;
  onChange: (code: CountryCode) => void;
};

const FLAGS = flagSvgs as unknown as Record<string, string>;

function FlagMark({ code, className }: { code: string; className?: string }) {
  const svg = FLAGS[code];
  if (!svg) return <span className={className} aria-hidden />;
  return (
    <span
      className={className}
      role="img"
      aria-label={code}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function CountrySelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const current = findCountryByCode(value) ?? PRIMARY_COUNTRIES[0];

  const filtered = useMemo(() => searchCountries(query), [query]);
  const primaryVisible = query.trim() === "" ? PRIMARY_COUNTRIES : [];

  useEffect(() => {
    if (!open) return;

    // Lock body scroll while the modal is open so wheel/touch scrolls stay
    // contained to the list. Restore the prior style on close.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    // Autofocus the search — queueMicrotask so the input is mounted via
    // the portal before we try to focus it.
    queueMicrotask(() => searchRef.current?.focus());

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = (code: CountryCode) => {
    onChange(code);
    setOpen(false);
    setQuery("");
  };

  const onBackdropClick = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    if (!panelRef.current.contains(e.target as Node)) setOpen(false);
  };

  const modal = open ? (
    <div
      className={styles.backdrop}
      onMouseDown={onBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Select country"
    >
      <div ref={panelRef} className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Select country</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            Close
          </button>
        </div>
        <div className={styles.searchRow}>
          <input
            ref={searchRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search — country, code, or dial (e.g. USA, LB, +971)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search countries"
          />
        </div>
        <div className={styles.list} role="listbox">
          {primaryVisible.length > 0 && (
            <>
              {primaryVisible.map((c) => (
                <CountryOption
                  key={`p-${c.code}`}
                  country={c}
                  selected={c.code === value}
                  onSelect={select}
                />
              ))}
              <div className={styles.divider} aria-hidden />
            </>
          )}
          {filtered.length === 0 ? (
            <p className={styles.empty}>No matches</p>
          ) : (
            filtered.map((c) => (
              <CountryOption
                key={c.code}
                country={c}
                selected={c.code === value}
                onSelect={select}
              />
            ))
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Country: ${current.name}, +${current.dialCode}`}
      >
        <FlagMark code={current.code} className={styles.triggerFlag} />
        <span>+{current.dialCode}</span>
        <svg className={styles.caret} viewBox="0 0 10 6" aria-hidden>
          <path
            d="M1 1l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {typeof document !== "undefined" && modal
        ? createPortal(modal, document.body)
        : null}
    </div>
  );
}

function CountryOption({
  country,
  selected,
  onSelect,
}: {
  country: Country;
  selected: boolean;
  onSelect: (code: CountryCode) => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={styles.option}
      onClick={() => onSelect(country.code)}
    >
      <FlagMark code={country.code} className={styles.optionFlag} />
      <span className={styles.optionName}>{country.name}</span>
      <span className={styles.optionIso}>{country.code}</span>
      <span className={styles.optionDial}>+{country.dialCode}</span>
    </button>
  );
}
