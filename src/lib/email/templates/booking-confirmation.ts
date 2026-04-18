import { TemplateContext, RenderedEmail, shell, metaBlock, formatInTz, contactMethodLabel, escapeHtml } from "./shared";

export function bookingConfirmation(ctx: TemplateContext): RenderedEmail {
  const visitorTime = formatInTz(ctx.startUtc, ctx.visitorTimezone);
  const dubaiTime = formatInTz(ctx.startUtc, ctx.ownerTimezone);
  const method = contactMethodLabel(ctx.contactMethod);
  const joinLine = ctx.contactMethod === "whatsapp"
    ? `We'll reach out to you on WhatsApp at the scheduled time.`
    : `Join here: <a href="${escapeHtml(ctx.meetingLink)}">${escapeHtml(ctx.meetingLink)}</a>`;

  const body = `
    <h1>You're booked, ${escapeHtml(ctx.visitorName.split(" ")[0])}.</h1>
    <p>A 30-minute call with Softchain is confirmed. We've attached a calendar invite.</p>
    ${metaBlock([
      ["When (your time)", visitorTime],
      ["When (Dubai)",     dubaiTime],
      ["Channel",          method],
    ])}
    <p>${joinLine}</p>
    <p class="links">
      Need to change it? <a href="${escapeHtml(ctx.rescheduleUrl)}">Reschedule</a> &middot; <a href="${escapeHtml(ctx.cancelUrl)}">Cancel</a>
    </p>
  `;

  const text = [
    `You're booked, ${ctx.visitorName.split(" ")[0]}.`,
    ``,
    `When (your time): ${visitorTime}`,
    `When (Dubai): ${dubaiTime}`,
    `Channel: ${method}`,
    ``,
    ctx.contactMethod === "whatsapp"
      ? `We'll WhatsApp you at the scheduled time.`
      : `Join: ${ctx.meetingLink}`,
    ``,
    `Reschedule: ${ctx.rescheduleUrl}`,
    `Cancel:     ${ctx.cancelUrl}`,
  ].join("\n");

  return {
    subject: `Your call with Softchain is booked — ${visitorTime}`,
    html: shell("You're booked", body),
    text,
  };
}
