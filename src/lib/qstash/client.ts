import { Client, Receiver } from "@upstash/qstash";

let cachedClient: Client | null = null;
let cachedReceiver: Receiver | null = null;

export function qstashClient(): Client {
  if (cachedClient) return cachedClient;
  const token = process.env.QSTASH_TOKEN;
  if (!token) throw new Error("Missing QSTASH_TOKEN");
  cachedClient = new Client({ token });
  return cachedClient;
}

export function qstashReceiver(): Receiver {
  if (cachedReceiver) return cachedReceiver;
  const current = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const next = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!current || !next) throw new Error("Missing QSTASH_*_SIGNING_KEY");
  cachedReceiver = new Receiver({ currentSigningKey: current, nextSigningKey: next });
  return cachedReceiver;
}

export async function schedule(args: {
  url: string;
  body: unknown;
  notBefore: Date;
}): Promise<string> {
  const client = qstashClient();
  const res = await client.publishJSON({
    url: args.url,
    body: args.body,
    notBefore: Math.floor(args.notBefore.getTime() / 1000),
  });
  return res.messageId;
}

export async function cancel(messageId: string): Promise<void> {
  const client = qstashClient();
  await client.messages.delete(messageId);
}
