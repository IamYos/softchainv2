"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FadeIn } from "@/components/marketing/FadeIn";
import { PageContainer } from "@/components/marketing/PageContainer";

const CAPABILITIES = [
  {
    label: "Web Platforms",
    title: "Operational web products built for real business load.",
    description:
      "Dashboards, client portals, internal systems, automation layers, and public-facing software engineered for production reliability.",
  },
  {
    label: "Mobile Apps",
    title: "Native mobile systems where platform quality matters.",
    description:
      "iOS and Android delivery for internal tools, public products, and secure mobile workflows that cannot be compromised by shortcuts.",
  },
  {
    label: "AI Systems",
    title: "AI features embedded where they create measurable value.",
    description:
      "RAG systems, workflow automation, intelligent interfaces, and private or hybrid inference pipelines selected by capability and deployment constraints.",
  },
  {
    label: "Infrastructure",
    title: "Cloud, on-premise, and hybrid environments managed end to end.",
    description:
      "Provisioning, migrations, networking, observability, security posture, procurement coordination, and ongoing operational support.",
  },
];

export function Capabilities() {
  const [active, setActive] = useState(0);

  return (
    <section id="capabilities" className="relative z-30 border-t border-white/8 py-24">
      <PageContainer>
        <FadeIn>
          <p
            className="mb-3 text-sm uppercase text-[var(--mf-text-muted)]"
            style={{ letterSpacing: "0.16em" }}
          >
            Capabilities
          </p>
          <h2
            className="max-w-[900px] text-balance text-4xl font-medium text-white md:text-6xl"
            style={{ letterSpacing: "var(--mf-tracking-section-heading)" }}
          >
            Engineering work that survives the real world, not just the kickoff.
          </h2>
        </FadeIn>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10% 0px" }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08 },
              },
            }}
            className="relative"
          >
            {CAPABILITIES.map((item, index) => {
              const isActive = index === active;

              return (
                <motion.button
                  key={item.label}
                  type="button"
                  onClick={() => setActive(index)}
                  variants={{
                    hidden: { opacity: 0, x: -12 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex w-full items-center justify-between border-b border-white/8 py-5 text-left"
                >
                  <motion.span
                    animate={{
                      color: isActive ? "#ffffff" : "var(--mf-text-muted)",
                    }}
                    transition={{ duration: 0.25 }}
                    className="text-lg font-medium md:text-xl"
                  >
                    {item.label}
                  </motion.span>
                  <motion.span
                    animate={{
                      width: isActive ? "100%" : "0%",
                      opacity: isActive ? 1 : 0,
                    }}
                    className="absolute bottom-0 left-0 h-px bg-[linear-gradient(90deg,var(--mf-brand-blue),var(--mf-brand-red),#ffffff)]"
                  />
                </motion.button>
              );
            })}
          </motion.div>

          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={CAPABILITIES[active].label}
                initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(2px)" }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-sm uppercase text-[var(--mf-text-muted)]">
                  Delivery Slice
                </p>
                <h3
                  className="mt-4 text-balance text-2xl font-medium text-white md:text-4xl"
                  style={{ letterSpacing: "var(--mf-tracking-subheading)" }}
                >
                  {CAPABILITIES[active].title}
                </h3>
                <p className="mt-5 max-w-[55ch] text-base leading-8 text-[var(--mf-text-body)] md:text-lg">
                  {CAPABILITIES[active].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
