import styles from "./SFBlockBackground.module.css";

type SFBlockBackgroundProps = {
  className?: string;
  rounded?: boolean;
  reveal?: boolean;
};

export function SFBlockBackground({
  className,
  rounded = false,
  reveal = false,
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
