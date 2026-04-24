import Fuse from "fuse.js";
import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";
import type { CountryCode } from "libphonenumber-js/min";

export type Country = {
  code: CountryCode;
  name: string;
  dialCode: string;
  aliases: string[];
};

// Pinned at the top of the picker, in this exact order.
export const PRIMARY_CODES: CountryCode[] = ["AE", "SA", "LB", "US", "FR"];

// Common short-forms and colloquial names we want the search to match.
// Keyed by ISO-3166-1 alpha-2. Keep entries lowercase.
const ALIASES: Partial<Record<string, string[]>> = {
  AE: ["uae", "emirates", "dubai", "abu dhabi"],
  SA: ["ksa", "saudi", "riyadh", "jeddah"],
  LB: ["beirut"],
  US: ["usa", "america", "united states", "states"],
  GB: ["uk", "britain", "england", "scotland", "wales", "london"],
  FR: ["paris", "french"],
  DE: ["deutschland", "berlin"],
  NL: ["holland", "dutch", "amsterdam"],
  KR: ["south korea", "korea", "rok", "seoul"],
  KP: ["north korea", "dprk", "pyongyang"],
  CN: ["china", "prc", "mainland china", "beijing", "shanghai"],
  TW: ["taiwan", "roc", "taipei"],
  RU: ["russia", "moscow"],
  EG: ["egypt", "cairo"],
  MA: ["morocco", "casablanca", "rabat"],
  DZ: ["algeria", "algiers"],
  TN: ["tunisia", "tunis"],
  JO: ["jordan", "amman"],
  IQ: ["iraq", "baghdad"],
  SY: ["syria", "damascus"],
  PS: ["palestine", "gaza", "west bank"],
  YE: ["yemen", "sana'a"],
  OM: ["oman", "muscat"],
  QA: ["qatar", "doha"],
  KW: ["kuwait"],
  BH: ["bahrain", "manama"],
  LY: ["libya", "tripoli"],
  SD: ["sudan", "khartoum"],
  MR: ["mauritania"],
  SO: ["somalia", "mogadishu"],
  IR: ["iran", "persia", "tehran"],
  TR: ["turkey", "istanbul", "ankara"],
  IL: ["israel", "tel aviv"],
  IN: ["india", "mumbai", "delhi", "bombay", "bangalore"],
  PK: ["pakistan", "karachi", "islamabad"],
  BD: ["bangladesh", "dhaka"],
  MM: ["burma", "myanmar", "yangon", "rangoon"],
  CZ: ["czech republic", "czechia", "prague"],
  CD: ["congo", "dr congo", "zaire", "kinshasa"],
  CG: ["congo republic", "brazzaville"],
  CI: ["ivory coast", "cote d'ivoire", "abidjan"],
  JP: ["japan", "tokyo"],
  SG: ["singapore"],
  MY: ["malaysia", "kuala lumpur"],
  TH: ["thailand", "bangkok"],
  VN: ["vietnam", "hanoi", "ho chi minh", "saigon"],
  ID: ["indonesia", "jakarta", "bali"],
  PH: ["philippines", "manila"],
  AU: ["australia", "sydney", "melbourne"],
  NZ: ["new zealand", "auckland", "wellington"],
  CA: ["canada", "toronto", "montreal", "vancouver"],
  MX: ["mexico", "mexico city"],
  BR: ["brazil", "sao paulo", "rio"],
  AR: ["argentina", "buenos aires"],
  CL: ["chile", "santiago"],
  CO: ["colombia", "bogota"],
  PE: ["peru", "lima"],
  ZA: ["south africa", "johannesburg", "cape town"],
  NG: ["nigeria", "lagos", "abuja"],
  KE: ["kenya", "nairobi"],
  ET: ["ethiopia", "addis ababa"],
  GH: ["ghana", "accra"],
  ES: ["spain", "madrid", "barcelona"],
  IT: ["italy", "rome", "milan"],
  PT: ["portugal", "lisbon"],
  GR: ["greece", "athens"],
  SE: ["sweden", "stockholm"],
  NO: ["norway", "oslo"],
  DK: ["denmark", "copenhagen"],
  FI: ["finland", "helsinki"],
  CH: ["switzerland", "zurich", "geneva"],
  AT: ["austria", "vienna"],
  BE: ["belgium", "brussels"],
  IE: ["ireland", "dublin"],
  PL: ["poland", "warsaw"],
  UA: ["ukraine", "kyiv", "kiev"],
  RO: ["romania", "bucharest"],
  HU: ["hungary", "budapest"],
};

function regionName(code: string): string {
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}

export const ALL_COUNTRIES: Country[] = getCountries()
  .map((code) => ({
    code,
    name: regionName(code),
    dialCode: getCountryCallingCode(code),
    aliases: ALIASES[code] ?? [],
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const PRIMARY_COUNTRIES: Country[] = PRIMARY_CODES
  .map((code) => ALL_COUNTRIES.find((c) => c.code === code))
  .filter((c): c is Country => c !== undefined);

const countriesFuse = new Fuse(ALL_COUNTRIES, {
  // Weighted so exact ISO matches beat partial name matches, and short-form
  // aliases like "usa" or "uae" hit before coincidental country name fragments.
  keys: [
    { name: "code", weight: 3 },
    { name: "name", weight: 2 },
    { name: "aliases", weight: 2 },
    { name: "dialCode", weight: 1 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 1,
});

export function searchCountries(query: string): Country[] {
  const q = query.trim();
  if (!q) return ALL_COUNTRIES;
  // Allow users to type "+961" or "961" and still find LB.
  const numeric = q.replace(/^\+/, "");
  if (/^\d+$/.test(numeric)) {
    return ALL_COUNTRIES.filter((c) => c.dialCode.startsWith(numeric));
  }
  return countriesFuse.search(q).map((r) => r.item);
}

export function findCountryByCode(code: string): Country | undefined {
  return ALL_COUNTRIES.find((c) => c.code === code);
}
