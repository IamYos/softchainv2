"use client";

import { Turnstile } from "@marsidev/react-turnstile";

type Props = {
  onToken: (token: string) => void;
  onExpire: () => void;
};

export function TurnstileWidget({ onToken, onExpire }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) {
    return (
      <p style={{ opacity: 0.6, fontSize: "0.8rem" }}>
        Captcha not configured (missing NEXT_PUBLIC_TURNSTILE_SITE_KEY).
      </p>
    );
  }
  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={onToken}
      onExpire={onExpire}
      options={{ theme: "auto", size: "flexible", appearance: "interaction-only" }}
    />
  );
}
