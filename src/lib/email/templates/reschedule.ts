import { TemplateContext, RenderedEmail, shell, metaBlock, formatInTz, escapeHtml } from "./shared";

export function reschedule(ctx: TemplateContext & { wasScheduledFor: Date }): RenderedEmail {
  const newTime = formatInTz(ctx.startUtc, ctx.visitorTimezone);
  const oldTime = formatInTz(ctx.wasScheduledFor, ctx.visitorTimezone);
  const body = `
    <h1>Your call has been rescheduled.</h1>
    ${metaBlock([
      ["Previously", oldTime],
      ["Now",        newTime],
    ])}
    <p>The calendar invite has been updated automatically.</p>
    <p class="links">
      Need another change? <a href="${escapeHtml(ctx.rescheduleUrl)}">Reschedule</a> &middot; <a href="${escapeHtml(ctx.cancelUrl)}">Cancel</a>
    </p>
  `;
  const text = [
    `Your call has been rescheduled.`,
    ``,
    `Previously: ${oldTime}`,
    `Now:        ${newTime}`,
    ``,
    `Reschedule: ${ctx.rescheduleUrl}`,
    `Cancel: ${ctx.cancelUrl}`,
  ].join("\n");
  return { subject: `Your Softchain call was rescheduled to ${newTime}`, html: shell("Rescheduled", body), text };
}
