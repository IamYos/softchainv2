import { HTMLAttributes } from "react";

type PageContainerProps = HTMLAttributes<HTMLDivElement>;

export function PageContainer({
  className = "",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[var(--mf-content-width)] px-6 md:px-14 ${className}`}
      {...props}
    />
  );
}
