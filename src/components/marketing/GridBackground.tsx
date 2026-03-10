export function GridBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 softchain-grid"
      style={{
        opacity: "var(--grid-opacity, 0.55)",
        transform: "translate3d(0, 0, 0) scale(var(--grid-scale, 1))",
        willChange: "transform, opacity",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(220,38,38,0.12),transparent_30%)]" />
    </div>
  );
}
