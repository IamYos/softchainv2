import { TemplateContext, RenderedEmail, shell, escapeHtml } from "./shared";

export function adminWhatsappPrompt(ctx: TemplateContext & { visitorPhone: string }): RenderedEmail {
  const waLink = `https://wa.me/${ctx.visitorPhone.replace(/[^\d]/g, "")}`;
  const body = `
    <h1>WhatsApp ${escapeHtml(ctx.visitorName)} now.</h1>
    <p>Call starts in 15 minutes. Visitor expects a WhatsApp message.</p>
    <p><span class="label">Phone</span> ${escapeHtml(ctx.visitorPhone)}</p>
    <p><a class="cta" href="${escapeHtml(waLink)}">Open WhatsApp chat</a></p>
    <p><span class="label">Topic</span><br>${escapeHtml(ctx.topic)}</p>
  `;
  const text = [
    `WhatsApp ${ctx.visitorName} now: ${ctx.visitorPhone}`,
    `Open: ${waLink}`,
    ``,
    `Topic: ${ctx.topic}`,
  ].join("\n");
  return { subject: `WhatsApp now: ${ctx.visitorName} (${ctx.visitorPhone})`, html: shell("WhatsApp reminder", body), text };
}
