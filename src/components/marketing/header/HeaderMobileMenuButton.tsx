"use client";

import { CSSProperties } from "react";

type HeaderMobileMenuButtonProps = {
  onClick: () => void;
  isOpen: boolean;
  className?: string;
  style?: CSSProperties;
};

export function HeaderMobileMenuButton({
  onClick,
  isOpen,
  className = "",
  style,
}: HeaderMobileMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`header-menu-button ${className}`}
      style={style}
      data-open={isOpen ? "true" : "false"}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <span className="header-menu-button__lines" aria-hidden="true">
        <span className="header-menu-button__line" />
        <span className="header-menu-button__line" />
      </span>
      <span className="header-menu-button__label header-menu-button__label--open">
        Menu
      </span>
      <span className="header-menu-button__label header-menu-button__label--close">
        Close
      </span>
    </button>
  );
}
