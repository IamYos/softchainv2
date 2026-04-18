import { TemplateContext, RenderedEmail, shell, escapeHtml } from "./shared";

export function cancel(ctx: TemplateContext): RenderedEmail {
  const body = `
    <h1>Your call has been cancelled.</h1>
    <p>The calendar invite has been removed.</p>
    <p><a class="cta" href="${escapeHtml(ctx.siteUrl)}/#closing-cta">Book another time</a></p>
  `;
  const text = [
    `Your Softchain call has been cancelled.`,
    ``,
    `Book another time: ${ctx.siteUrl}/#closing-cta`,
  ].join("\n");
  return { subject: `Your Softchain call was cancelled`, html: shell("Cancelled", body), text };
}
