"use client";

type HeaderNavLinkProps = {
  children: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
};

export function HeaderNavLink({
  children,
  onClick,
  isActive = false,
}: HeaderNavLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`header-nav-link relative flex cursor-pointer items-center justify-center${
        isActive ? " is-active" : ""
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="relative">
        <span className="header-nav-link__label relative z-10">{children}</span>
        <span className="header-nav-link__underline absolute -bottom-1.5 left-0 right-0 h-px" />
      </div>
    </button>
  );
}
