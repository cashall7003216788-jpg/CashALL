export interface ServiceableDistrict {
  id: string;
  name: string;
  state: string;
  count: number;
  pincodes: string[];
}

export const BALLIA_PINCODES: string[] = [
  "221701", "221709", "221711", "221712", "221713", "221715", "221716", "221717", "221718",
  "277001", "277121", "277123", "277124", "277201", "277202", "277203", "277204", "277205",
  "277207", "277208", "277209", "277210", "277211", "277213", "277214", "277216", "277219",
  "277301", "277302", "277303", "277304", "277401", "277402", "277403", "277501", "277502",
  "277503", "277504", "277506"
];

export const RANCHI_PINCODES: string[] = [
  "829205", "829208", "829209", "829210", "834001", "834002", "834003", "834004", "834005",
  "834006", "834008", "834009", "834010", "834011", "835101", "835102", "835103", "835202",
  "835204", "835205", "835209", "835210", "835214", "835215", "835216", "835217", "835219",
  "835221", "835222", "835225", "835227", "835234", "835301", "835303", "835325"
];

export const GORAKHPUR_PINCODES: string[] = [
  "273001", "273002", "273003", "273004", "273005", "273006", "273007", "273008", "273009",
  "273010", "273012", "273013", "273014", "273015", "273016", "273017", "273152", "273157",
  "273158", "273163", "273165", "273201", "273202", "273203", "273209", "273211", "273212",
  "273213", "273301", "273303", "273306", "273401", "273402", "273403", "273404", "273405",
  "273406", "273407", "273408", "273409", "273411", "273412", "273413"
];

export const KOLKATA_PINCODES: string[] = [
  "700001", "700002", "700003", "700004", "700005", "700006", "700007", "700008", "700009",
  "700010", "700011", "700012", "700013", "700014", "700015", "700016", "700017", "700018",
  "700019", "700020", "700021", "700022", "700023", "700024", "700025", "700026", "700027",
  "700028", "700029", "700030", "700031", "700032", "700033", "700034", "700035", "700036",
  "700037", "700038", "700040", "700041", "700042", "700043", "700044", "700045", "700046",
  "700047", "700050", "700052", "700053", "700054", "700060", "700061", "700062", "700063",
  "700065", "700066", "700067", "700068", "700069", "700071", "700072", "700073", "700074",
  "700075", "700077", "700078", "700080", "700082", "700085", "700086", "700087", "700088",
  "700089", "700090", "700092", "700094", "700095", "700099", "700107", "700108"
];

export const BARRACKPORE_PINCODES: string[] = [
  "700120", "700121", "700122", "700123"
];

export const SERVICEABLE_DISTRICTS: ServiceableDistrict[] = [
  {
    id: "dist-ballia",
    name: "Ballia",
    state: "Uttar Pradesh",
    count: BALLIA_PINCODES.length,
    pincodes: BALLIA_PINCODES,
  },
  {
    id: "dist-gorakhpur",
    name: "Gorakhpur",
    state: "Uttar Pradesh",
    count: GORAKHPUR_PINCODES.length,
    pincodes: GORAKHPUR_PINCODES,
  },
  {
    id: "dist-kolkata",
    name: "Kolkata",
    state: "West Bengal",
    count: KOLKATA_PINCODES.length,
    pincodes: KOLKATA_PINCODES,
  },
  {
    id: "dist-barrackpore",
    name: "Barrackpore",
    state: "West Bengal",
    count: BARRACKPORE_PINCODES.length,
    pincodes: BARRACKPORE_PINCODES,
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
