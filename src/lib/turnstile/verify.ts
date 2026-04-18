export async function verifyTurnstile(token: string, remoteIp?: string): Promise<boolean> {
  // Dev bypass: accept "dev-bypass" only outside production. Matches the
  // TurnstileWidget's auto-issued sentinel when NEXT_PUBLIC_TURNSTILE_SITE_KEY
  // is unset. Prevents local dev from getting stuck with an un-submittable form.
  if (token === "dev-bypass" && process.env.NODE_ENV !== "production") {
    return true;
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error("Missing TURNSTILE_SECRET_KEY");

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}
