export interface ServiceableDistrict {
  id: string;
  name: string;
  state: string;
  count: number;
  pincodes: string[];
}

// 1. Ballia, Uttar Pradesh (2 PIN codes)
export const BALLIA_PINCODES: string[] = [
  "277001",
  "277506"
];

// 2. Gorakhpur, Uttar Pradesh (16 PIN codes: 273001 to 273017, excluding 273011)
export const GORAKHPUR_PINCODES: string[] = [
  "273001", "273002", "273003", "273004", "273005", "273006", "273007", "273008",
  "273009", "273010", "273012", "273013", "273014", "273015", "273016", "273017"
];

// 3. Kolkata, West Bengal (100 PIN codes: 700001 to 700108, excluding 700018, 700023, 700044, 700066, 700083, 700096, 700103, 700104)
const kolkataExcluded = new Set([
  "700018", "700023", "700044", "700066", "700083", "700096", "700103", "700104"
]);
export const KOLKATA_PINCODES: string[] = Array.from({ length: 108 }, (_, i) => {
  const code = `700${String(i + 1).padStart(3, "0")}`;
  return code;
}).filter((code) => !kolkataExcluded.has(code));

// 4. Barrackpore, West Bengal (9 PIN codes: 700109 to 700123, excluding 700111, 700112, 700113, 700118, 700121, 700122)
const barrackporeExcluded = new Set([
  "700111", "700112", "700113", "700118", "700121", "700122"
]);
export const BARRACKPORE_PINCODES: string[] = Array.from({ length: 15 }, (_, i) => {
  const code = `700${String(109 + i).padStart(3, "0")}`;
  return code;
}).filter((code) => !barrackporeExcluded.has(code));

// 5. Hooghly, West Bengal (16 PIN codes)
export const HOOGHLY_PINCODES: string[] = [
  "712101", "712103", "712104", "712105", "712123", "712124", "712125",
  "712136", "712137", "712201", "712202", "712203", "712204", "712221",
  "712223", "712224"
];

// 6. Howrah, West Bengal (15 PIN codes)
export const HOWRAH_PINCODES: string[] = [
  "711101", "711102", "711104", "711105", "711106", "711107", "711108",
  "711109", "711110", "711111", "711112", "711113", "711183", "711302",
  "711403"
];

// 7. Ranchi, Jharkhand (3 PIN codes)
export const RANCHI_PINCODES: string[] = [
  "834001",
  "834002",
  "834003"
];

export const SERVICEABLE_DISTRICTS: ServiceableDistrict[] = [
  {
    id: "dist-kolkata",
    name: "Kolkata",
    state: "West Bengal",
    count: KOLKATA_PINCODES.length,
    pincodes: KOLKATA_PINCODES,
  },
  {
    id: "dist-howrah",
    name: "Howrah",
    state: "West Bengal",
    count: HOWRAH_PINCODES.length,
    pincodes: HOWRAH_PINCODES,
  },
  {
    id: "dist-hooghly",
    name: "Hooghly",
    state: "West Bengal",
    count: HOOGHLY_PINCODES.length,
    pincodes: HOOGHLY_PINCODES,
  },
  {
    id: "dist-barrackpore",
    name: "Barrackpore",
    state: "West Bengal",
    count: BARRACKPORE_PINCODES.length,
    pincodes: BARRACKPORE_PINCODES,
  },
  {
    id: "dist-gorakhpur",
    name: "Gorakhpur",
    state: "Uttar Pradesh",
    count: GORAKHPUR_PINCODES.length,
    pincodes: GORAKHPUR_PINCODES,
  },
  {
    id: "dist-ballia",
    name: "Ballia",
    state: "Uttar Pradesh",
    count: BALLIA_PINCODES.length,
    pincodes: BALLIA_PINCODES,
  },
  {
    id: "dist-ranchi",
    name: "Ranchi",
    state: "Jharkhand",
    count: RANCHI_PINCODES.length,
    pincodes: RANCHI_PINCODES,
  },
];

// Fast lookup map for all serviceable pincodes
const PINCODE_MAP: Record<string, { city: string; state: string; district: string }> = {};

SERVICEABLE_DISTRICTS.forEach((dist) => {
  dist.pincodes.forEach((pin) => {
    PINCODE_MAP[pin] = {
      city: dist.name,
      state: dist.state,
      district: dist.name,
    };
  });
});

export function isPincodeServiced(pincode: string): boolean {
  if (!pincode) return false;
  const cleanPin = pincode.trim();
  return Boolean(PINCODE_MAP[cleanPin]);
}

export function getPincodeDetails(pincode: string): { city: string; state: string; district: string } | null {
  if (!pincode) return null;
  const cleanPin = pincode.trim();
  return PINCODE_MAP[cleanPin] || null;
}

export function getAllServiceablePincodes(): string[] {
  return Object.keys(PINCODE_MAP);
}
