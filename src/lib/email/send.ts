import { resendClient, fromAddress } from "./resend";

export type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  icsContent?: string;
  icsMethod?: "REQUEST" | "CANCEL";
  replyTo?: string;
};

const ADMIN_NOTIFY_EMAIL = "info@softchain.ae";

// Recipients for admin-facing notifications: the owner plus the shared
// info@ mailbox, deduped in case the owner email IS the info@ address.
export function adminRecipients(ownerEmail: string): string[] {
  if (ownerEmail.trim().toLowerCase() === ADMIN_NOTIFY_EMAIL) return [ownerEmail];
  return [ownerEmail, ADMIN_NOTIFY_EMAIL];
}

export async function sendBookingEmail(args: SendArgs): Promise<{ id: string }> {
  const { to, subject, html, text, icsContent, icsMethod, replyTo } = args;

  const attachments = icsContent
    ? [
        {
          filename: icsMethod === "CANCEL" ? "cancelled.ics" : "invite.ics",
          content: Buffer.from(icsContent, "utf8").toString("base64"),
          contentType: `text/calendar; method=${icsMethod ?? "REQUEST"}; charset=utf-8`,
        },
      ]
    : undefined;

  const { data, error } = await resendClient().emails.send({
    from: fromAddress(),
    to,
    replyTo,
    subject,
    html,
    text,
    attachments,
  });
  if (error) throw new Error(`Resend send failed: ${error.message}`);
  if (!data?.id) throw new Error("Resend returned no message id");
  return { id: data.id };
}
