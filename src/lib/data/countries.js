// ═══ CANONICAL COUNTRY LIST ═══
// 20 countries — matches RobicDirect's TRACKED_COUNTRIES for data parity.
// Geographic groups used for pill rendering (no more unreadable 20-pill blobs).

export const COUNTRIES = [
  // Americas
  { code: "US", name: "United States",  authority: "FDA",        flag: "🇺🇸", region: "Americas" },
  { code: "CA", name: "Canada",         authority: "Health Canada", flag: "🇨🇦", region: "Americas" },
  { code: "BR", name: "Brazil",         authority: "ANVISA",     flag: "🇧🇷", region: "Americas" },
  { code: "MX", name: "Mexico",         authority: "COFEPRIS",   flag: "🇲🇽", region: "Americas" },
  // Europe
  { code: "EU", name: "European Union", authority: "EMA",        flag: "🇪🇺", region: "Europe" },
  { code: "UK", name: "United Kingdom", authority: "MHRA",       flag: "🇬🇧", region: "Europe" },
  { code: "DE", name: "Germany",        authority: "BfArM",      flag: "🇩🇪", region: "Europe" },
  { code: "FR", name: "France",         authority: "ANSM",       flag: "🇫🇷", region: "Europe" },
  { code: "IT", name: "Italy",          authority: "AIFA",       flag: "🇮🇹", region: "Europe" },
  { code: "ES", name: "Spain",          authority: "AEMPS",      flag: "🇪🇸", region: "Europe" },
  { code: "CH", name: "Switzerland",    authority: "Swissmedic", flag: "🇨🇭", region: "Europe" },
  { code: "RU", name: "Russia",         authority: "Roszdravnadzor", flag: "🇷🇺", region: "Europe" },
  // APAC
  { code: "JP", name: "Japan",          authority: "PMDA",       flag: "🇯🇵", region: "APAC" },
  { code: "CN", name: "China",          authority: "NMPA",       flag: "🇨🇳", region: "APAC" },
  { code: "KR", name: "South Korea",    authority: "MFDS",       flag: "🇰🇷", region: "APAC" },
  { code: "AU", name: "Australia",      authority: "TGA",        flag: "🇦🇺", region: "APAC" },
  { code: "IN", name: "India",          authority: "CDSCO",      flag: "🇮🇳", region: "APAC" },
  // Middle East & Other
  { code: "IL", name: "Israel",         authority: "MOH",        flag: "🇮🇱", region: "Middle East" },
  { code: "SA", name: "Saudi Arabia",   authority: "SFDA",       flag: "🇸🇦", region: "Middle East" },
  { code: "TR", name: "Turkey",         authority: "TITCK",      flag: "🇹🇷", region: "Middle East" },
];

export const COUNTRY_CODES = COUNTRIES.map(c => c.code);

export const COUNTRY_BY_CODE = Object.fromEntries(COUNTRIES.map(c => [c.code, c]));

export const REGIONS = ["Americas", "Europe", "APAC", "Middle East"];

export const MARKET_VALUE_INDEX = {
  US: 100, EU: 85, JP: 70, CN: 65, DE: 60, UK: 55,
  FR: 50,  IT: 45, CA: 42, ES: 40, KR: 38, CH: 35,
  AU: 32,  BR: 30, IN: 25, MX: 22, IL: 22, RU: 20,
  SA: 18,  TR: 15,
};

export function getCountry(code) {
  return COUNTRY_BY_CODE[code] || { code, name: code, authority: code, flag: "🌐", region: "Other" };
}

export function getMarketValue(code) {
  return MARKET_VALUE_INDEX[code] ?? 10;
}
