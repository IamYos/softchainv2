import Image from "next/image";
import { PageContainer } from "@/components/marketing/PageContainer";

const PLATFORM_LINKS = ["Software Engineering", "AI Systems"];
const COMPANY_LINKS = ["Company Profile", "Global Delivery", "Dubai HQ"];
const LEGAL_LINKS = ["Terms", "Privacy"];

export function Footer() {
  return (
    <footer
      id="footer"
      className="relative border-t border-white/8 bg-[var(--mf-bg-base)] py-16 text-white"
    >
      <PageContainer>
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
          <div>
            <div className="relative h-[34px] w-[148px]">
              <Image
                src="/softchain-logo-white.png"
                alt="Softchain"
                fill
                sizes="148px"
                className="object-contain"
              />
            </div>
            <p className="mt-6 max-w-[32ch] text-base leading-8 text-[var(--mf-text-body)]">
              Choose engineering excellence. Architecture defined. Systems delivered. Operations supported.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[var(--mf-text-muted)]">
              <span className="rounded-full border border-white/10 px-3 py-1">
                Dubai, UAE
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                Founded 2022
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                Global Delivery
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-[var(--mf-text-muted)]">
              Platform
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-[var(--mf-text-body)]">
              {PLATFORM_LINKS.map((item) => (
                <span key={item} className="link-underline w-fit cursor-default">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-[var(--mf-text-muted)]">
              Company
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-[var(--mf-text-body)]">
              {COMPANY_LINKS.map((item) => (
                <span key={item} className="link-underline w-fit cursor-default">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-[var(--mf-text-muted)]">
              Legal
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-[var(--mf-text-body)]">
              {LEGAL_LINKS.map((item) => (
                <span key={item} className="link-underline w-fit cursor-default">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/8 pt-6 text-sm text-[var(--mf-text-dim)]">
          <p>© 2026 Softchain. Software engineering, AI systems, and infrastructure delivery.</p>
        </div>
      </PageContainer>
    </footer>
  );
}
