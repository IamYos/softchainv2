import { TemplateContext, RenderedEmail, shell, formatInTz, contactMethodLabel, escapeHtml } from "./shared";

export function reminder24h(ctx: TemplateContext): RenderedEmail {
  const visitorTime = formatInTz(ctx.startUtc, ctx.visitorTimezone);
  const joinLine = ctx.contactMethod === "whatsapp"
    ? `We'll reach out on WhatsApp at the scheduled time.`
    : `Join: <a href="${escapeHtml(ctx.meetingLink)}">${escapeHtml(ctx.meetingLink)}</a>`;
  const body = `
    <h1>Your call with Softchain is tomorrow.</h1>
    <p>Just a reminder — ${escapeHtml(contactMethodLabel(ctx.contactMethod))} call at <strong>${escapeHtml(visitorTime)}</strong>.</p>
    <p>${joinLine}</p>
    <p class="links">
      <a href="${escapeHtml(ctx.rescheduleUrl)}">Reschedule</a> &middot; <a href="${escapeHtml(ctx.cancelUrl)}">Cancel</a>
    </p>
  `;
  const text = [
    `Your call with Softchain is tomorrow.`,
    ``,
    `${contactMethodLabel(ctx.contactMethod)} at ${visitorTime}.`,
    ctx.contactMethod === "whatsapp" ? `We'll WhatsApp you.` : `Join: ${ctx.meetingLink}`,
    ``,
    `Reschedule: ${ctx.rescheduleUrl}`,
    `Cancel: ${ctx.cancelUrl}`,
  ].join("\n");
  return { subject: `Reminder: your Softchain call is tomorrow at ${visitorTime}`, html: shell("Tomorrow", body), text };
}
