export function GridBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 softchain-grid softchain-grid--light"
      style={{
        backgroundColor: "#ffffff",
        ["--softchain-grid-size" as string]: "102px",
        ["--softchain-grid-bg" as string]: "#ffffff",
        opacity: 1,
        willChange: "opacity",
      }}
    />
  );
}
