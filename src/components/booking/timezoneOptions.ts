export type TimezoneOption = { value: string; label: string };

// Small curated list of common business timezones, sorted by UTC offset then label.
// Visitors from uncommon zones will almost always be auto-detected correctly;
// this combobox exists as a manual override escape hatch.
export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: "Pacific/Honolulu",       label: "Honolulu (GMT-10)" },
  { value: "America/Anchorage",      label: "Anchorage (GMT-9)" },
  { value: "America/Los_Angeles",    label: "Los Angeles (GMT-8/-7)" },
  { value: "America/Denver",         label: "Denver (GMT-7/-6)" },
  { value: "America/Chicago",        label: "Chicago (GMT-6/-5)" },
  { value: "America/New_York",       label: "New York (GMT-5/-4)" },
  { value: "America/Halifax",        label: "Halifax (GMT-4/-3)" },
  { value: "America/Sao_Paulo",      label: "São Paulo (GMT-3)" },
  { value: "Atlantic/Azores",        label: "Azores (GMT-1/0)" },
  { value: "UTC",                    label: "UTC (GMT+0)" },
  { value: "Europe/London",          label: "London (GMT+0/+1)" },
  { value: "Europe/Lisbon",          label: "Lisbon (GMT+0/+1)" },
  { value: "Europe/Paris",           label: "Paris (GMT+1/+2)" },
  { value: "Europe/Berlin",          label: "Berlin (GMT+1/+2)" },
  { value: "Europe/Madrid",          label: "Madrid (GMT+1/+2)" },
  { value: "Europe/Rome",            label: "Rome (GMT+1/+2)" },
  { value: "Africa/Cairo",           label: "Cairo (GMT+2/+3)" },
  { value: "Europe/Athens",          label: "Athens (GMT+2/+3)" },
  { value: "Europe/Istanbul",        label: "Istanbul (GMT+3)" },
  { value: "Europe/Moscow",          label: "Moscow (GMT+3)" },
  { value: "Asia/Riyadh",            label: "Riyadh (GMT+3)" },
  { value: "Asia/Dubai",             label: "Dubai (GMT+4)" },
  { value: "Asia/Tehran",            label: "Tehran (GMT+3:30/+4:30)" },
  { value: "Asia/Karachi",           label: "Karachi (GMT+5)" },
  { value: "Asia/Kolkata",           label: "Mumbai / Delhi (GMT+5:30)" },
  { value: "Asia/Dhaka",             label: "Dhaka (GMT+6)" },
  { value: "Asia/Bangkok",           label: "Bangkok (GMT+7)" },
  { value: "Asia/Singapore",         label: "Singapore (GMT+8)" },
  { value: "Asia/Shanghai",          label: "Shanghai (GMT+8)" },
  { value: "Asia/Hong_Kong",         label: "Hong Kong (GMT+8)" },
  { value: "Asia/Taipei",            label: "Taipei (GMT+8)" },
  { value: "Asia/Tokyo",             label: "Tokyo (GMT+9)" },
  { value: "Asia/Seoul",             label: "Seoul (GMT+9)" },
  { value: "Australia/Perth",        label: "Perth (GMT+8)" },
  { value: "Australia/Adelaide",     label: "Adelaide (GMT+9:30/+10:30)" },
  { value: "Australia/Sydney",       label: "Sydney (GMT+10/+11)" },
  { value: "Pacific/Auckland",       label: "Auckland (GMT+12/+13)" },
];

export function isKnownTimezone(tz: string): boolean {
  return TIMEZONE_OPTIONS.some((o) => o.value === tz);
}
