import { format } from "date-fns-tz";
import type { ContactMethod } from "../../booking/types";

export type TemplateContext = {
  visitorName: string;
  visitorEmail: string;
  visitorTimezone: string;
  ownerTimezone: string;
  startUtc: Date;
  endUtc: Date;
  contactMethod: ContactMethod;
  meetingLink: string;
  topic: string;
  rescheduleUrl: string;
  cancelUrl: string;
  siteUrl: string;
};

export type RenderedEmail = { subject: string; html: string; text: string };

export function formatInTz(date: Date, tz: string): string {
  return format(date, "EEE dd MMM yyyy, HH:mm (zzz)", { timeZone: tz });
}

export function contactMethodLabel(method: ContactMethod): string {
  switch (method) {
    case "whatsapp": return "WhatsApp";
    case "zoom":     return "Zoom";
    case "meet":     return "Google Meet";
    case "teams":    return "Microsoft Teams";
  }
}

const SHELL_STYLE = `
  body { margin: 0; padding: 24px; background: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #1c1917; line-height: 1.6; }
  .card { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e5e4; padding: 32px; }
  .brand { font-family: ui-monospace, Menlo, monospace; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #78716c; margin-bottom: 24px; }
  h1 { font-size: 22px; font-weight: 600; margin: 0 0 16px; color: #1c1917; }
  p { margin: 0 0 14px; font-size: 15px; }
  .meta { border-top: 1px solid #e7e5e4; border-bottom: 1px solid #e7e5e4; padding: 16px 0; margin: 20px 0; font-size: 14px; }
  .meta-row { display: flex; justify-content: space-between; gap: 12px; padding: 4px 0; }
  .label { color: #78716c; font-family: ui-monospace, Menlo, monospace; font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
  .value { text-align: right; }
  .cta { display: inline-block; padding: 10px 18px; background: #1c1917; color: #ffffff !important; text-decoration: none; font-family: ui-monospace, Menlo, monospace; font-size: 13px; letter-spacing: 0.05em; margin-top: 12px; }
  .links { font-size: 13px; color: #78716c; margin-top: 20px; }
  .links a { color: #1c1917; }
  .footer { font-size: 12px; color: #a8a29e; text-align: center; margin-top: 24px; }
`;

export function shell(title: string, body: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${SHELL_STYLE}</style></head>
<body><div class="card"><div class="brand">Softchain</div>${body}<div class="footer">Softchain, Dubai — info@softchain.ae</div></div></body></html>`;
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export function metaBlock(rows: Array<[string, string]>): string {
  const html = rows.map(([k, v]) =>
    `<div class="meta-row"><span class="label">${escapeHtml(k)}</span><span class="value">${escapeHtml(v)}</span></div>`
  ).join("");
  return `<div class="meta">${html}</div>`;
}
