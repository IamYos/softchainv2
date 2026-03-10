"use client";

type HeaderMobileMenuButtonProps = {
  onClick: () => void;
  isOpen: boolean;
  className?: string;
};

export function HeaderMobileMenuButton({
  onClick,
  isOpen,
  className = "",
}: HeaderMobileMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[44px] min-w-[44px] items-center justify-center cursor-pointer p-2 ${className}`}
      style={{ color: "var(--header-text)" }}
      aria-label="Open menu"
      aria-expanded={isOpen}
    >
      <span className="flex flex-col gap-[5px]">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="block h-[2px] w-5 rounded-full"
            style={{ backgroundColor: "currentColor" }}
          />
        ))}
      </span>
    </button>
  );
}
