import { TemplateContext, RenderedEmail, shell, escapeHtml } from "./shared";

export function reminder15m(ctx: TemplateContext): RenderedEmail {
  const body = `
    <h1>Starting in 15 minutes.</h1>
    <p>Your Softchain call starts shortly. Join here:</p>
    <p><a class="cta" href="${escapeHtml(ctx.meetingLink)}">Join call</a></p>
    <p>Or copy: ${escapeHtml(ctx.meetingLink)}</p>
  `;
  const text = [
    `Starting in 15 minutes.`,
    ``,
    `Join: ${ctx.meetingLink}`,
  ].join("\n");
  return { subject: `Your Softchain call starts in 15 min`, html: shell("In 15 min", body), text };
}
