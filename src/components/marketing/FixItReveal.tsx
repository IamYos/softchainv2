const LINES = [
  "Scope the architecture before delivery begins.",
  "Build the system cleanly, with senior execution.",
  "Operate it long after launch without drift.",
];

export function FixItReveal() {
  return (
    <section className="absolute inset-0">
      <div
        className="absolute left-1/2 top-1/2 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.28),rgba(220,38,38,0.18),transparent_68%)] blur-3xl"
        style={{
          opacity: "var(--fix-burst-opacity, 0)",
          transform:
            "translate3d(-50%, -50%, 0) scale(var(--fix-burst-scale, 0.4))",
          willChange: "transform, opacity",
        }}
      />

      <div
        className="absolute left-1/2 z-10 flex w-full max-w-[760px] flex-col items-center px-6 text-center"
        style={{
          top: "var(--fix-text-top, 50%)",
          opacity: "var(--fix-text-opacity, 0)",
          transform:
            "translate3d(-50%, var(--fix-text-offset-y, 80px), 0) scale(var(--fix-text-scale, 1.05))",
          willChange: "transform, opacity",
        }}
      >
        <p
          className="mb-4 text-sm font-medium uppercase text-[var(--mf-text-muted)]"
          style={{ letterSpacing: "0.16em" }}
        >
          Softchain fixes the middle
        </p>
        <h2
          className="text-balance text-4xl font-medium text-white md:text-6xl"
          style={{ letterSpacing: "var(--mf-tracking-section-heading)" }}
        >
          Senior engineering for software, infrastructure, and AI operations.
        </h2>
      </div>

      <div
        className="absolute left-1/2 top-1/2 z-20 w-[min(92vw,820px)] rounded-[28px] border border-white/10 bg-[rgba(17,17,17,0.92)] p-5 backdrop-blur-xl md:p-7"
        style={{
          opacity: "var(--fix-panel-opacity, 0)",
          transform:
            "translate3d(-50%, var(--fix-panel-y, 90px), 0) scale(var(--fix-panel-scale, 0.92))",
          willChange: "transform, opacity",
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-[var(--mf-text-muted)]">
              Operating model
            </p>
            <h3 className="mt-1 text-lg font-medium text-white md:text-2xl">
              Architecture, build, and support in one execution line.
            </h3>
          </div>
          <div className="hidden gap-2 md:flex">
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--mf-text-muted)]">
              Dubai
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--mf-text-muted)]">
              Global Delivery
            </span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {LINES.map((line, index) => (
            <div
              key={line}
              className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"
              style={{
                opacity: "var(--fix-panel-opacity, 0)",
                transform: "translate3d(0, 0, 0)",
                transitionDelay: `${index * 80}ms`,
              }}
            >
              <span className="text-xs text-[var(--mf-text-muted)]">
                0{index + 1}
              </span>
              <p className="mt-3 text-sm leading-6 text-[var(--mf-text-body)]">
                {line}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
