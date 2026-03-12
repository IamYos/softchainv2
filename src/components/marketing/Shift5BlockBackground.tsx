import styles from "./Shift5BlockBackground.module.css";

type Shift5BlockBackgroundProps = {
  className?: string;
  rounded?: boolean;
  reveal?: boolean;
};

export function Shift5BlockBackground({
  className,
  rounded = false,
  reveal = false,
}: Shift5BlockBackgroundProps) {
  const rootClassName = [
    styles.root,
    rounded ? styles.rounded : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  const fillClassName = [
    styles.fill,
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
