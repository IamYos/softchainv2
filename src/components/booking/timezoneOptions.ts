import Fuse from "fuse.js";
import { getCountryForTimezone } from "countries-and-timezones";

export type TimezoneOption = {
  value: string;
  label: string;
  city: string;
  country: string | null;
  countryCode: string | null;
  aliases: string[];
};

// Curated list of common business timezones, sorted by UTC offset then label.
// Kept hand-picked because IANA's full set (~500) is overwhelming when
// scanned and most visitors are auto-detected anyway. The search below
// matches city, country, and alternate names for forgiving fuzzy lookup.
type RawOption = { value: string; label: string; city: string; aliases?: string[] };

const RAW: RawOption[] = [
  { value: "Pacific/Honolulu",       label: "Honolulu (GMT-10)",                 city: "Honolulu" },
  { value: "America/Anchorage",      label: "Anchorage (GMT-9)",                 city: "Anchorage" },
  { value: "America/Los_Angeles",    label: "Los Angeles (GMT-8/-7)",            city: "Los Angeles", aliases: ["la", "san francisco", "sf", "seattle", "pst", "pdt", "pacific time"] },
  { value: "America/Denver",         label: "Denver (GMT-7/-6)",                 city: "Denver", aliases: ["mst", "mdt", "mountain time"] },
  { value: "America/Chicago",        label: "Chicago (GMT-6/-5)",                city: "Chicago", aliases: ["cst", "cdt", "central time", "dallas", "houston"] },
  { value: "America/New_York",       label: "New York (GMT-5/-4)",               city: "New York", aliases: ["nyc", "ny", "boston", "miami", "atlanta", "est", "edt", "eastern time"] },
  { value: "America/Halifax",        label: "Halifax (GMT-4/-3)",                city: "Halifax", aliases: ["atlantic time"] },
  { value: "America/Sao_Paulo",      label: "São Paulo (GMT-3)",                 city: "São Paulo", aliases: ["sao paulo", "rio", "brasilia"] },
  { value: "Atlantic/Azores",        label: "Azores (GMT-1/0)",                  city: "Azores" },
  { value: "UTC",                    label: "UTC (GMT+0)",                       city: "UTC", aliases: ["gmt", "zulu"] },
  { value: "Europe/London",          label: "London (GMT+0/+1)",                 city: "London", aliases: ["bst", "uk time"] },
  { value: "Europe/Lisbon",          label: "Lisbon (GMT+0/+1)",                 city: "Lisbon", aliases: ["porto"] },
  { value: "Europe/Paris",           label: "Paris (GMT+1/+2)",                  city: "Paris", aliases: ["cet", "cest", "central european time"] },
  { value: "Europe/Berlin",          label: "Berlin (GMT+1/+2)",                 city: "Berlin", aliases: ["munich", "frankfurt", "hamburg"] },
  { value: "Europe/Madrid",          label: "Madrid (GMT+1/+2)",                 city: "Madrid", aliases: ["barcelona", "valencia"] },
  { value: "Europe/Rome",            label: "Rome (GMT+1/+2)",                   city: "Rome", aliases: ["milan", "florence", "naples"] },
  { value: "Africa/Cairo",           label: "Cairo (GMT+2/+3)",                  city: "Cairo", aliases: ["alexandria"] },
  { value: "Europe/Athens",          label: "Athens (GMT+2/+3)",                 city: "Athens", aliases: ["thessaloniki"] },
  { value: "Europe/Istanbul",        label: "Istanbul (GMT+3)",                  city: "Istanbul", aliases: ["ankara", "izmir"] },
  { value: "Europe/Moscow",          label: "Moscow (GMT+3)",                    city: "Moscow", aliases: ["st petersburg"] },
  { value: "Asia/Beirut",            label: "Beirut (GMT+2/+3)",                 city: "Beirut" },
  { value: "Asia/Damascus",          label: "Damascus (GMT+3)",                  city: "Damascus" },
  { value: "Asia/Riyadh",            label: "Riyadh (GMT+3)",                    city: "Riyadh", aliases: ["jeddah", "ksa", "saudi"] },
  { value: "Asia/Qatar",             label: "Doha (GMT+3)",                      city: "Doha", aliases: ["qatar"] },
  { value: "Asia/Kuwait",            label: "Kuwait (GMT+3)",                    city: "Kuwait City", aliases: ["kuwait"] },
  { value: "Asia/Bahrain",           label: "Manama (GMT+3)",                    city: "Manama", aliases: ["bahrain"] },
  { value: "Asia/Baghdad",           label: "Baghdad (GMT+3)",                   city: "Baghdad", aliases: ["iraq"] },
  { value: "Asia/Dubai",             label: "Dubai (GMT+4)",                     city: "Dubai", aliases: ["abu dhabi", "uae", "emirates"] },
  { value: "Asia/Muscat",            label: "Muscat (GMT+4)",                    city: "Muscat", aliases: ["oman"] },
  { value: "Asia/Tehran",            label: "Tehran (GMT+3:30/+4:30)",           city: "Tehran", aliases: ["iran", "persia"] },
  { value: "Asia/Karachi",           label: "Karachi (GMT+5)",                   city: "Karachi", aliases: ["islamabad", "lahore", "pakistan"] },
  { value: "Asia/Kolkata",           label: "Mumbai / Delhi (GMT+5:30)",         city: "Mumbai", aliases: ["mumbai", "delhi", "bombay", "bangalore", "calcutta", "india", "ist"] },
  { value: "Asia/Dhaka",             label: "Dhaka (GMT+6)",                     city: "Dhaka", aliases: ["bangladesh"] },
  { value: "Asia/Bangkok",           label: "Bangkok (GMT+7)",                   city: "Bangkok", aliases: ["thailand", "phuket"] },
  { value: "Asia/Singapore",         label: "Singapore (GMT+8)",                 city: "Singapore", aliases: ["sgt"] },
  { value: "Asia/Shanghai",          label: "Shanghai (GMT+8)",                  city: "Shanghai", aliases: ["china", "beijing", "shenzhen", "guangzhou"] },
  { value: "Asia/Hong_Kong",         label: "Hong Kong (GMT+8)",                 city: "Hong Kong", aliases: ["hk", "hkt"] },
  { value: "Asia/Taipei",            label: "Taipei (GMT+8)",                    city: "Taipei", aliases: ["taiwan"] },
  { value: "Asia/Tokyo",             label: "Tokyo (GMT+9)",                     city: "Tokyo", aliases: ["osaka", "kyoto", "japan", "jst"] },
  { value: "Asia/Seoul",             label: "Seoul (GMT+9)",                     city: "Seoul", aliases: ["korea", "busan"] },
  { value: "Australia/Perth",        label: "Perth (GMT+8)",                     city: "Perth" },
  { value: "Australia/Adelaide",     label: "Adelaide (GMT+9:30/+10:30)",        city: "Adelaide" },
  { value: "Australia/Sydney",       label: "Sydney (GMT+10/+11)",               city: "Sydney", aliases: ["melbourne", "brisbane", "canberra", "australia"] },
  { value: "Pacific/Auckland",       label: "Auckland (GMT+12/+13)",             city: "Auckland", aliases: ["new zealand", "wellington", "nzst"] },
];

function lookupCountry(tz: string): { name: string | null; code: string | null } {
  try {
    const c = getCountryForTimezone(tz);
    if (!c) return { name: null, code: null };
    return { name: c.name, code: c.id };
  } catch {
    return { name: null, code: null };
  }
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = RAW.map((r) => {
  const c = lookupCountry(r.value);
  return {
    value: r.value,
    label: r.label,
    city: r.city,
    country: c.name,
    countryCode: c.code,
    aliases: r.aliases ?? [],
  };
});

export function isKnownTimezone(tz: string): boolean {
  return TIMEZONE_OPTIONS.some((o) => o.value === tz);
}

const fuse = new Fuse(TIMEZONE_OPTIONS, {
  // Match city/country first, then aliases and the IANA value as a fallback.
  keys: [
    { name: "city", weight: 3 },
    { name: "country", weight: 3 },
    { name: "aliases", weight: 2 },
    { name: "label", weight: 1 },
    { name: "value", weight: 1 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

export function searchTimezones(query: string): TimezoneOption[] {
  const q = query.trim();
  if (!q) return TIMEZONE_OPTIONS;
  return fuse.search(q).map((r) => r.item);
}
