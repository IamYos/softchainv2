type Args = {
  method: "REQUEST" | "CANCEL";
  uid: string;
  sequence: number;
  startUtc: Date;
  endUtc: Date;
  summary: string;
  description: string;
  location: string;
  organizerEmail: string;
  attendeeEmail: string;
  attendeeName: string;
};

function toIcsDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function escape(text: string): string {
  return text.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
}

export function buildIcs(args: Args): string {
  const {
    method,
    uid,
    sequence,
    startUtc,
    endUtc,
    summary,
    description,
    location,
    organizerEmail,
    attendeeEmail,
    attendeeName,
  } = args;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Softchain//Book a Call//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `SEQUENCE:${sequence}`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(startUtc)}`,
    `DTEND:${toIcsDate(endUtc)}`,
    `SUMMARY:${escape(summary)}`,
    `DESCRIPTION:${escape(description)}`,
    `LOCATION:${escape(location)}`,
    `ORGANIZER;CN=Softchain:mailto:${organizerEmail}`,
    `ATTENDEE;CN=${escape(attendeeName)};RSVP=TRUE:mailto:${attendeeEmail}`,
    ...(method === "CANCEL" ? ["STATUS:CANCELLED"] : ["STATUS:CONFIRMED"]),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}
