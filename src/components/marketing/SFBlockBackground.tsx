import styles from "./SFBlockBackground.module.css";

type SFBlockBackgroundProps = {
  className?: string;
  rounded?: boolean;
  reveal?: boolean;
  variant?: "solid" | "techSignal";
};

export function SFBlockBackground({
  className,
  rounded = false,
  reveal = false,
  variant = "solid",
}: SFBlockBackgroundProps) {
  const rootClassName = [
    styles.root,
    rounded ? styles.rounded : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  const fillClassName = [
    styles.fill,
    variant === "techSignal" ? styles.fillTechSignal : "",
    reveal ? styles.fillReveal : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div aria-hidden="true" className={rootClassName}>
      <div className={fillClassName} />
    </div>
  );
}
