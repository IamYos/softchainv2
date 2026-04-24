import { z } from "zod";

function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

const emailSchema = z.string().email().max(254).transform((s) => s.toLowerCase().trim());
const nameSchema = z.string().trim().min(2).max(120);
const topicSchema = z.string().trim().min(10).max(2000);
const timezoneSchema = z.string().refine(isValidTimeZone, "Invalid IANA timezone");
const companySchema = z.string().trim().max(200).nullable();
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{6,14}$/, "Phone must be in E.164 format (e.g. +14155551212)");

const utcIsoSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "startAtIso must be UTC (end in Z)")
  .refine((s) => !Number.isNaN(new Date(s).getTime()), "Invalid date");

export const createBookingInputSchema = z
  .object({
    visitorName: nameSchema,
    visitorEmail: emailSchema,
    visitorCompany: companySchema,
    topic: topicSchema,
    contactMethod: z.enum(["whatsapp", "zoom", "meet", "teams"]),
    visitorPhone: phoneSchema,
    visitorTimezone: timezoneSchema,
    startAtIso: utcIsoSchema,
    turnstileToken: z.string().min(1),
    website_url: z.string().max(500).optional().default(""),
  })
  ;

export type CreateBookingInput = z.infer<typeof createBookingInputSchema>;
