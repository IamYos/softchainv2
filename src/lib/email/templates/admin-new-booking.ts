import { TemplateContext, RenderedEmail, shell, metaBlock, formatInTz, contactMethodLabel, escapeHtml } from "./shared";

export function adminNewBooking(ctx: TemplateContext & { visitorPhone?: string | null; visitorCompany?: string | null }): RenderedEmail {
  const dubaiTime = formatInTz(ctx.startUtc, ctx.ownerTimezone);
  const body = `
    <h1>New booking</h1>
    <p><strong>${escapeHtml(ctx.visitorName)}</strong> booked a call.</p>
    ${metaBlock([
      ["When (Dubai)", dubaiTime],
      ["Email",        ctx.visitorEmail],
      ["Company",      ctx.visitorCompany ?? "—"],
      ["Channel",      contactMethodLabel(ctx.contactMethod)],
      ["Phone",        ctx.visitorPhone ?? "—"],
    ])}
    <p><span class="label">Topic</span><br>${escapeHtml(ctx.topic)}</p>
  `;
  const text = [
    `New booking: ${ctx.visitorName}`,
    `When (Dubai): ${dubaiTime}`,
    `Email: ${ctx.visitorEmail}`,
    `Company: ${ctx.visitorCompany ?? "—"}`,
    `Channel: ${contactMethodLabel(ctx.contactMethod)}`,
    `Phone: ${ctx.visitorPhone ?? "—"}`,
    ``,
    `Topic:`,
    ctx.topic,
  ].join("\n");
  return { subject: `New booking: ${ctx.visitorName} — ${dubaiTime}`, html: shell("New booking", body), text };
}
