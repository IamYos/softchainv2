"use client";

import { useEffect } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

type Props = {
  onToken: (token: string) => void;
  onExpire: () => void;
};

// When Turnstile isn't configured locally, auto-issue a "dev-bypass" token so
// the booking form remains submittable. The server-side verifier accepts this
// sentinel only when NODE_ENV !== "production".
function DevBypass({ onToken }: { onToken: (t: string) => void }) {
  useEffect(() => {
    onToken("dev-bypass");
  }, [onToken]);
  return (
    <p style={{ opacity: 0.6, fontSize: "0.8rem" }}>
      Dev mode: captcha bypassed (configure NEXT_PUBLIC_TURNSTILE_SITE_KEY to test real flow).
    </p>
  );
}

export function TurnstileWidget({ onToken, onExpire }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) {
    return <DevBypass onToken={onToken} />;
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
