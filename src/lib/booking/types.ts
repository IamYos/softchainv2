import type { Timestamp } from "firebase-admin/firestore";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type HoursRange = {
  start: string; // "HH:mm" in ownerTimezone
  end: string;
};

export type DefaultHours = Record<DayKey, HoursRange | null>;

export type ContactLinks = {
  zoom: string;
  meet: string;
  teams: string;
  whatsappNumber: string;
};

export type BookingRules = {
  minNoticeHours: number;
  maxLookaheadDays: number;
  slotDurationMinutes: number;
};

export type SettingsDoc = {
  ownerEmail: string;
  ownerTimezone: string;
  defaultHours: DefaultHours;
  contactLinks: ContactLinks;
  rules: BookingRules;
  icsFeedSecret: string;
};

export type AvailabilityException = {
  type: "block" | "extra";
  date: string; // ISO "YYYY-MM-DD" in ownerTimezone
  startTime?: string; // "HH:mm"
  endTime?: string;
  note?: string;
  createdAt: Timestamp;
};

export type ContactMethod = "whatsapp" | "zoom" | "meet" | "teams";

export type BookingStatus = "confirmed" | "cancelled";

export type Booking = {
  visitorName: string;
  visitorEmail: string;
  visitorCompany: string | null;
  topic: string;
  contactMethod: ContactMethod;
  visitorPhone: string | null;
  visitorTimezone: string;
  startAt: Timestamp;
  endAt: Timestamp;
  status: BookingStatus;
  noShow: boolean;
  adminNotes: string | null;
  rescheduleToken: string;
  cancelToken: string;
  icsUid: string;
  icsSequence: number;
  reminderJobIds: {
    h24: string | null;
    m15: string | null;
  };
  previousSlots: Array<{ startAt: Timestamp; endAt: Timestamp }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Slot = {
  startUtc: Date;
  endUtc: Date;
};
