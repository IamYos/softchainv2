"use client";

import { useEffect, useRef, useState } from "react";
import { FadeIn } from "@/components/marketing/FadeIn";
import { PageContainer } from "@/components/marketing/PageContainer";
import { useInView } from "@/components/marketing/useInView";

const CAPABILITIES = [
  {
    label: "Software Design & Engineering",
    title: "Software systems designed and built for real operational load.",
    description:
      "Web platforms, internal systems, custom applications, ERP integration, and native mobile delivery engineered for production reliability.",
  },
  {
    label: "AI Systems",
    title: "AI features embedded where they create measurable value.",
    description:
      "RAG systems, workflow automation, intelligent interfaces, and private or hybrid inference pipelines selected by capability and deployment constraints.",
  },
  {
    label: "IT Infrastructure",
    title: "Cloud, on-premise, and hybrid environments managed end to end.",
    description:
      "Provisioning, migrations, networking, observability, security posture, and resilient day-to-day operations across mixed environments.",
  },
  {
    label: "Technology Management",
    title: "Technology leadership that keeps business operations moving.",
    description:
      "Procurement, digitization planning, vendor coordination, governance, and hands-on advisory support structured around each engagement.",
  },
];

export function Capabilities() {
  const [active, setActive] = useState(0);
  const [displayed, setDisplayed] = useState(0);
  const [panelPhase, setPanelPhase] = useState<"visible" | "exiting" | "pre-enter">("visible");
  const listRef = useRef<HTMLDivElement>(null);
  const panelFrameRef = useRef(0);
  const panelTimerRef = useRef(0);
  const listVisible = useInView(listRef, {
    once: true,
    rootMargin: "-10% 0px",
  });

  useEffect(() => {
    return () => {
      window.clearTimeout(panelTimerRef.current);
      if (panelFrameRef.current) {
        window.cancelAnimationFrame(panelFrameRef.current);
      }
    };
  }, []);

  const handleActivate = (index: number) => {
    if (index === active) {
      return;
    }

    window.clearTimeout(panelTimerRef.current);
    if (panelFrameRef.current) {
      window.cancelAnimationFrame(panelFrameRef.current);
    }

    setActive(index);
    setPanelPhase("exiting");

    panelTimerRef.current = window.setTimeout(() => {
      setDisplayed(index);
      setPanelPhase("pre-enter");
      panelFrameRef.current = window.requestAnimationFrame(() => {
        setPanelPhase("visible");
      });
    }, 180);
  };

  return (
    <section id="capabilities" className="relative z-30 border-t border-white/8 py-24">
      <PageContainer>
        <FadeIn>
          <p
            className="mb-3 text-sm uppercase text-[var(--mf-text-muted)]"
            style={{ letterSpacing: "0.16em" }}
          >
            Solutions
          </p>
          <h2
            className="max-w-[900px] text-balance text-4xl font-medium text-white md:text-6xl"
            style={{ letterSpacing: "var(--mf-tracking-section-heading)" }}
          >
            Engineering work that survives the real world, not just the kickoff.
          </h2>
        </FadeIn>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div ref={listRef} className="relative">
            {CAPABILITIES.map((item, index) => {
              const isActive = index === active;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleActivate(index)}
                  className={`native-fade relative flex w-full items-center justify-between border-b border-white/8 py-5 text-left${
                    listVisible ? " is-visible" : ""
                  }`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <span
                    className="text-lg font-medium md:text-xl"
                    style={{
                      color: isActive ? "#ffffff" : "var(--mf-text-muted)",
                      transition: "color 0.25s ease",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="absolute bottom-0 left-0 h-px bg-[linear-gradient(90deg,var(--mf-brand-blue),var(--mf-brand-red),#ffffff)]"
                    style={{
                      width: isActive ? "100%" : "0%",
                      opacity: isActive ? 1 : 0,
                      transition: "width 0.25s ease, opacity 0.25s ease",
                    }}
                  />
                </button>
              );
            })}
          </div>

          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 md:p-10">
            <div
              className={`capabilities-panel capabilities-panel--${panelPhase}`}
              key={CAPABILITIES[displayed].label}
            >
              <p className="text-sm uppercase text-[var(--mf-text-muted)]">
                Solution Pillar
              </p>
              <h3
                className="mt-4 text-balance text-2xl font-medium text-white md:text-4xl"
                style={{ letterSpacing: "var(--mf-tracking-subheading)" }}
              >
                {CAPABILITIES[displayed].title}
              </h3>
              <p className="mt-5 max-w-[55ch] text-base leading-8 text-[var(--mf-text-body)] md:text-lg">
                {CAPABILITIES[displayed].description}
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
