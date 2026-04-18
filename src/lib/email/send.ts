import { resendClient, fromAddress } from "./resend";

export type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
  icsContent?: string;
  icsMethod?: "REQUEST" | "CANCEL";
};

export async function sendBookingEmail(args: SendArgs): Promise<{ id: string }> {
  const { to, subject, html, text, icsContent, icsMethod } = args;

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
    subject,
    html,
    text,
    attachments,
  });
  if (error) throw new Error(`Resend send failed: ${error.message}`);
  if (!data?.id) throw new Error("Resend returned no message id");
  return { id: data.id };
}
