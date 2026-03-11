"use client";

type HeaderDesktopActionsProps = {
  onSecondaryClick: () => void;
  onPrimaryClick: () => void;
  className?: string;
};

export function HeaderDesktopActions({
  onSecondaryClick,
  onPrimaryClick,
  className = "",
}: HeaderDesktopActionsProps) {
  return (
    <div className={`items-center gap-4 ${className}`}>
      <button
        type="button"
        onClick={onSecondaryClick}
        className="frame1-cm-btn"
        style={{
          minHeight: "42px",
          minWidth: "auto",
          padding: "0.5em 1em",
          ["--frame1-cm-bg" as string]: "var(--header-cta-contact-bg)",
          ["--frame1-cm-border" as string]: "var(--header-cta-contact-border)",
          ["--frame1-cm-text" as string]: "var(--header-cta-contact-text)",
          ["--frame1-cm-hover-bg" as string]: "var(--header-cta-contact-hover-bg)",
          ["--frame1-cm-hover-border" as string]:
            "var(--header-cta-contact-hover-border)",
          ["--frame1-cm-hover-text" as string]:
            "var(--header-cta-contact-hover-text)",
          ["--frame1-cm-focus" as string]: "var(--header-cta-contact-focus)",
        }}
      >
        <span>Contact</span>
      </button>
      <button
        type="button"
        onClick={onPrimaryClick}
        className="frame1-cm-btn"
        style={{
          minHeight: "42px",
          minWidth: "auto",
          padding: "0.5em 1em",
          ["--frame1-cm-bg" as string]: "var(--header-cta-book-bg)",
          ["--frame1-cm-border" as string]: "var(--header-cta-book-border)",
          ["--frame1-cm-text" as string]: "var(--header-cta-book-text)",
          ["--frame1-cm-hover-bg" as string]: "var(--header-cta-book-hover-bg)",
          ["--frame1-cm-hover-border" as string]: "var(--header-cta-book-hover-border)",
          ["--frame1-cm-hover-text" as string]: "var(--header-cta-book-hover-text)",
          ["--frame1-cm-focus" as string]: "var(--header-cta-book-focus)",
        }}
      >
        <span>Book a Call</span>
      </button>
    </div>
  );
}
